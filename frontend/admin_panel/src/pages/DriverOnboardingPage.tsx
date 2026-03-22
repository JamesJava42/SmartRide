import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getRegions, type RegionRecord } from '../api/admin';
import { createDriver, getOnboardingQueue, type CreateDriverPayload } from '../api/onboarding';
import type { QueueItem } from '../types/onboarding';
import { OnboardingFilters } from '../components/onboarding/OnboardingFilters';
import { OnboardingTable } from '../components/onboarding/OnboardingTable';
import { PageTitle } from '../components/common/PageTitle';

const EMPTY_FORM: CreateDriverPayload = {
  name: '',
  email: '',
  phone: '',
  password: '',
  region_id: '',
  vehicle_make: '',
  vehicle_model: '',
  vehicle_year: '',
  vehicle_color: '',
  vehicle_class: '',
  vehicle_license_plate: '',
  vehicle_mpg: '',
};

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15';

export function DriverOnboardingPage() {
  const navigate = useNavigate();

  // Queue state
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, page_size: 20, total_items: 0, total_pages: 1 });

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [search, setSearch] = useState('');

  // Regions for filter + create form
  const [regions, setRegions] = useState<RegionRecord[]>([]);

  // Create driver panel
  const [showPanel, setShowPanel] = useState(false);
  const [form, setForm] = useState<CreateDriverPayload>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getRegions().then(setRegions);
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [statusFilter, regionFilter, pagination.page]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchQueue();
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [search]);

  async function fetchQueue() {
    setLoading(true);
    try {
      const res = await getOnboardingQueue({
        status: statusFilter || undefined,
        region: regionFilter || undefined,
        page: pagination.page,
        page_size: pagination.page_size,
      });
      setItems(res.items);
      setPagination(res.pagination);
    } finally {
      setLoading(false);
    }
  }

  function setField(field: keyof CreateDriverPayload, value: string | number | '') {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openPanel() {
    setForm(EMPTY_FORM);
    setError(null);
    setShowPanel(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createDriver(form);
      setShowPanel(false);
      fetchQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create driver profile');
    } finally {
      setSubmitting(false);
    }
  }

  // Client-side search filter on name/phone
  const visibleItems = search.trim()
    ? items.filter(
        (item) =>
          item.driver_name.toLowerCase().includes(search.toLowerCase()) ||
          item.phone_number.includes(search)
      )
    : items;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <PageTitle title="Driver Onboarding Queue" />
        <button
          className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accentDark"
          onClick={openPanel}
          type="button"
        >
          + Create Driver
        </button>
      </div>

      {/* Filters */}
      <OnboardingFilters
        statusFilter={statusFilter}
        regionFilter={regionFilter}
        search={search}
        onStatusChange={(v) => { setStatusFilter(v); setPagination((p) => ({ ...p, page: 1 })); }}
        onRegionChange={(v) => { setRegionFilter(v); setPagination((p) => ({ ...p, page: 1 })); }}
        onSearchChange={setSearch}
        regions={regions}
      />

      {/* Queue table */}
      <OnboardingTable
        items={visibleItems}
        loading={loading}
        onReview={(id) => navigate(`/onboarding/${id}`)}
      />

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            Page {pagination.page} of {pagination.total_pages} · {pagination.total_items} total
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-[#f7f7f5] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.total_pages}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-[#f7f7f5] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create driver slide-in drawer */}
      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px]"
            onClick={() => !submitting && setShowPanel(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-ink">Create Driver Profile</h2>
                <p className="mt-0.5 text-xs text-muted">Fill in all required fields to register a new driver.</p>
              </div>
              <button
                aria-label="Close"
                className="rounded-xl p-2 text-muted transition hover:bg-[#f7f7f5] hover:text-ink"
                disabled={submitting}
                onClick={() => setShowPanel(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
                <section>
                  <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted">Personal Info</h3>
                  <div className="space-y-3">
                    <Field label="Full Name">
                      <input required className={inputCls} placeholder="e.g. Katie Miller" value={form.name}
                        onChange={(e) => setField('name', e.target.value)} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Email">
                        <input required type="email" className={inputCls} placeholder="katie@example.com"
                          value={form.email} onChange={(e) => setField('email', e.target.value)} />
                      </Field>
                      <Field label="Phone">
                        <input required type="tel" className={inputCls} placeholder="+1 555 000 0000"
                          value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Temporary Password">
                        <input required type="password" minLength={8} className={inputCls} placeholder="Min. 8 characters"
                          value={form.password} onChange={(e) => setField('password', e.target.value)} />
                      </Field>
                      <Field label="Region">
                        <select required className={inputCls} value={form.region_id}
                          onChange={(e) => setField('region_id', e.target.value)}>
                          <option value="">Select region…</option>
                          {regions.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted">Vehicle</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Make">
                        <input required className={inputCls} placeholder="Toyota" value={form.vehicle_make}
                          onChange={(e) => setField('vehicle_make', e.target.value)} />
                      </Field>
                      <Field label="Model">
                        <input required className={inputCls} placeholder="Camry" value={form.vehicle_model}
                          onChange={(e) => setField('vehicle_model', e.target.value)} />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Year">
                        <input required type="number" min={1990} max={new Date().getFullYear() + 1}
                          className={inputCls} placeholder="2022" value={form.vehicle_year}
                          onChange={(e) => setField('vehicle_year', e.target.value ? Number(e.target.value) : '')} />
                      </Field>
                      <Field label="Color">
                        <input required className={inputCls} placeholder="Silver" value={form.vehicle_color}
                          onChange={(e) => setField('vehicle_color', e.target.value)} />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Class">
                        <select required className={inputCls} value={form.vehicle_class}
                          onChange={(e) => setField('vehicle_class', e.target.value)}>
                          <option value="">Select…</option>
                          <option value="economy">Economy</option>
                          <option value="comfort">Comfort</option>
                          <option value="premium">Premium</option>
                          <option value="xl">XL</option>
                        </select>
                      </Field>
                      <Field label="License Plate">
                        <input required className={inputCls} placeholder="8ABC123" value={form.vehicle_license_plate}
                          onChange={(e) => setField('vehicle_license_plate', e.target.value)} />
                      </Field>
                    </div>
                    <Field label="MPG" optional>
                      <input className={inputCls} placeholder="32" value={form.vehicle_mpg}
                        onChange={(e) => setField('vehicle_mpg', e.target.value)} />
                    </Field>
                  </div>
                </section>

                {error && (
                  <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>
                )}
              </div>

              <div className="flex gap-3 border-t border-line px-6 py-4">
                <button type="submit" disabled={submitting}
                  className="flex-1 rounded-2xl bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accentDark disabled:opacity-60">
                  {submitting ? 'Creating…' : 'Create Driver'}
                </button>
                <button type="button" disabled={submitting} onClick={() => setShowPanel(false)}
                  className="rounded-2xl border border-line px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#f7f7f5] disabled:opacity-60">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
