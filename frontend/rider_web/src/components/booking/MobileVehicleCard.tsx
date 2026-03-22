import { VEHICLE_TYPE_CONFIG, VehicleTypeIcon } from "@shared/components/vehicle";
import type { VehicleType } from "@shared/types/vehicle";

import styles from "./MobileVehicleCard.module.css";

export function MobileVehicleCard({
  estimate,
  selected,
  onClick,
}: {
  estimate: {
    vehicleType: VehicleType;
    fare: number;
    etaMinutes: number;
    unavailable?: boolean;
  };
  selected: boolean;
  onClick: () => void;
}) {
  const config = VEHICLE_TYPE_CONFIG[estimate.vehicleType];
  const capacityText = `${config.capacity.replace(" riders", "")} · ${config.examples}`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={estimate.unavailable}
      className={`${styles.card} ${selected ? styles.selected : ""}`}
    >
      <div className={styles.icon}>
        <VehicleTypeIcon type={estimate.vehicleType} size={46} />
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{config.label}</div>
        <div className={styles.sub}>{capacityText}</div>
      </div>
      <div className={styles.pricing}>
        <div className={styles.price} style={{ color: config.color }}>
          {estimate.unavailable ? "Unavailable" : `$${estimate.fare.toFixed(2)}`}
        </div>
        <div className={styles.eta}>{estimate.unavailable ? "No cars" : `~${estimate.etaMinutes} min`}</div>
      </div>
    </button>
  );
}
