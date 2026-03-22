import { CheckIcon } from "../../constants/icons";
import type { VehicleType } from "./vehicleConfig";
import { VEHICLE_TYPE_CONFIG } from "./vehicleConfig";
import VehicleTypeIcon from "./VehicleTypeIcon";
import styles from "./VehicleTypeCard.module.css";

type Props = {
  type: VehicleType;
  selected?: boolean;
  disabled?: boolean;
  fare?: number;
  eta?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
};

export function VehicleTypeCard({ type, selected = false, disabled = false, fare, eta, onClick, size = "md" }: Props) {
  const config = VEHICLE_TYPE_CONFIG[type];
  const iconSize = size === "sm" ? 46 : size === "lg" ? 68 : 56;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={[
        styles.card,
        styles[size],
        selected ? styles.selected : "",
        disabled ? styles.disabled : "",
        onClick ? "" : styles.static,
      ].join(" ")}
      style={{
        background: selected ? config.bgColor : "#ffffff",
        borderColor: selected ? config.borderColor : undefined,
        boxShadow: selected ? `0 0 0 3px ${config.color}1f` : undefined,
      }}
    >
      {selected ? (
        <span className={styles.check}>
          <CheckIcon size={11} color="#ffffff" />
        </span>
      ) : null}
      <VehicleTypeIcon type={type} size={iconSize} />
      <div className={styles.meta}>
        <div className={styles.title}>{config.label}</div>
        <div className={styles.capacity}>{config.capacity}</div>
        <div className={styles.examples}>{config.examples}</div>
        {!fare && !eta ? <div className={styles.description}>{config.description}</div> : null}
      </div>
      {fare != null || eta ? (
        <div className={styles.priceRow}>
          {fare != null ? (
            <span className={styles.fare} style={{ color: config.color }}>
              ${fare.toFixed(0)}
            </span>
          ) : null}
          {eta ? <span className={styles.eta}>{eta}</span> : null}
        </div>
      ) : null}
    </button>
  );
}
