import { useEffect, useMemo, useState } from 'react';

import {
  createRegion,
  getRegionMetrics,
  getRegions,
  toggleRegionActive,
  updateRegion,
  type RegionMetrics,
  type RegionPayload,
  type RegionRecord,
} from '../api/admin';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { PageTitle } from '../components/common/PageTitle';
import { StatusBadge } from '../components/common/StatusBadge';

const EMPTY_FORM: RegionPayload = {
  code: '',
  name: '',
  city: '',
  state: '',
  country: 'USA',
  is_active: true,
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  'h-11 w-full rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15';

function RegionForm({
  initialValue,
  title,
  actionLabel,
  submitting,
  onSubmit,
  onCancel,
}: {
  initialValue: RegionPayload;
  title: string;
  actionLabel: string;
  submitting: boolean;
  onSubmit: (payload: RegionPayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<RegionPayload>(initialValue);

  useEffect(() => {
    setForm(initialValue);
  }, [initialValue]);

  return (
    <div className="w-full max-w-xl rounded-[24px] border border-line bg-white shadow-xl">
      <div className="border-b border-line px-6 py-5">
        <h2 className="text-xl font-semibold text-ink">{title}</h2>
      </div>
      <form
        className="space-y-4 px-6 py-6"
        onSubmit={async (event) => {
          event.preventDefault();
          await onSubmit(form);
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Code">
            <input
              required
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
              className={inputClassName}
              placeholder="long_beach_ca"
            />
          </Field>
          <Field label="Name">
            <input
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className={inputClassName}
              placeholder="Long Beach"
            />
          </Field>
          <Field label="City">
            <input
              required
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
              className={inputClassName}
              placeholder="Long Beach"
            />
          </Field>
          <Field label="State">
            <input
              required
              value={form.state}
              onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
              className={inputClassName}
              placeholder="CA"
            />
          </Field>
          <Field label="Country">
            <input
              required
              value={form.country}
              onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
              className={inputClassName}
              placeholder="USA"
            />
          </Field>
          <Field label="Status">
            <select
              value={form.is_active ? 'ACTIVE' : 'INACTIVE'}
              onChange={(event) =>
                setForm((current) => ({ ...current, is_active: event.target.value === 'ACTIVE' }))
              }
              className={inputClassName}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-line px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-[#f7f5ef]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accentDark disabled:opacity-60"
          >
            {submitting ? 'Saving...' : actionLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function RegionDetailPanel({
  region,
  metrics,
  loadingMetrics,
  onEdit,
  onClose,
}: {
  region: RegionRecord;
  metrics: RegionMetrics | null;
  loadingMetrics: boolean;
  onEdit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="w-full max-w-md rounded-[24px] border border-line bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-line px-6 py-5">
        <div>
          <h2 className="text-xl font-semibold text-ink">{region.name}</h2>
          <p className="mt-1 text-sm text-muted">{region.code}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-[#f7f5ef] hover:text-ink"
        >
          Close
        </button>
      </div>
      <div className="space-y-5 px-6 py-6">
        <div className="flex items-center justify-between">
          <StatusBadge status={region.is_active ? 'ACTIVE' : 'INACTIVE'} />
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink transition hover:bg-[#f7f5ef]"
          >
            Edit Region
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">City</p>
            <p className="mt-1 text-sm text-ink">{region.city || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">State</p>
            <p className="mt-1 text-sm text-ink">{region.state || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Country</p>
            <p className="mt-1 text-sm text-ink">{region.country || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Coverage</p>
            <p className="mt-1 text-sm text-ink">{region.cityState || '—'}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-[#faf8f3] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Region Metrics</p>
          {loadingMetrics ? (
            <p className="mt-3 text-sm text-muted">Loading metrics...</p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted">Drivers Online</p>
                <p className="mt-1 text-xl font-semibold text-ink">{metrics?.drivers_online ?? region.activeDrivers ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Active Rides</p>
                <p className="mt-1 text-xl font-semibold text-ink">{metrics?.active_rides ?? region.activeRides ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Pending Approvals</p>
                <p className="mt-1 text-xl font-semibold text-ink">{metrics?.pending_approvals ?? region.pendingApprovals ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Matching Load</p>
                <p className="mt-1 text-xl font-semibold text-ink">{metrics?.matching_load ?? region.matchingLoad ?? 0}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function RegionsPage() {
  const [regions, setRegions] = useState<RegionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [selectedRegion, setSelectedRegion] = useState<RegionRecord | null>(null);
  const [metrics, setMetrics] = useState<RegionMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [editingRegion, setEditingRegion] = useState<RegionRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadRegions() {
    setLoading(true);
    setError(null);
    try {
      const data = await getRegions();
      setRegions(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load regions');
      setRegions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRegions();
  }, []);

  useEffect(() => {
    if (!selectedRegion) {
      setMetrics(null);
      return;
    }

    let cancelled = false;
    async function loadMetrics() {
      setLoadingMetrics(true);
      try {
        const result = await getRegionMetrics(selectedRegion.id);
        if (!cancelled) {
          setMetrics(result);
        }
      } finally {
        if (!cancelled) {
          setLoadingMetrics(false);
        }
      }
    }

    loadMetrics();
    return () => {
      cancelled = true;
    };
  }, [selectedRegion]);

  const filteredRegions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return regions;
    }
    return regions.filter((region) =>
      [region.name, region.code, region.city, region.state, region.country, region.cityState]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [regions, search]);

  async function handleCreate(payload: RegionPayload) {
    setSubmitting(true);
    try {
      const created = await createRegion(payload);
      setRegions((current) => [created, ...current]);
      setShowCreate(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(payload: RegionPayload) {
    if (!editingRegion) {
      return;
    }
    setSubmitting(true);
    try {
      const updated = await updateRegion(editingRegion.id, payload);
      setRegions((current) =>
        current.map((region) => (region.id === editingRegion.id ? { ...region, ...updated } : region))
      );
      setSelectedRegion((current) => (current?.id === editingRegion.id ? { ...current, ...updated } : current));
      setEditingRegion(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(region: RegionRecord) {
    const updated = await toggleRegionActive(region.id);
    setRegions((current) =>
      current.map((entry) =>
        entry.id === region.id ? { ...entry, is_active: updated.is_active } : entry
      )
    );
    setSelectedRegion((current) =>
      current?.id === region.id ? { ...current, is_active: updated.is_active } : current
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <PageTitle
          title="Regions"
          subtitle="Create, update, and inspect operating regions used across the platform."
        />
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accentDark"
        >
          Create Region
        </button>
      </div>

      <div className="rounded-3xl border border-line bg-white p-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search region name, code, city, or state..."
          className={inputClassName}
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#fbfaf7] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-4 font-medium">Region</th>
                <th className="px-5 py-4 font-medium">Code</th>
                <th className="px-5 py-4 font-medium">City / State</th>
                <th className="px-5 py-4 font-medium">Drivers</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10">
                    <LoadingState label="Loading regions..." className="border-0 rounded-none px-0 py-0" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10">
                    <EmptyState title="Unable to load regions" description={error} icon="!" className="border-0 rounded-none" />
                  </td>
                </tr>
              ) : filteredRegions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10">
                    <EmptyState title="No regions found" description="Try a different search or create a new region." icon="○" className="border-0 rounded-none" />
                  </td>
                </tr>
              ) : (
                filteredRegions.map((region) => (
                  <tr key={region.id} className="border-t border-line text-sm text-ink transition hover:bg-[#fcfbf8]">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-ink">{region.name}</p>
                        <p className="mt-1 text-xs text-muted">{region.country || '—'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-muted">{region.code || '—'}</td>
                    <td className="px-5 py-4 text-muted">{region.cityState || '—'}</td>
                    <td className="px-5 py-4 text-ink">{region.activeDrivers ?? 0}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={region.is_active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRegion(region)}
                          className="rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink transition hover:bg-[#f7f5ef]"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingRegion(region)}
                          className="rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink transition hover:bg-[#f7f5ef]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(region)}
                          className="rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink transition hover:bg-[#f7f5ef]"
                        >
                          {region.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(showCreate || editingRegion || selectedRegion) ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/35 p-4 backdrop-blur-[2px]">
          {showCreate ? (
            <RegionForm
              initialValue={EMPTY_FORM}
              title="Create Region"
              actionLabel="Create Region"
              submitting={submitting}
              onSubmit={handleCreate}
              onCancel={() => setShowCreate(false)}
            />
          ) : editingRegion ? (
            <RegionForm
              initialValue={{
                code: editingRegion.code || '',
                name: editingRegion.name,
                city: editingRegion.city || '',
                state: editingRegion.state || '',
                country: editingRegion.country || 'USA',
                is_active: editingRegion.is_active ?? true,
              }}
              title="Edit Region"
              actionLabel="Save Changes"
              submitting={submitting}
              onSubmit={handleEdit}
              onCancel={() => setEditingRegion(null)}
            />
          ) : selectedRegion ? (
            <RegionDetailPanel
              region={selectedRegion}
              metrics={metrics}
              loadingMetrics={loadingMetrics}
              onEdit={() => setEditingRegion(selectedRegion)}
              onClose={() => setSelectedRegion(null)}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
