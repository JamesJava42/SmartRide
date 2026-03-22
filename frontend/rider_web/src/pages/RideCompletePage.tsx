import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { acknowledgeRideCompletion, getRideDetail, rateRide } from "../api/rides";
import { downloadRideReceipt } from "../api/activity";
import { MobileNav } from "../components/common/MobileNav";
import { useRideContext } from "../context/RideContext";
import { useToast } from "../components/common/Toast";
import styles from "./RideCompletePage.module.css";

function getInitials(name?: string | null) {
  const initials = (name ?? "")
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return initials || "RC";
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Just now";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RideCompletePage() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const rideContext = useRideContext();
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [receiptBusy, setReceiptBusy] = useState(false);

  const detailQuery = useQuery({
    queryKey: ["ride-complete", rideId],
    queryFn: () => getRideDetail(rideId as string),
    enabled: Boolean(rideId),
    retry: 1,
  });

  const ride = detailQuery.data;
  const displayRating = hoveredRating || rating || ride?.rider_rating || 0;

  const shouldShowFeedbackForm = useMemo(() => {
    if (!ride) {
      return false;
    }
    return ride.can_rate_driver && (showFeedbackForm || ride.feedback_status === "PENDING");
  }, [ride, showFeedbackForm]);

  async function refreshRiderHistory() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["rider-activity-stats"] }),
      queryClient.invalidateQueries({ queryKey: ["rider-activity-design"] }),
      queryClient.invalidateQueries({ queryKey: ["rider-activity"] }),
      queryClient.invalidateQueries({ queryKey: ["rider-ride-detail"] }),
      queryClient.invalidateQueries({ queryKey: ["ride-complete", rideId] }),
    ]);
  }

  useEffect(() => {
    if (!ride) {
      return;
    }

    rideContext.clearRide();
    void refreshRiderHistory();

    if (ride.ride_status !== "RIDE_COMPLETED") {
      if (ride.ride_status === "CANCELLED") {
        navigate("/activity", { replace: true });
      } else {
        navigate(`/ride/tracking/${ride.ride_id}`, { replace: true });
      }
      return;
    }

    if (ride.completion_acknowledged) {
      navigate("/activity", { replace: true });
    }
  }, [navigate, ride, rideContext]);

  useEffect(() => {
    if (!ride) {
      return;
    }
    setRating(ride.rider_rating ?? 0);
    setComment(ride.rider_comment ?? "");
  }, [ride]);

  const rateMutation = useMutation({
    mutationFn: () =>
      rateRide(rideId as string, {
        rating,
        comment: comment.trim() ? comment.trim() : undefined,
      }),
    onSuccess: async () => {
      await acknowledgeRideCompletion(rideId as string, "SUBMITTED");
      await refreshRiderHistory();
      toast.showSuccess("Thanks for your feedback!");
      navigate("/activity", { replace: true });
    },
    onError: () => {
      toast.showError("Rating failed. Try again.");
    },
  });

  async function handleSkipFeedback() {
    if (!rideId) {
      return;
    }
    await acknowledgeRideCompletion(rideId, "SKIPPED");
    await refreshRiderHistory();
    navigate("/activity", { replace: true });
  }

  async function handleBackToActivity() {
    if (rideId) {
      await acknowledgeRideCompletion(rideId, ride?.feedback_status === "SUBMITTED" ? "SUBMITTED" : undefined);
      await refreshRiderHistory();
    }
    navigate("/activity", { replace: true });
  }

  async function handleDownloadReceipt() {
    if (!rideId) {
      return;
    }

    try {
      setReceiptBusy(true);
      const blob = await downloadRideReceipt(rideId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `receipt-${rideId}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.showError("Receipt unavailable right now.");
    } finally {
      setReceiptBusy(false);
    }
  }

  if (detailQuery.isLoading) {
    return (
      <div className={styles.page}>
        <MobileNav />
        <div className={styles.content}>
          <div className={styles.stateCard}>
            <h1 className={styles.title}>Loading trip summary…</h1>
            <p className={styles.subtitle}>Restoring your latest ride state.</p>
          </div>
        </div>
      </div>
    );
  }

  if (detailQuery.isError || !ride) {
    return (
      <div className={styles.page}>
        <MobileNav />
        <div className={styles.content}>
          <div className={styles.stateCard}>
            <h1 className={styles.title}>Could not load this trip</h1>
            <p className={styles.subtitle}>Try reloading your completed ride summary.</p>
            <div className={styles.stateActions}>
              <button type="button" className={styles.homeBtn} onClick={() => void detailQuery.refetch()}>
                Retry
              </button>
              <button type="button" className={styles.skip} onClick={() => navigate("/activity", { replace: true })}>
                Go to activity
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completedFare = Number(ride.final_fare_amount ?? ride.estimated_fare ?? 0).toFixed(2);
  const driverInitials = getInitials(ride.driver?.full_name);

  return (
    <div className={styles.page}>
      <MobileNav />
      <div className={styles.content}>
        <div className={styles.check}>✓</div>
        <h1 className={styles.title}>Ride completed</h1>
        <p className={styles.subtitle}>Your trip is finished. Receipt and feedback are available below.</p>

        <div className={styles.summaryHero}>
          <div>
            <div className={styles.heroLabel}>Completed at</div>
            <div className={styles.heroValue}>{formatDateTime(ride.completed_at ?? ride.created_at)}</div>
          </div>
          <span className={styles.statusPill}>{ride.payment_status === "PROCESSED" ? "Payment processed" : ride.payment_status}</span>
        </div>

        <div className={styles.card}>
          <div className={styles.row}><span>From</span><strong>{ride.pickup_address || "—"}</strong></div>
          <div className={styles.row}><span>To</span><strong>{ride.dropoff_address || "—"}</strong></div>
          <div className={styles.row}><span>Vehicle</span><strong>{ride.vehicle_type || "—"}</strong></div>
          <div className={styles.row}><span>Payment</span><strong>{ride.payment_method || "—"}</strong></div>
          <div className={styles.row}><span>Total</span><strong className={styles.fare}>${completedFare}</strong></div>
        </div>

        {ride.driver ? (
          <div className={styles.driverCard}>
            <div className={styles.driverAvatar}>{driverInitials}</div>
            <div className={styles.driverMeta}>
              <strong>{ride.driver.full_name || "Driver"}</strong>
              <span>
                {[ride.driver.vehicle_make, ride.driver.vehicle_model, ride.driver.plate_number].filter(Boolean).join(" · ") || "Driver details unavailable"}
              </span>
            </div>
          </div>
        ) : null}

        <div className={styles.actionsCard}>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={!ride.receipt_available || receiptBusy}
            onClick={() => void handleDownloadReceipt()}
          >
            {receiptBusy ? "Preparing receipt..." : "Download receipt"}
          </button>
          {ride.can_rate_driver ? (
            <button
              type="button"
              className={styles.homeBtn}
              onClick={() => setShowFeedbackForm((current) => !current)}
            >
              {shouldShowFeedbackForm ? "Hide feedback" : "Rate driver"}
            </button>
          ) : null}
        </div>

        {ride.feedback_status === "SUBMITTED" && ride.rider_rating != null ? (
          <div className={styles.rateSection}>
            <div className={styles.rateHeader}>
              <div>
                <div className={styles.rateLabel}>Your feedback</div>
                <p className={styles.rateHint}>This rating was saved from the backend ride record.</p>
              </div>
            </div>
            <div className={styles.stars} aria-label={`Saved rating: ${ride.rider_rating} out of 5`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`${styles.star} ${ride.rider_rating != null && ride.rider_rating >= star ? styles.starActive : ""}`}
                >
                  ★
                </span>
              ))}
            </div>
            {ride.rider_comment ? <div className={styles.textarea}>{ride.rider_comment}</div> : null}
          </div>
        ) : null}

        {shouldShowFeedbackForm && ride.can_rate_driver ? (
          <div className={styles.rateSection}>
            <div className={styles.rateHeader}>
              <div>
                <div className={styles.rateLabel}>Optional feedback</div>
                <p className={styles.rateHint}>Submitting feedback is optional and does not block access to your receipt or activity.</p>
              </div>
              <button type="button" className={styles.skip} onClick={() => void handleSkipFeedback()}>
                Skip for now
              </button>
            </div>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`${styles.star} ${displayRating >= star ? styles.starActive : ""}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 ? (
              <>
                <textarea
                  className={styles.textarea}
                  placeholder="Add a comment (optional)"
                  rows={3}
                  maxLength={500}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
                {comment.length > 0 ? <div className={styles.counter}>{comment.length}/500</div> : null}
              </>
            ) : null}
            <button
              type="button"
              className={styles.submit}
              disabled={rating === 0 || rateMutation.isPending}
              onClick={() => rateMutation.mutate()}
            >
              {rateMutation.isPending ? "Submitting..." : "Submit rating"}
            </button>
          </div>
        ) : null}

        <button type="button" className={styles.homeBtn} onClick={() => void handleBackToActivity()}>
          Back to activity
        </button>
      </div>
    </div>
  );
}
