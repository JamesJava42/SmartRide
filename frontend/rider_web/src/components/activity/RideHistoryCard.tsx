import { useNavigate } from "react-router-dom";

import type { RiderRideHistory } from "../../types/activity";
import { formatCurrency, formatDate, formatDateShort, formatMiles, shortAddress } from "../../utils/formatters";
import styles from "./RideHistoryCard.module.css";

function renderStars(rating: number | null) {
  if (!rating) return null;
  const filled = Math.round(rating);
  return "★★★★★".slice(0, filled) + "☆☆☆☆☆".slice(0, 5 - filled);
}

export function RideHistoryCard({
  ride,
  selected = false,
  onSelect,
  mobile = false,
}: {
  ride: RiderRideHistory;
  selected?: boolean;
  onSelect: () => void;
  mobile?: boolean;
}) {
  const navigate = useNavigate();
  const badgeClass = ride.status === "CANCELLED" ? styles.cancelled : styles.completed;
  const fareClass = ride.status === "CANCELLED" ? `${styles.fare} ${styles.fareMuted}` : styles.fare;
  const meta = `${ride.vehicle_type} · ${ride.driver_name} · ${ride.duration_minutes ?? "—"} min`;

  if (mobile) {
    return (
      <article className={styles.card} onClick={() => navigate(`/activity/${ride.ride_id}`)}>
        <div className={styles.rowBetween}>
          <span className={styles.date}>{formatDateShort(ride.created_at)}</span>
          <div className={styles.rowBetween}>
            <span className={`${styles.badge} ${badgeClass}`}>{ride.status === "CANCELLED" ? "Cancelled" : "Completed"}</span>
            <span className={fareClass}>{formatCurrency(ride.fare_amount ?? 0)}</span>
          </div>
        </div>
        <div className={styles.route}>
          <div className={styles.routeLine}>
            <span className={styles.pickupDot} />
            <span className={styles.truncate}>{ride.pickup_address}</span>
          </div>
          <div className={styles.connector} />
          <div className={styles.routeLine}>
            <span className={styles.dropoffDot} />
            <span className={styles.truncate}>{ride.dropoff_address}</span>
          </div>
        </div>
        <div className={styles.rowBetween}>
          <span className={styles.meta}>{meta}</span>
          <button type="button" className={styles.link} onClick={(event) => { event.stopPropagation(); navigate(`/activity/${ride.ride_id}`); }}>
            View →
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className={`${styles.card} ${selected ? styles.selected : ""}`} onClick={onSelect}>
      <div className={styles.desktopWrap}>
        <div className={`${styles.iconCircle} ${ride.status === "CANCELLED" ? styles.iconCancelled : styles.iconCompleted}`}>
          {ride.status === "CANCELLED" ? "✕" : "✓"}
        </div>
        <div className={styles.desktopMiddle}>
          <div className={styles.date}>{formatDate(ride.created_at)}</div>
          <div className={`${styles.desktopRoute} ${styles.truncate}`}>
            {shortAddress(ride.pickup_address)} → {shortAddress(ride.dropoff_address)}
          </div>
          <div className={styles.desktopMeta}>
            {ride.vehicle_type} · {ride.duration_minutes ?? "—"} min · {ride.distance_km ? formatMiles(ride.distance_km) : "—"} · {ride.driver_name}
          </div>
        </div>
        <div className={styles.desktopRight}>
          <div className={fareClass}>{formatCurrency(ride.fare_amount ?? 0)}</div>
          <div className={`${styles.badge} ${badgeClass}`}>{ride.status === "CANCELLED" ? "Cancelled" : "Completed"}</div>
          {ride.rider_rating ? <div className={styles.stars}>{renderStars(ride.rider_rating)}</div> : null}
        </div>
      </div>
    </article>
  );
}
