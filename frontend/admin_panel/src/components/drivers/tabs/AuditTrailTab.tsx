import { useDriverAuditTrail } from '../../../hooks/useDriverDetail';
import { format, parseISO } from 'date-fns';
import styles from './AuditTrailTab.module.css';

interface Props { driverId: string; }

function dotColor(action: string): string {
  const a = action.toUpperCase();
  if (a.includes('APPROV') || a.includes('REACTIV')) return '#10B981';
  if (a.includes('REJECT') || a.includes('SUSPEND')) return '#EF4444';
  if (a.includes('SYSTEM') || a.includes('UPDATE')) return '#3B82F6';
  return '#9CA3AF';
}

export function AuditTrailTab({ driverId }: Props) {
  const { data: entries = [], isLoading } = useDriverAuditTrail(driverId, true);

  if (isLoading) {
    return (
      <div className={styles.timeline}>
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className={styles.sk} />)}
      </div>
    );
  }

  if (!entries.length) {
    return <div className={styles.empty}>No audit trail entries for this driver.</div>;
  }

  return (
    <div className={styles.timeline}>
      {entries.map((entry, i) => (
        <div key={entry.id} className={styles.entry}>
          <div className={styles.left}>
            <span className={styles.dot} style={{ background: dotColor(entry.action_type) }} />
            {i < entries.length - 1 && <span className={styles.line} />}
          </div>
          <div className={styles.right}>
            <div className={styles.entryHeader}>
              <span className={styles.actor}>{entry.admin_name ?? 'System'}</span>
              <span className={styles.timestamp}>
                {entry.created_at ? format(parseISO(entry.created_at), 'MMM d, yyyy · h:mm a') : '—'}
              </span>
            </div>
            <span
              className={styles.action}
              style={{ color: dotColor(entry.action_type) }}
            >
              {entry.action_type.replace(/_/g, ' ')}
            </span>
            {entry.details_json && Object.keys(entry.details_json).length > 0 && (
              <pre className={styles.details}>
                {Object.entries(entry.details_json).map(([k, v]) => `${k}: ${String(v)}`).join('\n')}
              </pre>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
