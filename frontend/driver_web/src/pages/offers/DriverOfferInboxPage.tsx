import { useQuery } from "@tanstack/react-query";

import { getOffers } from "../../api/driverOffers";
import { DriverLayout } from "../../components/layout/DriverLayout";
import { RideOfferCard } from "../../components/offers/RideOfferCard";
import styles from "./DriverOfferDetailPage.module.css";

export default function DriverOfferInboxPage() {
  const offersQuery = useQuery({
    queryKey: ["offers"],
    queryFn: getOffers,
    refetchInterval: 5000,
  });

  const pendingOffers = (offersQuery.data ?? []).filter((offer) => offer.status === "PENDING");

  return (
    <DriverLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Ride offers</h1>
            <p className={styles.pageSubtitle}>Review new requests before they expire.</p>
          </div>
        </div>

        {offersQuery.isLoading ? (
          <div className={styles.stateCard}>Loading ride offers...</div>
        ) : offersQuery.isError ? (
          <div className={styles.stateCard}>
            <p>Unable to load offers right now.</p>
            <button type="button" className={styles.outlineButton} onClick={() => void offersQuery.refetch()}>
              Retry
            </button>
          </div>
        ) : pendingOffers.length === 0 ? (
          <div className={styles.stateCard}>
            <p>No pending ride offers at the moment.</p>
          </div>
        ) : (
          <div className={styles.offerList}>
            {pendingOffers.map((offer) => (
              <RideOfferCard key={offer.offer_id} offer={offer} />
            ))}
          </div>
        )}
      </div>
    </DriverLayout>
  );
}
