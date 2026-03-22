import { Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { Vehicle } from "../../types/vehicle";
import VehicleTypeIcon from "./VehicleTypeIcon";
import { VEHICLE_TYPE_CONFIG, type VehicleType } from "./vehicleConfig";
import styles from "./VehicleEditForm.module.css";

export interface VehicleEditFormProps {
  vehicle: Vehicle;
  onSave: (updated: Partial<Vehicle>) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

interface VehicleFormState {
  make: string;
  model: string;
  year: number;
  color: string;
  plate_number: string;
  vehicle_type: VehicleType;
  seat_capacity: number;
  fuel_type: string;
  mileage_city: string;
  mileage_highway: string;
  is_active: boolean;
}

type VehicleFormErrors = Partial<Record<keyof VehicleFormState, string>>;

const FUEL_OPTIONS = ["Gas", "Diesel", "Hybrid", "Electric", "Other"];

function toState(vehicle: Vehicle): VehicleFormState {
  return {
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color ?? "",
    plate_number: vehicle.plate_number,
    vehicle_type: vehicle.vehicle_type,
    seat_capacity: vehicle.seat_capacity,
    fuel_type: vehicle.fuel_type ?? "",
    mileage_city: vehicle.mileage_city != null ? String(vehicle.mileage_city) : "",
    mileage_highway: vehicle.mileage_highway != null ? String(vehicle.mileage_highway) : "",
    is_active: vehicle.is_active,
  };
}

function pluralize(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"} changed`;
}

function roundMpg(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : null;
}

function validate(form: VehicleFormState): VehicleFormErrors {
  const errors: VehicleFormErrors = {};
  if (!form.make.trim()) errors.make = "Make is required";
  else if (form.make.trim().length > 64) errors.make = "Make must be 64 characters or fewer";

  if (!form.model.trim()) errors.model = "Model is required";
  else if (form.model.trim().length > 64) errors.model = "Model must be 64 characters or fewer";

  if (!Number.isInteger(form.year) || form.year < 2000 || form.year > 2030) {
    errors.year = "Year must be between 2000 and 2030";
  }

  if (!form.plate_number.trim()) errors.plate_number = "Plate number is required";
  else if (form.plate_number.trim().length < 2 || form.plate_number.trim().length > 32) {
    errors.plate_number = "Plate number must be between 2 and 32 characters";
  }

  if (!["ECONOMY", "COMFORT", "PREMIUM", "XL"].includes(form.vehicle_type)) {
    errors.vehicle_type = "Select a valid vehicle type";
  }

  if (!Number.isInteger(form.seat_capacity) || form.seat_capacity < 1 || form.seat_capacity > 12) {
    errors.seat_capacity = "Seats must be between 1 and 12";
  }

  const cityProvided = form.mileage_city.trim() !== "";
  const highwayProvided = form.mileage_highway.trim() !== "";
  if (cityProvided !== highwayProvided) {
    errors.mileage_city = "Provide both city and highway MPG";
    errors.mileage_highway = "Provide both city and highway MPG";
  }
  if (cityProvided && (!Number.isFinite(Number(form.mileage_city)) || Number(form.mileage_city) <= 0)) {
    errors.mileage_city = "City MPG must be a positive number";
  }
  if (highwayProvided && (!Number.isFinite(Number(form.mileage_highway)) || Number(form.mileage_highway) <= 0)) {
    errors.mileage_highway = "Highway MPG must be a positive number";
  }

  return errors;
}

function buildDiff(initial: VehicleFormState, form: VehicleFormState, changedFields: Set<string>): Partial<Vehicle> {
  const diff: Partial<Vehicle> = {};
  for (const field of changedFields) {
    switch (field) {
      case "make":
      case "model":
        diff[field] = form[field].trim();
        break;
      case "year":
      case "seat_capacity":
        diff[field] = Number.parseInt(String(form[field]), 10) as never;
        break;
      case "color":
      case "fuel_type":
        diff[field] = (form[field].trim() || null) as never;
        break;
      case "plate_number":
        diff.plate_number = form.plate_number.trim().toUpperCase();
        break;
      case "vehicle_type":
        diff.vehicle_type = form.vehicle_type;
        break;
      case "mileage_city":
        diff.mileage_city = (form.mileage_city.trim() === "" ? null : roundMpg(form.mileage_city)) as never;
        break;
      case "mileage_highway":
        diff.mileage_highway = (form.mileage_highway.trim() === "" ? null : roundMpg(form.mileage_highway)) as never;
        break;
      case "is_active":
        diff.is_active = form.is_active;
        break;
      default:
        break;
    }
  }
  return diff;
}

function FormField({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label}
        {required ? <span className={styles.required}>*</span> : null}
      </label>
      {children}
      {error ? <span className={styles.error}>{error}</span> : hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}

export default function VehicleEditForm({ vehicle, onSave, onCancel, isSaving = false }: VehicleEditFormProps) {
  const [form, setForm] = useState<VehicleFormState>(() => toState(vehicle));
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<VehicleFormErrors>({});

  useEffect(() => {
    setForm(toState(vehicle));
    setChangedFields(new Set());
    setErrors({});
  }, [vehicle]);

  const initialState = useMemo(() => toState(vehicle), [vehicle]);
  const hasChanges = changedFields.size > 0;
  const subtitle = `${vehicle.year} ${vehicle.make} ${vehicle.model} · ${vehicle.plate_number}`;

  function updateField<K extends keyof VehicleFormState>(key: K, value: VehicleFormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      setChangedFields((prev) => {
        const nextFields = new Set(prev);
        const normalizedInitial = initialState[key];
        const normalizedNext = next[key];
        if (String(normalizedInitial) === String(normalizedNext)) nextFields.delete(String(key));
        else nextFields.add(String(key));
        return nextFields;
      });
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const nextErrors = { ...prev };
        delete nextErrors[key];
        return nextErrors;
      });
      return next;
    });
  }

  async function handleSave() {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!hasChanges) return;
    await onSave(buildDiff(initialState, form, changedFields));
  }

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div>
          <h3 className={styles.title}>Edit vehicle</h3>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <Pencil size={16} color="var(--text-muted, #8A9B85)" />
      </header>

      <div className={styles.body}>
        <section className={styles.section}>
          <p className={styles.sectionLabel}>Vehicle details</p>

          <div className={styles.grid3}>
            <FormField label="Make" required error={errors.make}>
              <input className={`${styles.input} ${errors.make ? styles.inputError : ""}`} value={form.make} disabled={isSaving} onChange={(e) => updateField("make", e.target.value)} />
            </FormField>
            <FormField label="Model" required error={errors.model}>
              <input className={`${styles.input} ${errors.model ? styles.inputError : ""}`} value={form.model} disabled={isSaving} onChange={(e) => updateField("model", e.target.value)} />
            </FormField>
            <FormField label="Year" required error={errors.year}>
              <input className={`${styles.input} ${errors.year ? styles.inputError : ""}`} type="number" min={2000} max={2030} value={form.year} disabled={isSaving} onChange={(e) => updateField("year", Number.parseInt(e.target.value || "0", 10))} />
            </FormField>
          </div>

          <div className={styles.grid2}>
            <FormField label="Color" error={errors.color}>
              <input className={`${styles.input} ${errors.color ? styles.inputError : ""}`} value={form.color} placeholder="e.g. White" disabled={isSaving} onChange={(e) => updateField("color", e.target.value)} />
            </FormField>
            <FormField label="Plate number" required error={errors.plate_number}>
              <input className={`${styles.input} ${styles.inputMono} ${errors.plate_number ? styles.inputError : ""}`} value={form.plate_number} disabled={isSaving} onChange={(e) => updateField("plate_number", e.target.value)} />
            </FormField>
          </div>

          <div className={styles.grid2}>
            <FormField label="Seats" required hint="Passenger seats, excluding driver" error={errors.seat_capacity}>
              <input className={`${styles.input} ${errors.seat_capacity ? styles.inputError : ""}`} type="number" min={1} max={12} value={form.seat_capacity} disabled={isSaving} onChange={(e) => updateField("seat_capacity", Number.parseInt(e.target.value || "0", 10))} />
            </FormField>
            <FormField label="Fuel type" error={errors.fuel_type}>
              <select className={`${styles.input} ${styles.select} ${errors.fuel_type ? styles.inputError : ""}`} value={form.fuel_type} disabled={isSaving} onChange={(e) => updateField("fuel_type", e.target.value)}>
                <option value="">Select fuel type</option>
                {FUEL_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="MPG (city / highway)" hint="Optional — leave blank if unknown" error={errors.mileage_city || errors.mileage_highway}>
            <div className={styles.mpgGrid}>
              <input className={`${styles.input} ${(errors.mileage_city || errors.mileage_highway) ? styles.inputError : ""}`} type="number" value={form.mileage_city} placeholder="City" disabled={isSaving} onChange={(e) => updateField("mileage_city", e.target.value)} />
              <div className={styles.mpgSlash}>/</div>
              <input className={`${styles.input} ${(errors.mileage_city || errors.mileage_highway) ? styles.inputError : ""}`} type="number" value={form.mileage_highway} placeholder="Hwy" disabled={isSaving} onChange={(e) => updateField("mileage_highway", e.target.value)} />
            </div>
          </FormField>
        </section>

        <div className={styles.divider} />

        <section className={styles.section}>
          <p className={styles.sectionLabel}>
            Vehicle type <span className={styles.required}>*</span>
          </p>
          <div className={styles.typeGrid}>
            {(Object.keys(VEHICLE_TYPE_CONFIG) as VehicleType[]).map((type) => {
              const config = VEHICLE_TYPE_CONFIG[type];
              const selected = form.vehicle_type === type;
              return (
                <button
                  key={type}
                  type="button"
                  disabled={isSaving}
                  className={`${styles.typeButton} ${selected ? styles.typeButtonSelected : ""}`}
                  style={selected ? { background: config.bgColor, borderColor: config.borderColor } : undefined}
                  onClick={() => updateField("vehicle_type", type)}
                >
                  <VehicleTypeIcon type={type} size={40} />
                  <span className={styles.typeLabel} style={{ color: config.color }}>{config.label}</span>
                  <span className={styles.typeCapacity}>{config.capacity.replace(" riders", "").replace(" rider", "")}</span>
                </button>
              );
            })}
          </div>
          {errors.vehicle_type ? <span className={styles.error}>{errors.vehicle_type}</span> : null}
        </section>

        <div className={styles.divider} />

        <section className={styles.section}>
          <p className={styles.sectionLabel}>Status</p>
          <div className={styles.toggleRow}>
            <div>
              <p className={styles.toggleTitle}>Vehicle active</p>
              <p className={styles.toggleSub}>Driver can receive ride requests with this vehicle</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.is_active}
              disabled={isSaving}
              className={`${styles.switch} ${form.is_active ? styles.switchOn : styles.switchOff}`}
              onClick={() => updateField("is_active", !form.is_active)}
            >
              <span className={`${styles.knob} ${form.is_active ? styles.knobOn : styles.knobOff}`} />
            </button>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <span className={styles.footerMeta}>{hasChanges ? pluralize(changedFields.size, "field") : "No changes"}</span>
        <div className={styles.footerActions}>
          <button type="button" className={styles.cancelButton} disabled={isSaving} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={styles.saveButton} disabled={!hasChanges || isSaving} onClick={handleSave}>
            {isSaving ? (
              <>
                <span className={styles.spinner} />
                <span>Saving...</span>
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </footer>
    </article>
  );
}
