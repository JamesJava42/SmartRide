import type { RiderActivitySummary } from "../../types/activity";
import { formatCurrency, formatMiles } from "../../utils/formatters";
import styles from "./RideHistoryCard.module.css";

export function ActivitySummaryStrip({ summary }: { summary: RiderActivitySummary }) {
  return (
    <div className={styles.summaryStrip}>
      <div className={styles.summaryCell}>
        <strong>{summary.total_rides}</strong>
        <span>Total rides</span>
      </div>
      <div className={styles.summaryCell}>
        <strong className={styles.summaryAccent}>{formatCurrency(summary.total_spent)}</strong>
        <span>Total spent</span>
      </div>
      <div className={styles.summaryCell}>
        <strong>{formatMiles(summary.average_distance_km)}</strong>
        <span>Avg distance</span>
      </div>
      <div className={`${styles.summaryCell} ${styles.summaryDesktopOnly}`}>
        <strong>{summary.average_rating_given.toFixed(1)}★</strong>
        <span>Avg rating</span>
      </div>
    </div>
  );
}
