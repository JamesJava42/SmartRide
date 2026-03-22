import type { VehicleType } from "./vehicleConfig";
import { VEHICLE_TYPE_CONFIG } from "./vehicleConfig";
import styles from "./VehicleTypeBadge.module.css";

type Props = {
  type: VehicleType;
  size?: "xs" | "sm" | "md";
  showIcon?: boolean;
};

function MiniVehicleIcon({ color, iconSize }: { color: string; iconSize: number }) {
  return (
    <svg viewBox="0 0 80 46" width={iconSize} height={(iconSize * 46) / 80} aria-hidden="true" focusable="false">
      <path d="M7 28 C7 28 9 21 13 19 L22 15 C25 14 29 13 36 13 L52 13 C57 13 61 14 64 16 L71 21 C74 23 74 26 74 28 L74 36 C74 37.1 73.1 38 72 38 L10 38 C8.9 38 8 37.1 8 36 Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="4" />
      <path d="M26 13 L31 4 C32 2.2 34 1.5 37 1.5 L51 1.5 C54 1.5 56 2.2 57 4 L62 13 Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="3" />
      <circle cx="22" cy="38" r="7" fill={color} />
      <circle cx="60" cy="38" r="7" fill={color} />
    </svg>
  );
}

export function VehicleTypeBadge({ type, size = "sm", showIcon = true }: Props) {
  const config = VEHICLE_TYPE_CONFIG[type];
  const iconSize = size === "xs" ? 11 : size === "md" ? 15 : 13;
  const fontSize = size === "xs" ? "10px" : size === "md" ? "12px" : "11px";
  const padding = size === "xs" ? "2px 7px" : size === "md" ? "4px 11px" : "3px 9px";
  const gap = size === "xs" ? "4px" : "5px";

  return (
    <span
      className={styles.badge}
      style={{
        background: config.bgColor,
        color: config.color,
        border: `0.5px solid ${config.lightBorder}`,
        fontSize,
        padding,
        gap,
      }}
    >
      {showIcon ? <MiniVehicleIcon color={config.color} iconSize={iconSize} /> : null}
      <span>{config.label}</span>
    </span>
  );
}
