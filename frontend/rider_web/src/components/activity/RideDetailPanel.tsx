import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { downloadRiderReceipt, getRiderRideDetail, submitRiderRating } from "../../api/riderActivity";
import { formatCurrency, formatDate, formatMiles } from "../../utils/formatters";
import styles from "./RideDetailPanel.module.css";

function StaticMap() {
  return (
    <svg viewBox="0 0 320 140" width="100%" height="100%" preserveAspectRatio="none">
      <rect width="320" height="140" fill="#E8F0E4" />
      <path d="M54 38 C110 18, 150 86, 260 102" stroke="#1F2937" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="52" cy="36" r="8" fill="#1A6B45" />
      <rect x="254" y="96" width="12" height="12" rx="2" fill="#111111" />
    </svg>
  );
}

export function RideDetailPanel({
  rideId,
  onClose,
  isMobile = false,
}: {
  rideId: string;
  onClose?: () => void;
  isMobile?: boolean;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const rideQuery = useQuery({
    queryKey: ["rider-ride-detail", rideId],
    queryFn: () => getRiderRideDetail(rideId),
  });

  const rateMutation = useMutation({
    mutationFn: (nextRating: number) => submitRiderRating(rideId, { rating: nextRating }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["rider-ride-detail", rideId] }),
        queryClient.invalidateQueries({ queryKey: ["rider-activity"] }),
      ]);
    },
  });

  if (rideQuery.isLoading) {
    return <div className={styles.stateCard}>Loading ride details...</div>;
  }

  if (rideQuery.isError || !rideQuery.data) {
    return <div className={styles.stateCard}>Could not load this ride.</div>;
  }

  const ride = rideQuery.data;
  const currentRating = ride.rider_rating ?? rating;
  const rated = ride.rider_rating != null || ride.can_rate_driver === false;
  const badgeClass = ride.status === "CANCELLED" ? styles.cancelled : styles.completed;
  const fareClass = ride.status === "CANCELLED" ? `${styles.fare} ${styles.fareMuted}` : styles.fare;

  async function handleDownload() {
    const blob = await downloadRiderReceipt(rideId);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `receipt-${rideId}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.panel}>
      {isMobile ? (
        <div className={styles.mobileHeader}>
          <button type="button" className={styles.backBtn} onClick={() => navigate("/activity")}>
            ← Back
          </button>
          <div className={styles.headerTitle}>Ride details</div>
          <div className={styles.spacer} />
        </div>
      ) : (
        <div className={styles.header}>
          <div className={styles.headerTitle}>Ride details</div>
          {onClose ? <button type="button" className={styles.closeBtn} onClick={onClose}>✕</button> : null}
        </div>
      )}

      <div className={styles.mapCard}>
        <StaticMap />
      </div>

      <div className={styles.statusRow}>
        <span className={`${styles.badge} ${badgeClass}`}>{ride.status === "CANCELLED" ? "Cancelled" : "Completed"}</span>
        <span className={fareClass}>{formatCurrency(ride.fare_amount ?? 0)}</span>
      </div>

      <div className={styles.routeCard}>
        <div className={styles.routeRow}><span className={styles.dot} /><span>{ride.pickup_address}</span></div>
        <div className={styles.connector} />
        <div className={styles.routeRow}><span className={styles.square} /><span>{ride.dropoff_address}</span></div>
      </div>

      <div className={styles.detailsCard}>
        {[
          ["Date", formatDate(ride.created_at)],
          ["Vehicle", `${ride.vehicle_type} · ${ride.vehicle_make} ${ride.vehicle_model}`],
          ["Driver", ride.driver_name],
          ["Duration", `${ride.duration_minutes ?? "—"} min`],
          ["Distance", ride.distance_km != null ? formatMiles(ride.distance_km) : "—"],
          ["Payment", ride.payment_method],
          ["Fare", formatCurrency(ride.fare_amount ?? 0)],
        ].map(([label, value], index, rows) => (
          <div className={styles.detailRow} key={label}>
            <span className={styles.label}>{label}</span>
            <span className={`${styles.value} ${index === rows.length - 1 ? styles.valueAccent : ""}`}>{value}</span>
          </div>
        ))}
      </div>

      {ride.status !== "CANCELLED" ? (
        <div className={styles.ratingCard}>
          <div className={styles.ratingTitle}>
            {ride.rider_rating != null ? "Your rating" : ride.can_rate_driver ? "Rate your driver" : "Rating unavailable"}
          </div>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hover || currentRating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  className={`${styles.starBtn} ${active ? styles.starActive : ""}`}
                  disabled={rated || !ride.can_rate_driver}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              );
            })}
          </div>
          {ride.rider_comment ? <div className={styles.comment}>{ride.rider_comment}</div> : null}
          {!rated && ride.can_rate_driver && rating > 0 ? (
            <button
              type="button"
              className={styles.submitBtn}
              onClick={() => rateMutation.mutate(rating)}
              disabled={rateMutation.isPending}
            >
              {rateMutation.isPending ? "Submitting..." : "Submit rating"}
            </button>
          ) : null}
        </div>
      ) : null}

      {ride.status !== "CANCELLED" ? (
        <button type="button" className={styles.downloadBtn} onClick={() => void handleDownload()}>
          <FileText size={14} />
          Download receipt
        </button>
      ) : null}
    </div>
  );
}
