import { VehicleTypeBadge } from '@shared/components/vehicle';
import type { VehicleType } from '@shared/types/vehicle';
import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActiveRides } from '../hooks/useRides';
import { useUnmatchedRidesReport } from '../hooks/useUnmatchedRidesReport';
import { useRegions } from '../hooks/useRegions';
import { redispatchRide } from '../api/rides';
import { DataTable } from '../components/DataTable';
import { FilterBar } from '../components/FilterBar';
import { StatusBadge } from '../components/StatusBadge';
import { Avatar } from '../components/Avatar';
import { AdminMap } from '../components/AdminMap';
import type { ActiveRide } from '../types/admin';
import styles from './LiveRidesPage.module.css';

const STATUS_OPTS = [
  { label: 'All Statuses', value: '' },
  { label: 'Matching', value: 'MATCHING' },
  { label: 'Assigned', value: 'DRIVER_ASSIGNED' },
  { label: 'En Route', value: 'DRIVER_EN_ROUTE' },
  { label: 'Arrived', value: 'DRIVER_ARRIVED' },
  { label: 'Started', value: 'RIDE_STARTED' },
  { label: 'No Drivers Found', value: 'NO_DRIVERS_FOUND' },
];

const PRODUCT_OPTS = [
  { label: 'All Types', value: '' },
  { label: 'Economy', value: 'ECONOMY' },
  { label: 'Comfort', value: 'COMFORT' },
  { label: 'Premium', value: 'PREMIUM' },
  { label: 'XL', value: 'XL' },
];

export function LiveRidesPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'split' | 'table'>('split');
  const [regionId, setRegionId] = useState('');
  const [status, setStatus] = useState('');
  const [product, setProduct] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);

  const { data: regions = [] } = useRegions();
  const { data: rides = [], isLoading } = useActiveRides({ region_id: regionId || undefined, status: status || undefined });
  const { data: unmatchedReport, isLoading: unmatchedLoading } = useUnmatchedRidesReport();
  const redispatchMutation = useMutation({
    mutationFn: redispatchRide,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rides', 'active'] });
    },
  });

  const regionOpts = [{ label: 'All Regions', value: '' }, ...regions.map((r) => ({ label: r.name, value: r.id }))];

  const filtered = useMemo(() => {
    let r = rides as ActiveRide[];
    if (search) {
      const s = search.toLowerCase();
      r = r.filter((ride) =>
        ride.ride_id.toLowerCase().includes(s) ||
        ride.rider_name?.toLowerCase().includes(s) ||
        ride.driver_name?.toLowerCase().includes(s)
      );
    }
    if (product) r = r.filter((ride) => ride.product_type === product);
    return r;
  }, [rides, search, product]);

  const mapMarkers = filtered
    .filter((r) => r.driver_lat != null && r.driver_lng != null)
    .map((r) => ({
      id: r.ride_id,
      position: [r.driver_lat!, r.driver_lng!] as [number, number],
      type: 'driver' as const,
      popupContent: `<strong>${r.driver_name}</strong><br>Rider: ${r.rider_name}<br>Status: ${r.status}`,
    }));

  const columns = [
    {
      key: 'ride_id',
      header: 'ID',
      width: '110px',
      render: (r: Record<string, unknown>) => (
        <div className={styles.idCell}>
          <span className={styles.idValue}>{String(r.ride_id ?? '').slice(-8)}</span>
          <span className={styles.idMeta}>{String(r.status ?? '').replaceAll('_', ' ')}</span>
        </div>
      ),
    },
    {
      key: 'rider_name',
      header: 'Rider',
      render: (r: Record<string, unknown>) => {
        const riderName = String(r.rider_name || 'Rider');
        return (
          <div className={styles.personCell}>
            <Avatar name={riderName} size="sm" />
            <div className={styles.personCopy}>
              <span className={styles.primaryText}>{riderName}</span>
              <span className={styles.secondaryText}>{String(r.pickup_address ?? 'Pickup pending')}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'driver_name',
      header: 'Driver',
      render: (r: Record<string, unknown>) => {
        const driverName = String(r.driver_name || 'Awaiting match');
        return (
          <div className={styles.personCell}>
            <Avatar name={driverName} size="sm" />
            <div className={styles.personCopy}>
              <span className={styles.primaryText}>{driverName}</span>
              <span className={styles.secondaryText}>{String(r.dropoff_address ?? 'Dropoff pending')}</span>
            </div>
          </div>
        );
      },
    },
    { key: 'product_type', header: 'Product', render: (r: Record<string, unknown>) => {
      const productType = r.product_type;
      return (
        <div className={styles.productCell}>
          {typeof productType === 'string' ? <VehicleTypeBadge type={productType as VehicleType} size="xs" /> : <span className={styles.mutedValue}>Awaiting match</span>}
          <span className={styles.secondaryText}>{String(r.region ?? 'Dispatch region pending')}</span>
        </div>
      );
    } },
    { key: 'status', header: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={String(r.status ?? '')} size="sm" /> },
    {
      key: 'eta_minutes',
      header: 'ETA',
      render: (r: Record<string, unknown>) => (
        <div className={styles.etaCell}>
          <span className={styles.primaryText}>{r.eta_minutes != null ? `${r.eta_minutes} min` : '—'}</span>
          <span className={styles.secondaryText}>
            {r.requested_at ? new Date(String(r.requested_at)).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Requested now'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '150px',
      render: (r: Record<string, unknown>) => {
        const rideId = String(r.ride_id ?? '');
        const canRedispatch = String(r.status ?? '').toUpperCase() === 'NO_DRIVERS_FOUND';
        if (!canRedispatch) {
          return <span className={styles.mutedValue}>—</span>;
        }
        return (
          <button
            type="button"
            className={styles.redispatchBtn}
            disabled={redispatchMutation.isPending}
            onClick={(event) => {
              event.stopPropagation();
              redispatchMutation.mutate(rideId);
            }}
          >
            {redispatchMutation.isPending ? 'Redispatching…' : 'Redispatch'}
          </button>
        );
      },
    },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <h1 className={styles.title}>Live Rides</h1>
        <div className={styles.viewToggle}>
          <button className={`${styles.toggleBtn} ${view === 'split' ? styles.toggleBtnActive : ''}`} onClick={() => setView('split')}>⊟ Split</button>
          <button className={`${styles.toggleBtn} ${view === 'table' ? styles.toggleBtnActive : ''}`} onClick={() => setView('table')}>☰ Table</button>
        </div>
      </div>

      <FilterBar
        filters={[
          { id: 'region', label: 'Region', value: regionId, options: regionOpts, onChange: setRegionId },
          { id: 'status', label: 'Status', value: status, options: STATUS_OPTS, onChange: setStatus },
          { id: 'product', label: 'Product', value: product, options: PRODUCT_OPTS, onChange: setProduct },
        ]}
        searchPlaceholder="Search by ID, rider, driver..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <section className={styles.reportCard}>
        <div className={styles.reportHeader}>
          <div>
            <h2 className={styles.reportTitle}>Unmatched Rides</h2>
            <p className={styles.reportSubtitle}>
              Dispatch stops after {unmatchedReport?.max_dispatch_retries ?? 0} retry cycle{(unmatchedReport?.max_dispatch_retries ?? 0) === 1 ? '' : 's'}.
            </p>
          </div>
          <div className={styles.reportMetric}>
            <span className={styles.reportMetricValue}>{unmatchedReport?.total_unmatched_rides ?? 0}</span>
            <span className={styles.reportMetricLabel}>Currently unmatched</span>
          </div>
        </div>

        {unmatchedLoading ? (
          <div className={styles.reportEmpty}>Loading unmatched rides…</div>
        ) : unmatchedReport && unmatchedReport.items.length > 0 ? (
          <div className={styles.reportList}>
            {unmatchedReport.items.slice(0, 5).map((ride) => (
              <div key={ride.ride_id} className={styles.reportRow}>
                <div className={styles.reportRoute}>
                  <span className={styles.primaryText}>{ride.rider_name}</span>
                  <span className={styles.secondaryText}>{ride.pickup_address} → {ride.dropoff_address}</span>
                </div>
                <div className={styles.reportMeta}>
                  <span className={styles.primaryText}>Retries: {ride.dispatch_retry_count}</span>
                  <span className={styles.secondaryText}>{ride.recent_activity}</span>
                </div>
                <button
                  type="button"
                  className={styles.redispatchBtn}
                  disabled={redispatchMutation.isPending}
                  onClick={() => redispatchMutation.mutate(ride.ride_id)}
                >
                  {redispatchMutation.isPending ? 'Redispatching…' : 'Redispatch'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.reportEmpty}>No unmatched rides right now.</div>
        )}
      </section>

      {view === 'split' ? (
        <div className={styles.splitView}>
          <div className={styles.tablePanel}>
            <DataTable
              columns={columns}
              rows={filtered as Record<string, unknown>[]}
              isLoading={isLoading}
              onRowClick={(r) => setSelectedRideId(String(r.ride_id))}
              emptyMessage="No active rides match your filters."
            />
          </div>
          <div className={styles.mapPanel}>
            <AdminMap
              markers={mapMarkers}
              height="calc(100vh - 220px)"
              onMarkerClick={(id) => setSelectedRideId(id)}
            />
          </div>
        </div>
      ) : (
        <div className={styles.fullTable}>
          <DataTable
            columns={[...columns, { key: 'region', header: 'Region' }, { key: 'fare', header: 'Fare', render: (r: Record<string, unknown>) => r.fare != null ? `$${Number(r.fare).toFixed(2)}` : '—' }]}
            rows={filtered as Record<string, unknown>[]}
            isLoading={isLoading}
            onRowClick={(r) => setSelectedRideId(String(r.ride_id))}
            emptyMessage="No active rides match your filters."
          />
        </div>
      )}
    </div>
  );
}
