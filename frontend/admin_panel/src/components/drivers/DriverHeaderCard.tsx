import { Avatar } from '../Avatar';
import { StatusBadge } from '../StatusBadge';
import { InfoRow } from '../common/InfoRow';
import { SectionCard } from '../common/SectionCard';
import { format, parseISO } from 'date-fns';
import type { DriverDetail } from '../../types/driver';
import styles from './DriverHeaderCard.module.css';

interface Props {
  driver: DriverDetail | null;
  isLoading: boolean;
}

export function DriverHeaderCard({ driver, isLoading }: Props) {
  if (isLoading) {
    return (
      <SectionCard>
        <div className={styles.skTop}>
          <div className={`${styles.sk} ${styles.skCircle}`} />
          <div className={styles.skLines}>
            <div className={`${styles.sk} ${styles.skH2}`} />
            <div className={`${styles.sk} ${styles.skH1}`} />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`${styles.sk} ${styles.skRow}`} />
        ))}
      </SectionCard>
    );
  }

  if (!driver) return null;

  const fullName = `${driver.first_name} ${driver.last_name ?? ''}`.trim();
  const driverId = driver.id ?? driver.driver_id ?? '';

  return (
    <SectionCard>
      <div className={styles.top}>
        <Avatar name={fullName} size="lg" />
        <div className={styles.topInfo}>
          <h2 className={styles.name}>{fullName}</h2>
          <p className={styles.idText}>{driverId.slice(0, 8)}…</p>
          <div className={styles.badges}>
            <StatusBadge status={driver.status} />
            <span className={`${styles.onlineDot} ${driver.is_online ? styles.online : styles.offline}`} />
            <span className={styles.onlineLabel}>{driver.is_online ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.rows}>
        <InfoRow label="Email" value={driver.email || '—'} />
        <InfoRow label="Phone" value={driver.phone_number || '—'} />
        <InfoRow label="Region" value={driver.region_name || '—'} />
        <InfoRow
          label="Rating"
          value={driver.rating_avg != null ? `${driver.rating_avg.toFixed(1)} ★` : 'No ratings yet'}
        />
        <InfoRow
          label="Total Rides"
          value={driver.total_rides_completed.toLocaleString()}
        />
        <InfoRow
          label="Member Since"
          value={driver.created_at ? format(parseISO(driver.created_at), 'MMM yyyy') : '—'}
        />
        <InfoRow
          label="Verified"
          value={
            driver.is_verified
              ? <span style={{ color: 'var(--green-700)' }}>✓ Verified</span>
              : <span style={{ color: 'var(--text-muted)' }}>—</span>
          }
        />
      </div>
    </SectionCard>
  );
}
