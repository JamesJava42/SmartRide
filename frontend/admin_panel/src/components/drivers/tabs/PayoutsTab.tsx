import { useState } from 'react';
import { DataTable } from '../../DataTable';
import { StatusBadge } from '../../StatusBadge';
import { Pagination } from '../../Pagination';
import { useDriverPayouts } from '../../../hooks/useDriverDetail';
import { format, parseISO, isThisWeek, isThisMonth } from 'date-fns';
import styles from './PayoutsTab.module.css';

interface Props { driverId: string; }

export function PayoutsTab({ driverId }: Props) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useDriverPayouts(driverId, page);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const weekTotal = items.filter((p) => { try { return isThisWeek(parseISO(p.created_at)); } catch { return false; } }).reduce((s, p) => s + p.amount, 0);
  const monthTotal = items.filter((p) => { try { return isThisMonth(parseISO(p.created_at)); } catch { return false; } }).reduce((s, p) => s + p.amount, 0);
  const pendingTotal = items.filter((p) => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);

  const columns = [
    {
      key: 'id',
      header: 'Payout ID',
      render: (r: Record<string, unknown>) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>
          {String(r.id ?? '').slice(0, 8)}…
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (r: Record<string, unknown>) => {
        try { return format(parseISO(String(r.created_at)), 'MMM d, yyyy'); } catch { return '—'; }
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (r: Record<string, unknown>) => (
        <span style={{ color: 'var(--green-700)', fontWeight: 700 }}>${Number(r.amount ?? 0).toFixed(2)}</span>
      ),
    },
    { key: 'method', header: 'Method' },
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
          <span className={styles.statNum}>${weekTotal.toFixed(2)}</span>
          <span className={styles.statLabel}>This Week</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>${monthTotal.toFixed(2)}</span>
          <span className={styles.statLabel}>This Month</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: pendingTotal > 0 ? '#D97706' : 'var(--green-700)' }}>${pendingTotal.toFixed(2)}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>
      </div>
      <DataTable columns={columns} rows={items as Record<string, unknown>[]} isLoading={isLoading} emptyMessage="No payout records." />
      <Pagination page={page} pageSize={20} totalItems={total} onPageChange={setPage} />
    </div>
  );
}
