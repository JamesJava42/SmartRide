import type { VehicleType } from "./vehicleConfig";
import { VEHICLE_TYPE_CONFIG } from "./vehicleConfig";
import { VehicleTypeCard } from "./VehicleTypeCard";
import styles from "./VehicleTypeSelector.module.css";

type Props = {
  value: VehicleType | null;
  onChange: (type: VehicleType) => void;
  fares?: Partial<Record<VehicleType, number>>;
  etas?: Partial<Record<VehicleType, string>>;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
};

export function VehicleTypeSelector({ value, onChange, fares, etas, disabled = false, size = "md" }: Props) {
  return (
    <div className={styles.selector}>
      {(Object.keys(VEHICLE_TYPE_CONFIG) as VehicleType[]).map((type) => (
        <VehicleTypeCard
          key={type}
          type={type}
          selected={value === type}
          disabled={disabled}
          size={size}
          fare={fares?.[type]}
          eta={etas?.[type]}
          onClick={() => onChange(type)}
        />
      ))}
    </div>
  );
}
