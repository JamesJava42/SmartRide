import { Link } from "react-router-dom";
import type { RideOffer } from "../../types/driverOperations";
import styles from "./RideOfferCard.module.css";

type RideOfferCardProps = {
  offer: RideOffer;
};

export function RideOfferCard({ offer }: RideOfferCardProps) {
  return (
    <Link to={`/offers/${offer.ride_id}`} className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>{offer.vehicle_type} ride</div>
          <div className={styles.subtitle}>Respond before the timer expires</div>
        </div>
        <span className={styles.status}>{offer.status}</span>
      </div>
      <div className={styles.route}>
        <div>{offer.pickup_address}</div>
        <div className={styles.connector} />
        <div>{offer.dropoff_address}</div>
      </div>
      <div className={styles.meta}>
        <span>{offer.estimated_distance_km.toFixed(1)} km</span>
        <span>{offer.estimated_duration_min} min</span>
        <span className={styles.fare}>${offer.estimated_fare.toFixed(2)}</span>
      </div>
    </Link>
  );
}
