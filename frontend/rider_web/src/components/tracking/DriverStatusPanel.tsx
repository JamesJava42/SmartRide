import { MessageSquare, Phone } from "lucide-react";

import type { PaymentMethod, RideDriver, RideStatus } from "../../types/ride";
import styles from "./DriverStatusPanel.module.css";

function paymentLabel(method: PaymentMethod | null) {
  switch (method) {
    case "CARD":
      return "Card";
    case "DIGITAL_WALLET":
      return "Wallet";
    default:
      return "Cash";
  }
}

function badgeText(status: RideStatus) {
  switch (status) {
    case "DRIVER_ASSIGNED":
      return "Driver assigned";
    case "DRIVER_EN_ROUTE":
      return "Driver en route";
    case "DRIVER_ARRIVED":
      return "Driver arrived";
    case "RIDE_STARTED":
      return "Ride in progress";
    default:
      return status;
  }
}

function vehicleTypeLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export function DriverStatusPanel({
  status,
  driver,
  etaMinutes,
  distanceLabel,
  paymentMethod,
  onCancel,
}: {
  status: RideStatus;
  driver: RideDriver;
  etaMinutes: number | null;
  distanceLabel: string;
  paymentMethod: PaymentMethod | null;
  onCancel: () => void;
}) {
  return (
    <div className={styles.panel}>
      <div className={styles.badge}><span className={styles.badgeDot} />{badgeText(status)}</div>
      <h2 className={styles.title}>
        {status === "DRIVER_ASSIGNED"
          ? `${driver.full_name} has accepted`
          : status === "DRIVER_EN_ROUTE"
            ? `${driver.full_name} is on the way`
            : status === "DRIVER_ARRIVED"
              ? `${driver.full_name} has arrived`
              : "Your ride has started"}
      </h2>
      <p className={styles.subtitle}>
        {driver.vehicle_year} {driver.vehicle_make} {driver.vehicle_model} · {driver.plate_number}
      </p>
      <div className={styles.metrics}>
        {status === "DRIVER_ARRIVED" || status === "RIDE_STARTED" ? null : (
          <div className={styles.metric}><strong>{etaMinutes ?? "—"}</strong><span>min away</span></div>
        )}
        <div className={styles.metric}><strong>{distanceLabel}</strong><span>trip distance</span></div>
        <div className={styles.metric}><strong>{paymentLabel(paymentMethod)}</strong><span>payment</span></div>
      </div>
      <div className={styles.driverRow}>
        <div className={styles.avatar}>{driver.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
        <div className={styles.driverMeta}>
          <strong>{driver.full_name}</strong>
          <span>⭐ {driver.rating_avg.toFixed(1)} · {vehicleTypeLabel(driver.vehicle_type)} · {driver.plate_number}</span>
        </div>
        <div className={styles.iconButtons}>
          <button type="button" aria-label="Call driver"><Phone size={13} color="#1A6B45" /></button>
          <button type="button" aria-label="Message driver"><MessageSquare size={13} color="#1A6B45" /></button>
        </div>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.outlined}>Share ride</button>
        {status !== "RIDE_STARTED" ? <button type="button" className={styles.cancel} onClick={onCancel}>Cancel</button> : null}
      </div>
    </div>
  );
}
