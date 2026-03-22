import { useState } from 'react';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { useRegions } from '../hooks/useRegions';
import { DataTable } from '../components/DataTable';
import { FilterBar } from '../components/FilterBar';
import { Avatar } from '../components/Avatar';
import { Pagination } from '../components/Pagination';
import { format, parseISO } from 'date-fns';
import type { AuditLog } from '../types/admin';
import styles from './AuditLogsPage.module.css';

const ACTION_OPTS = [
  { label: 'All Actions', value: '' },
  { label: 'Suspended Driver', value: 'SUSPENDED_DRIVER' },
  { label: 'Approved Onboarding', value: 'APPROVED_ONBOARDING' },
  { label: 'Rejected Onboarding', value: 'REJECTED_ONBOARDING' },
  { label: 'Document Approved', value: 'DOCUMENT_APPROVED' },
  { label: 'Document Rejected', value: 'DOCUMENT_REJECTED' },
];

export function AuditLogsPage() {
  const [regionId, setRegionId] = useState('');
  const [actionType, setActionType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const { data: regions = [] } = useRegions();
  const { data: result, isLoading } = useAuditLogs({ region_id: regionId || undefined, action_type: actionType || undefined, search: search || undefined, page, page_size: 20 });

  const regionOpts = [{ label: 'All Regions', value: '' }, ...regions.map((r) => ({ label: r.name, value: r.id }))];

  const items = result?.items ?? [];
  const pagination = result?.pagination;

  const columns = [
    {
      key: 'created_at', header: 'Date / Time', width: '180px',
      render: (r: Record<string, unknown>) => { try { return format(parseISO(String(r.created_at)), 'MMM d, yyyy · h:mm a'); } catch { return '—'; } }
    },
    {
      key: 'actor', header: 'Actor',
      render: (r: Record<string, unknown>) => {
        const name = String(r.admin_name ?? 'Admin');
        return <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar name={name} size="sm" />{name}</div>;
      }
    },
    {
      key: 'action_type', header: 'Action',
      render: (r: Record<string, unknown>) => {
        const s = String(r.action_type ?? '').replace(/_/g, ' ').toLowerCase();
        return s.charAt(0).toUpperCase() + s.slice(1);
      }
    },
    {
      key: 'entity', header: 'Entity',
      render: (r: Record<string, unknown>) => `${r.entity_type ?? ''} ${String(r.entity_id ?? '').slice(-8)}`
    },
    {
      key: 'view', header: 'View', width: '80px',
      render: (r: Record<string, unknown>) => (
        <button className={styles.viewBtn} onClick={(e) => { e.stopPropagation(); setSelected(r as unknown as AuditLog); }}>View</button>
      )
    },
  ];

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Audit Logs</h1>

      <FilterBar
        filters={[
          { id: 'region', label: 'Region', value: regionId, options: regionOpts, onChange: setRegionId },
          { id: 'action', label: 'Action Type', value: actionType, options: ACTION_OPTS, onChange: setActionType },
        ]}
        searchPlaceholder="Search..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <DataTable
        columns={columns}
        rows={items as Record<string, unknown>[]}
        isLoading={isLoading}
        emptyMessage="No audit logs found."
      />

      {pagination && (
        <Pagination page={page} pageSize={pagination.page_size} totalItems={pagination.total_items} onPageChange={setPage} />
      )}

      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
            <h2 className={styles.modalTitle}>Audit Log Detail</h2>
            <div className={styles.detailRow}><span className={styles.detailKey}>Date</span><span className={styles.detailVal}>{format(parseISO(selected.created_at), 'MMM d, yyyy · h:mm a')}</span></div>
            <div className={styles.detailRow}><span className={styles.detailKey}>Action</span><span className={styles.detailVal}>{selected.action_type}</span></div>
            <div className={styles.detailRow}><span className={styles.detailKey}>Entity Type</span><span className={styles.detailVal}>{selected.entity_type}</span></div>
            <div className={styles.detailRow}><span className={styles.detailKey}>Entity ID</span><span className={styles.detailVal}>{selected.entity_id}</span></div>
            {selected.details_json && (
              <pre className={styles.jsonPre}>{JSON.stringify(selected.details_json, null, 2)}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
