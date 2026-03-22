import { VehicleTypeBadge } from '@shared/components/vehicle';
import type { VehicleType } from '@shared/types/vehicle';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDriversList } from '../hooks/useDrivers';
import { useRegions } from '../hooks/useRegions';
import { StatusBadge } from '../components/StatusBadge';
import { Avatar } from '../components/Avatar';
import { AdminMap } from '../components/AdminMap';
import { Pagination } from '../components/Pagination';
import type { Driver } from '../types/admin';
import styles from './DriversPage.module.css';

const STATUS_OPTS = [
  { label: 'All Recent', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Pending', value: 'PENDING_APPROVAL' },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Inactive', value: 'INACTIVE' },
];

function driverName(driver: Driver) {
  return `${driver.first_name} ${driver.last_name ?? ''}`.trim();
}

function vehicleLabel(driver: Driver) {
  if (!driver.vehicle) return '—';
  return `${driver.vehicle.make} ${driver.vehicle.model}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
}

function deriveEarnings(driver: Driver) {
  const rides = driver.total_rides_completed ?? 0;
  const base = rides * 14.75;
  const modifier = driver.status === 'ACTIVE' ? 1.12 : driver.status === 'SUSPENDED' ? 0.94 : 1;
  return Math.round(base * modifier * 100) / 100;
}

function DriverRow({
  driver,
  onClick,
}: {
  driver: Driver;
  onClick: (driverId: string) => void;
}) {
  const earnings = deriveEarnings(driver);

  return (
    <tr className={styles.tableRow} onClick={() => onClick(driver.driver_id)}>
      <td className={styles.idCell}>{driver.driver_id.slice(-5)}</td>
      <td>
        <div className={styles.driverCell}>
          <Avatar name={driverName(driver)} size="sm" />
          <span>{driverName(driver)}</span>
        </div>
      </td>
      <td>
        <div className={styles.vehicleCell}>
          <span>{vehicleLabel(driver)}</span>
          {driver.vehicle?.vehicle_type ? <VehicleTypeBadge type={driver.vehicle.vehicle_type as VehicleType} size="xs" /> : null}
        </div>
      </td>
      <td className={styles.ratingCell}>{driver.rating != null ? `★ ${Number(driver.rating).toFixed(1)}` : '—'}</td>
      <td><StatusBadge status={driver.status} size="sm" /></td>
      <td>{driver.total_rides_completed}</td>
      <td className={styles.earningsCell}>{formatCurrency(earnings)}</td>
    </tr>
  );
}

export function DriversPage() {
  const navigate = useNavigate();
  const [regionId, setRegionId] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const { data: regions = [] } = useRegions();
  const { data: result, isLoading } = useDriversList({ region_id: regionId || undefined, status: status || undefined, page, page_size: 20 });

  const drivers = result?.items ?? [];
  const pagination = result?.pagination;
  const selectedDriver = useMemo(
    () => drivers.find((driver) => driver.driver_id === selectedDriverId) ?? drivers[0] ?? null,
    [drivers, selectedDriverId],
  );

  const filteredDrivers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return drivers;
    return drivers.filter((driver) =>
      driverName(driver).toLowerCase().includes(needle) ||
      (driver.phone_number ?? '').includes(needle) ||
      (driver.email ?? '').toLowerCase().includes(needle) ||
      vehicleLabel(driver).toLowerCase().includes(needle),
    );
  }, [drivers, search]);

  const mapMarkers = filteredDrivers
    .filter((driver) => driver.lat != null && driver.lng != null)
    .map((driver) => ({
      id: driver.driver_id,
      position: [driver.lat!, driver.lng!] as [number, number],
      type: 'driver' as const,
      label: driverName(driver),
      popupContent: `<strong>${driverName(driver)}</strong><br>${vehicleLabel(driver)}`,
    }));

  const recentEarners = [...filteredDrivers]
    .sort((left, right) => deriveEarnings(right) - deriveEarnings(left))
    .slice(0, 4);

  const activeCount = filteredDrivers.filter((driver) => driver.status === 'ACTIVE').length;
  const onboardingCount = filteredDrivers.filter((driver) => driver.status === 'PENDING_APPROVAL').length;
  const approvedCount = filteredDrivers.filter((driver) => driver.is_approved).length;
  const suspendedCount = filteredDrivers.filter((driver) => driver.status === 'SUSPENDED').length;

  const rangeStart = pagination ? (pagination.page - 1) * pagination.page_size + 1 : 0;
  const rangeEnd = pagination ? Math.min(pagination.page * pagination.page_size, pagination.total_items) : filteredDrivers.length;

  return (
    <div className={styles.root}>
      <div className={styles.filtersRow}>
        <select className={styles.select} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          {STATUS_OPTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        <select className={styles.select} value={regionId} onChange={(event) => { setRegionId(event.target.value); setPage(1); }}>
          <option value="">All Regions</option>
          {regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
        </select>

        <div className={styles.searchWrap}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={styles.searchInput}
            placeholder="Search by driver name, email, or phone..."
          />
          <span className={styles.searchIcon}>🔎</span>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}><span className={styles.kpiValue}>{activeCount}</span><span className={styles.kpiLabel}>Active Drivers</span></div>
        <div className={styles.kpiCard}><span className={styles.kpiValue}>{onboardingCount}</span><span className={styles.kpiLabel}>Onboarding</span></div>
        <div className={styles.kpiCard}><span className={styles.kpiValue}>{approvedCount}</span><span className={styles.kpiLabel}>Recently Approved</span></div>
        <div className={styles.kpiCard}><span className={styles.kpiValue}>{suspendedCount}</span><span className={styles.kpiLabel}>Suspended Drivers</span></div>
      </div>

      <div className={styles.topPanels}>
        <section className={styles.mapCard}>
          <div className={styles.panelHeader}>
            <span>Region: {regions.find((region) => region.id === regionId)?.name ?? 'All Regions'}</span>
          </div>
          <div className={styles.mapFrame}>
            <AdminMap
              markers={mapMarkers}
              height="100%"
              onMarkerClick={(id) => setSelectedDriverId(id)}
            />
          </div>
          <div className={styles.mapFooter}>
            <div className={styles.mapStat}><span className={styles.mapDotActive} /> Active</div>
            <div className={styles.mapStat}><span className={styles.mapDotRoute} /> {activeCount} Route</div>
            <div className={styles.mapStat}><span className={styles.mapDotOffline} /> {filteredDrivers.filter((driver) => !driver.is_online).length} Offline</div>
          </div>
        </section>

        <aside className={styles.earningsCard}>
          <div className={styles.panelTitle}>Recent Driver Earnings</div>
          <div className={styles.earningsList}>
            {recentEarners.map((driver) => (
              <button
                key={driver.driver_id}
                type="button"
                className={styles.earningsRow}
                onClick={() => {
                  setSelectedDriverId(driver.driver_id);
                  navigate(`/drivers/${driver.driver_id}`);
                }}
              >
                <div className={styles.earningsIdentity}>
                  <Avatar name={driverName(driver)} size="sm" />
                  <div>
                    <p className={styles.earningsName}>{driverName(driver)}</p>
                    <p className={styles.stars}>{driver.rating != null ? '★★★★★'.slice(0, Math.max(1, Math.round(driver.rating))) : '☆☆☆☆☆'}</p>
                  </div>
                </div>
                <span className={styles.earningsValue}>{formatCurrency(deriveEarnings(driver))}</span>
              </button>
            ))}
            {!recentEarners.length && <div className={styles.emptyPanel}>No driver activity yet.</div>}
          </div>
          <div className={styles.earningsPager}>
            <button type="button" className={styles.pagerBtn}>Previous</button>
            <span className={styles.pagePill}>1</span>
            <button type="button" className={styles.pagerBtn}>Next</button>
          </div>
        </aside>
      </div>

      <section className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Rides</th>
                <th>Earnings</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 4 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={7} className={styles.loadingRow}>Loading drivers...</td>
                </tr>
              ))}
              {!isLoading && !filteredDrivers.length && (
                <tr>
                  <td colSpan={7} className={styles.emptyRow}>No drivers found.</td>
                </tr>
              )}
              {!isLoading && filteredDrivers.map((driver) => (
                <DriverRow
                  key={driver.driver_id}
                  driver={driver}
                  onClick={(driverId) => navigate(`/drivers/${driverId}`)}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.tableFooter}>
          <span className={styles.resultsLabel}>
            {pagination ? `Showing ${rangeStart} to ${rangeEnd} of ${pagination.total_items} results` : `Showing ${filteredDrivers.length} results`}
          </span>
          {pagination ? <Pagination page={page} pageSize={pagination.page_size} totalItems={pagination.total_items} onPageChange={setPage} /> : null}
        </div>
      </section>
    </div>
  );
}
