import { useState } from 'react';
import { DataTable } from '../../DataTable';
import { StatusBadge } from '../../StatusBadge';
import { Pagination } from '../../Pagination';
import { useDriverRideHistory } from '../../../hooks/useDriverDetail';
import { format, parseISO } from 'date-fns';
import styles from './RideHistoryTab.module.css';

interface Props { driverId: string; totalRides?: number; rating?: number | null; }

export function RideHistoryTab({ driverId, totalRides = 0, rating }: Props) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useDriverRideHistory(driverId, page);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns = [
    {
      key: 'ride_id',
      header: 'Ride ID',
      width: '100px',
      render: (r: Record<string, unknown>) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>
          {String(r.ride_id ?? '').slice(0, 8)}…
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (r: Record<string, unknown>) => {
        try { return format(parseISO(String(r.created_at)), 'MMM d · h:mm a'); } catch { return '—'; }
      },
    },
    { key: 'rider_name', header: 'Rider' },
    { key: 'region', header: 'Region' },
    {
      key: 'route',
      header: 'Route',
      render: (r: Record<string, unknown>) => (
        <div title={`${r.pickup_address} → ${r.dropoff_address}`} style={{ display: 'grid', gap: 4, minWidth: 0 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {String(r.pickup_address ?? '—')}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {String(r.dropoff_address ?? '—')}
          </span>
        </div>
      ),
    },
    {
      key: 'final_fare_amount',
      header: 'Fare',
      render: (r: Record<string, unknown>) => r.final_fare_amount != null ? `$${Number(r.final_fare_amount).toFixed(2)}` : '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: Record<string, unknown>) => <StatusBadge status={String(r.status ?? '')} size="sm" />,
    },
  ];

  return (
    <div>
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{totalRides.toLocaleString()}</span>
          <span className={styles.statLabel}>Total Rides</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{rating != null ? `${rating.toFixed(1)} ★` : '—'}</span>
          <span className={styles.statLabel}>Rating</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{total}</span>
          <span className={styles.statLabel}>Fetched Records</span>
        </div>
      </div>
      <DataTable columns={columns} rows={items as Record<string, unknown>[]} isLoading={isLoading} emptyMessage="No rides found." />
      <Pagination page={page} pageSize={20} totalItems={total} onPageChange={setPage} />
    </div>
  );
}
