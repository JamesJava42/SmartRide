import { useState } from 'react';
import { SectionCard } from '../../common/SectionCard';
import { useDriverDetail, useUpdateRegion } from '../../../hooks/useDriverDetail';
import { updateDriverProfile } from '../../../api/drivers';
import { useRegions } from '../../../hooks/useRegions';
import { useToast } from '../../../hooks/useToast';
import { format, parseISO } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import styles from './ProfileTab.module.css';

interface Props { driverId: string; }

function EditableSection({
  title,
  fields,
  values,
  onSave,
}: {
  title: string;
  fields: { key: string; label: string; type?: string; options?: string[] }[];
  values: Record<string, string>;
  onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(values);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(draft);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard
      title={title}
      action={
        !editing ? (
          <button className={styles.editBtn} onClick={() => { setDraft(values); setEditing(true); }}>
            {saved ? <span style={{ color: 'var(--green-700)' }}>✓ Saved</span> : 'Edit'}
          </button>
        ) : (
          <div className={styles.editActions}>
            <button className={styles.cancelBtn} onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? '…' : 'Save'}
            </button>
          </div>
        )
      }
    >
      <div className={styles.fields}>
        {fields.map((f) => (
          <div key={f.key} className={styles.fieldRow}>
            <label className={styles.fieldLabel}>{f.label}</label>
            {editing ? (
              f.options ? (
                <select
                  className={styles.input}
                  value={draft[f.key] ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                >
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  className={styles.input}
                  type={f.type ?? 'text'}
                  value={draft[f.key] ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                />
              )
            ) : (
              <span className={styles.fieldValue}>{values[f.key] || '—'}</span>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function RegionsPanel({ driverId, currentRegionId }: { driverId: string; currentRegionId: string | null }) {
  const { data: regions = [] } = useRegions();
  const updateRegion = useUpdateRegion();
  const { showSuccess, showError } = useToast();
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(currentRegionId ?? '');
  const [saving, setSaving] = useState(false);

  const currentRegion = regions.find((r) => r.id === currentRegionId);

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      await updateRegion.mutateAsync({ driverId, regionId: selected });
      showSuccess('Region updated');
      setEditing(false);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to update region');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard
      title="Region Assignment"
      action={
        !editing ? (
          <button className={styles.editBtn} onClick={() => { setSelected(currentRegionId ?? ''); setEditing(true); }}>
            {currentRegionId ? 'Change' : 'Assign'}
          </button>
        ) : (
          <div className={styles.editActions}>
            <button className={styles.cancelBtn} onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving || !selected}>
              {saving ? '…' : 'Save'}
            </button>
          </div>
        )
      }
    >
      {!editing ? (
        <div className={styles.regionDisplay}>
          {currentRegion ? (
            <>
              <span className={styles.regionName}>{currentRegion.name}</span>
              <span className={styles.regionSub}>{currentRegion.city}, {currentRegion.state}</span>
            </>
          ) : (
            <span className={styles.noRegion}>No region assigned</span>
          )}
        </div>
      ) : (
        <div>
          <p className={styles.regionHint}>Select the region this driver is allowed to operate in.</p>
          <div className={styles.regionList}>
            {regions.map((r) => (
              <label key={r.id} className={`${styles.regionOption} ${selected === r.id ? styles.regionOptionActive : ''}`}>
                <input
                  type="radio"
                  name="region"
                  value={r.id}
                  checked={selected === r.id}
                  onChange={() => setSelected(r.id)}
                  className={styles.regionRadio}
                />
                <div className={styles.regionOptionInfo}>
                  <span className={styles.regionOptionName}>{r.name}</span>
                  <span className={styles.regionOptionSub}>{r.city}, {r.state} · {r.code}</span>
                </div>
                {selected === r.id && <span className={styles.regionCheck}>✓</span>}
              </label>
            ))}
            {regions.length === 0 && <p className={styles.noRegion}>No regions available</p>}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

export function ProfileTab({ driverId }: Props) {
  const { data: driver, isLoading } = useDriverDetail(driverId);
  const { showSuccess, showError } = useToast();
  const qc = useQueryClient();

  if (isLoading) return <div className={styles.loading}><div className={styles.sk} /><div className={styles.sk} /></div>;
  if (!driver) return null;

  async function saveSection(payload: Partial<typeof driver>) {
    try {
      await updateDriverProfile(driverId, payload);
      qc.invalidateQueries({ queryKey: ['driver', driverId] });
      showSuccess('Profile updated');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Save failed');
      throw e;
    }
  }

  return (
    <div className={styles.grid}>
      <EditableSection
        title="Personal Info"
        fields={[
          { key: 'first_name', label: 'First Name' },
          { key: 'last_name', label: 'Last Name' },
        ]}
        values={{ first_name: driver.first_name, last_name: driver.last_name ?? '' }}
        onSave={(d) => saveSection({ first_name: d.first_name, last_name: d.last_name })}
      />

      <EditableSection
        title="Contact Info"
        fields={[
          { key: 'email', label: 'Email', type: 'email' },
          { key: 'phone_number', label: 'Phone' },
        ]}
        values={{ email: driver.email, phone_number: driver.phone_number }}
        onSave={(d) => saveSection({ email: d.email, phone_number: d.phone_number })}
      />

      <RegionsPanel driverId={driverId} currentRegionId={driver.region_id ?? null} />

      <SectionCard title="Account Status">
        <div className={styles.statusGrid}>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Account Active</span>
            <span className={styles.statusDot} style={{ background: driver.is_active !== false ? '#10B981' : '#EF4444' }} />
            <span className={styles.statusVal}>{driver.is_active !== false ? 'Yes' : 'No'}</span>
          </div>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Verified</span>
            <span className={styles.statusDot} style={{ background: driver.is_verified ? '#10B981' : '#D1D5DB' }} />
            <span className={styles.statusVal}>{driver.is_verified ? 'Yes' : 'No'}</span>
          </div>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Role</span>
            <span className={styles.roleBadge}>DRIVER</span>
          </div>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Member Since</span>
            <span className={styles.statusVal}>{driver.created_at ? format(parseISO(driver.created_at), 'MMM d, yyyy') : '—'}</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
