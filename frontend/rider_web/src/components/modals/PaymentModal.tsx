import { PaymentMethodCard } from "../booking/PaymentMethodCard";
import { LoadingButton } from "../common/LoadingButton";
import type { PaymentMethod, VehicleType } from "../../types/ride";
import { VEHICLE_TYPE_CONFIG } from "@shared/components/vehicle";
import styles from "./PaymentModal.module.css";

export function PaymentModal({
  open,
  selectedMethod,
  vehicleType,
  fare,
  pickupLabel,
  dropoffLabel,
  onClose,
  onSelectMethod,
  onConfirm,
}: {
  open: boolean;
  selectedMethod: PaymentMethod | null;
  vehicleType: VehicleType;
  fare: number;
  pickupLabel: string;
  dropoffLabel: string;
  onClose: () => void;
  onSelectMethod: (method: PaymentMethod) => void;
  onConfirm: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <button type="button" className={styles.close} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.title}>Payment method</h2>
        <p className={styles.subtitle}>
          {VEHICLE_TYPE_CONFIG[vehicleType].label} · {pickupLabel} → {dropoffLabel} · ${fare.toFixed(2)}
        </p>
        <div className={styles.methods}>
          {(["CASH", "CARD", "DIGITAL_WALLET"] as PaymentMethod[]).map((method) => (
            <PaymentMethodCard key={method} method={method} selected={selectedMethod === method} onSelect={onSelectMethod} />
          ))}
        </div>
        <div className={styles.totalRow}>
          <span>Total fare</span>
          <strong>${fare.toFixed(2)}</strong>
        </div>
        <LoadingButton className={styles.confirm} onClick={onConfirm}>
          Confirm payment
        </LoadingButton>
        <button type="button" className={styles.cancelLink} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
