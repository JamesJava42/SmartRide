import { VEHICLE_TYPE_CONFIG, VehicleTypeIcon } from "@shared/components/vehicle";

import type { FareEstimate, VehicleType } from "../../types/ride";
import styles from "./VehicleSelectPanel.module.css";

const ORDER: VehicleType[] = ["ECONOMY", "COMFORT", "PREMIUM", "XL"];

export function VehicleSelectPanel({
  estimates,
  selectedVehicleType,
  routeDistanceKm,
  routeDurationMin,
  mobile = false,
  onSelect,
  onBook,
}: {
  estimates: FareEstimate[];
  selectedVehicleType: VehicleType | null;
  routeDistanceKm: number;
  routeDurationMin: number;
  mobile?: boolean;
  onSelect: (type: VehicleType) => void;
  onBook: () => void;
}) {
  const items = ORDER.map((type) => estimates.find((estimate) => estimate.vehicle_type === type)).filter(Boolean) as FareEstimate[];
  const selected = items.find((item) => item.vehicle_type === selectedVehicleType) ?? items[0] ?? null;

  return (
    <div className={`${styles.panel} ${mobile ? styles.mobile : ""}`}>
      <div className={styles.header}>
        <div className={styles.routeReady}>Route ready</div>
        <div className={styles.routeMeta}>
          {routeDistanceKm.toFixed(1)} mi · {Math.round(routeDurationMin)} min
        </div>
        <span className={styles.badge}>Choose a vehicle</span>
      </div>

      <div className={styles.list}>
        {items.map((estimate) => {
          const config = VEHICLE_TYPE_CONFIG[estimate.vehicle_type];
          const selectedClass = estimate.vehicle_type === selectedVehicleType ? styles.selected : "";
          return (
            <button
              key={estimate.vehicle_type}
              type="button"
              className={`${styles.card} ${selectedClass}`}
              disabled={!estimate.available}
              onClick={() => onSelect(estimate.vehicle_type)}
            >
              <div className={styles.iconWrap}>
                <VehicleTypeIcon type={estimate.vehicle_type} size={46} />
              </div>
              <div className={styles.content}>
                <div className={styles.name}>{config.label}</div>
                <div className={styles.capacity}>{config.capacity}</div>
                <div className={styles.examples}>{config.examples}</div>
              </div>
              <div className={styles.priceBlock}>
                <div className={styles.price} style={{ color: config.color }}>
                  {estimate.available ? `$${estimate.total_estimated_fare.toFixed(2)}` : "Unavailable"}
                </div>
                <div className={styles.eta}>~{estimate.eta_pickup_minutes} min</div>
              </div>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className={styles.footer}>
          <button type="button" className={`${styles.bookButton} ${mobile ? styles.bookButtonMobile : ""}`} onClick={onBook}>
            Book {VEHICLE_TYPE_CONFIG[selected.vehicle_type].label} · ${selected.total_estimated_fare.toFixed(2)}
          </button>
        </div>
      ) : null}
    </div>
  );
}
