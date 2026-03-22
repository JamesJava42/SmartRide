import { VEHICLE_TYPE_CONFIG, VehicleTypeIcon } from "@shared/components/vehicle";
import type { VehicleType } from "@shared/types/vehicle";
import styles from "./VehicleSelectColumn.module.css";

type EstimateItem = {
  vehicleType: VehicleType;
  fare: number;
  etaMinutes: number;
  unavailable?: boolean;
};

const DISPLAY_ORDER: VehicleType[] = ["ECONOMY", "COMFORT", "PREMIUM", "XL"];

export function VehicleSelectColumn({
  estimates,
  selectedType,
  routeDistance,
  routeDuration,
  onSelect,
  onBook,
}: {
  estimates: EstimateItem[];
  selectedType: VehicleType;
  routeDistance: string;
  routeDuration: string;
  onSelect: (type: VehicleType) => void;
  onBook: () => void;
}) {
  const items = DISPLAY_ORDER.map((type) => estimates.find((estimate) => estimate.vehicleType === type)).filter(Boolean) as EstimateItem[];
  const selectedEstimate = items.find((estimate) => estimate.vehicleType === selectedType) ?? items[0] ?? null;
  const selectedConfig = selectedEstimate ? VEHICLE_TYPE_CONFIG[selectedEstimate.vehicleType] : VEHICLE_TYPE_CONFIG.ECONOMY;

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <div className={styles.routeReady}>Route ready</div>
        <div className={styles.routeMeta}>
          {routeDistance} · {routeDuration}
        </div>
        <span className={styles.chooseBadge}>Choose a vehicle</span>
      </div>

      <div className={styles.list}>
        {items.map((estimate) => {
          const config = VEHICLE_TYPE_CONFIG[estimate.vehicleType];
          const isSelected = estimate.vehicleType === selectedType;
          return (
            <button
              key={estimate.vehicleType}
              type="button"
              disabled={estimate.unavailable}
              onClick={() => onSelect(estimate.vehicleType)}
              className={`${styles.card} ${isSelected ? styles.selected : ""} ${estimate.unavailable ? styles.unavailable : ""}`}
            >
              <div className={styles.top}>
                <div className={styles.icon}>
                  <VehicleTypeIcon type={estimate.vehicleType} size={44} />
                </div>
                <div>
                  <div className={styles.amount} style={{ color: config.color }}>
                    {estimate.unavailable ? "Unavailable" : `$${estimate.fare.toFixed(2)}`}
                  </div>
                  <div className={styles.eta}>{estimate.unavailable ? "No cars" : `~${estimate.etaMinutes} min`}</div>
                </div>
              </div>
              <div className={styles.name}>{config.label}</div>
              <div className={styles.cap}>{config.capacity.replace(" riders", "")}</div>
              <div className={styles.examples}>{config.examples}</div>
            </button>
          );
        })}
      </div>

      <div className={styles.footer}>
        <button type="button" onClick={onBook} disabled={!selectedEstimate || selectedEstimate.unavailable} className={styles.bookBtn}>
          {selectedEstimate ? `Book ${selectedConfig.label} · $${selectedEstimate.fare.toFixed(2)}` : "Book ride"}
        </button>
      </div>
    </div>
  );
}
