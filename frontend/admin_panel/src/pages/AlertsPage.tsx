import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

import { getAdminAlerts } from '../api/admin';
import { StatusBadge } from '../components/StatusBadge';
import styles from './AlertsPage.module.css';

function formatTime(value: string): string {
  try {
    return formatDistanceToNowStrict(parseISO(value), { addSuffix: true });
  } catch {
    return value;
  }
}

export function AlertsPage() {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: () => getAdminAlerts(false),
    refetchInterval: 15000,
  });

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Alerts</h1>
          <p className={styles.subtitle}>Live platform incidents and operational failures.</p>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.stateCard}>Loading alerts…</div>
      ) : error ? (
        <div className={styles.stateCard}>Unable to load alerts right now.</div>
      ) : data.length === 0 ? (
        <div className={styles.stateCard}>No active alerts.</div>
      ) : (
        <div className={styles.list}>
          {data.map((alert) => (
            <article key={alert.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>{alert.title}</h2>
                  <div className={styles.meta}>
                    <span>{alert.alert_type.replaceAll('_', ' ')}</span>
                    <span>•</span>
                    <span>{alert.source_service ?? 'system'}</span>
                    <span>•</span>
                    <span>{formatTime(alert.created_at)}</span>
                  </div>
                </div>
                <StatusBadge status={alert.severity} size="sm" />
              </div>
              <p className={styles.message}>{alert.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
