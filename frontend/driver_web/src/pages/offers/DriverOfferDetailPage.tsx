import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { ApiRequestError } from "../../api/client";
import { acceptOffer, getOffers, rejectOffer } from "../../api/driverOffers";
import { DriverLayout } from "../../components/layout/DriverLayout";
import { OfferCountdown } from "../../components/offers/OfferCountdown";
import { OfferExpiredBanner } from "../../components/offers/OfferExpiredBanner";
import styles from "./DriverOfferDetailPage.module.css";

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function DriverOfferDetailPage() {
  const navigate = useNavigate();
  const { rideId = "" } = useParams();
  const [expired, setExpired] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const offersQuery = useQuery({
    queryKey: ["offers"],
    queryFn: getOffers,
    refetchInterval: 5000,
  });

  const offer = useMemo(
    () =>
      (offersQuery.data ?? []).find(
        (item) => item.ride_id === rideId || item.offer_id === rideId,
      ),
    [offersQuery.data, rideId],
  );

  useEffect(() => {
    if (!offersQuery.isLoading && !offer && !offersQuery.isError) {
      navigate("/offers", { replace: true });
    }
  }, [navigate, offer, offersQuery.isError, offersQuery.isLoading]);

  const acceptMutation = useMutation({
    mutationFn: (offerId: string) => acceptOffer(offerId),
    onSuccess: () => navigate("/rides/active"),
    onError: (error) => {
      if (error instanceof ApiRequestError && error.status === 410) {
        setExpired(true);
        return;
      }
      setActionError("Failed to accept. Try again.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (offerId: string) => rejectOffer(offerId),
    onSettled: () => navigate("/dashboard"),
  });

  if (offersQuery.isLoading) {
    return (
      <DriverLayout>
        <div className={styles.page}>
          <div className={styles.stateCard}>Loading ride request...</div>
        </div>
      </DriverLayout>
    );
  }

  if (offersQuery.isError || !offer) {
    return (
      <DriverLayout>
        <div className={styles.page}>
          <div className={styles.stateCard}>
            <p>Unable to load this ride offer.</p>
            <button type="button" className={styles.outlineButton} onClick={() => void offersQuery.refetch()}>
              Retry
            </button>
          </div>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>New ride request</h1>
        </div>

        {expired ? <OfferExpiredBanner /> : null}
        {actionError ? <div className={styles.errorBanner}>{actionError}</div> : null}

        <section className={styles.offerCard}>
          <header className={styles.offerHeader}>
            <div>
              <div className={styles.offerTitle}>{offer.vehicle_type} · Ride offer</div>
              <div className={styles.offerSubtitle}>Respond before timer expires</div>
            </div>
            <OfferCountdown expiresAt={offer.expires_at} onExpired={() => setExpired(true)} />
          </header>

          <div className={styles.offerBody}>
            <div className={styles.routeColumn}>
              <div className={styles.routeRow}>
                <span className={styles.pickupDot} />
                <span>{offer.pickup_address}</span>
              </div>
              <div className={styles.routeConnector} />
              <div className={styles.routeRow}>
                <span className={styles.dropoffDot} />
                <span>{offer.dropoff_address}</span>
              </div>
            </div>

            <div className={styles.metaGrid}>
              <div className={styles.metaCard}>
                <span className={styles.metaValue}>{offer.estimated_distance_km.toFixed(1)} km</span>
                <span className={styles.metaLabel}>Distance</span>
              </div>
              <div className={styles.metaCard}>
                <span className={styles.metaValue}>~{offer.estimated_duration_min} min</span>
                <span className={styles.metaLabel}>Duration</span>
              </div>
              <div className={styles.metaCard}>
                <span className={`${styles.metaValue} ${styles.fareValue}`}>
                  {formatMoney(offer.estimated_fare)}
                </span>
                <span className={styles.metaLabel}>Est. fare</span>
              </div>
            </div>
          </div>

          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.rejectButton}
              disabled={acceptMutation.isPending || rejectMutation.isPending || expired}
              onClick={() => rejectMutation.mutate(offer.offer_id)}
            >
              Reject
            </button>
            <button
              type="button"
              className={styles.acceptButton}
              disabled={acceptMutation.isPending || rejectMutation.isPending || expired}
              onClick={() => acceptMutation.mutate(offer.offer_id)}
            >
              {acceptMutation.isPending ? "Accepting..." : "Accept"}
            </button>
          </div>
        </section>
      </div>
    </DriverLayout>
  );
}
