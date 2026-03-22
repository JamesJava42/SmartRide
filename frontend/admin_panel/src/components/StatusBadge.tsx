import styles from './StatusBadge.module.css';

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

function getVariant(status: string): string {
  const s = status.toUpperCase();
  if (s === 'CRITICAL') return styles.suspended;
  if (s === 'HIGH') return styles.inactive;
  if (s === 'MEDIUM') return styles.pending;
  if (s === 'LOW') return styles.active;
  if (['ACTIVE', 'APPROVED', 'RIDE_STARTED', 'DRIVER_ARRIVED'].includes(s)) return styles.active;
  if (['PENDING', 'PENDING_APPROVAL', 'SUBMITTED', 'UNDER_REVIEW', 'DOCS_PENDING'].includes(s)) return styles.pending;
  if (s === 'SUSPENDED') return styles.suspended;
  if (['INACTIVE', 'REJECTED', 'CANCELLED'].includes(s)) return styles.inactive;
  if (s === 'DRIVER_EN_ROUTE') return styles.enroute;
  if (s === 'DRIVER_ASSIGNED') return styles.assigned;
  if (s === 'MATCHING') return styles.matching;
  if (s === 'RIDE_COMPLETED') return styles.inactive;
  if (s === 'NO_DRIVERS_FOUND') return styles.inactive;
  return styles.inactive;
}

function getLabel(status: string): string {
  const map: Record<string, string> = {
    CRITICAL: 'Critical',
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
    PENDING_APPROVAL: 'Pending',
    DRIVER_EN_ROUTE: 'En Route',
    DRIVER_ASSIGNED: 'Assigned',
    RIDE_STARTED: 'Started',
    DRIVER_ARRIVED: 'Arrived',
    UNDER_REVIEW: 'Under Review',
    DOCS_PENDING: 'Docs Pending',
    NO_DRIVERS_FOUND: 'No Drivers Found',
  };
  return map[status.toUpperCase()] ?? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, ' ');
}

export function StatusBadge({ status, size = 'md' }: Props) {
  return (
    <span className={`${styles.badge} ${size === 'sm' ? styles.sm : styles.md} ${getVariant(status)}`}>
      <span className={styles.dot} />
      {getLabel(status)}
    </span>
  );
}
