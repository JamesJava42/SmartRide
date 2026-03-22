import { LoadingButton } from "../common/LoadingButton";
import type { PaymentMethod, VehicleType } from "../../types/ride";
import { VEHICLE_TYPE_CONFIG } from "@shared/components/vehicle";
import styles from "./RideSummaryModal.module.css";

function paymentLabel(method: PaymentMethod | null) {
  switch (method) {
    case "CARD":
      return "Card";
    case "DIGITAL_WALLET":
      return "Digital Wallet";
    default:
      return "Cash";
  }
}

export function RideSummaryModal({
  open,
  pickup,
  dropoff,
  vehicleType,
  distance,
  duration,
  paymentMethod,
  fare,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  pickup: string;
  dropoff: string;
  vehicleType: VehicleType;
  distance: number;
  duration: number;
  paymentMethod: PaymentMethod | null;
  fare: number;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Ride summary</h2>
        <p className={styles.subtitle}>Confirm your booking details</p>
        <div className={styles.card}>
          <div className={styles.row}><span>From</span><strong>{pickup}</strong></div>
          <div className={styles.row}><span>To</span><strong>{dropoff}</strong></div>
          <div className={styles.row}><span>Vehicle</span><strong>{VEHICLE_TYPE_CONFIG[vehicleType].label} · {VEHICLE_TYPE_CONFIG[vehicleType].examples}</strong></div>
          <div className={styles.row}><span>Distance</span><strong>{distance.toFixed(1)} mi · ~{Math.round(duration)} min</strong></div>
          <div className={styles.row}><span>Payment</span><strong>{paymentLabel(paymentMethod)}</strong></div>
          <div className={styles.row}><span>Fare</span><strong className={styles.fare}>${fare.toFixed(2)}</strong></div>
        </div>
        <div className={styles.note}>A driver will be assigned after you confirm.</div>
        <LoadingButton loading={loading} loadingLabel="Confirming..." className={styles.confirm} onClick={onConfirm}>
          Confirm ride
        </LoadingButton>
        <button type="button" className={styles.cancel} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
