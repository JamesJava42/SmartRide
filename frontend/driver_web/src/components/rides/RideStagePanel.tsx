import styles from "./RideStagePanel.module.css";
import type { RideStage } from "../../types/driverOperations";

type RideStagePanelProps = {
  stage: RideStage;
};

const labels: Record<RideStage, string> = {
  DRIVER_ASSIGNED: "Driver assigned",
  DRIVER_EN_ROUTE: "Heading to pickup",
  DRIVER_ARRIVED: "Waiting at pickup",
  RIDE_STARTED: "Ride in progress",
  RIDE_COMPLETED: "Ride completed",
  CANCELLED: "Ride cancelled",
};

export function RideStagePanel({ stage }: RideStagePanelProps) {
  return (
    <div className={styles.row}>
      <span className={styles.dot} />
      <span className={styles.text}>{labels[stage]}</span>
    </div>
  );
}
