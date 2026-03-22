import { useEffect, useRef, useState } from "react";
import { VehicleCard, VehicleTypeSelector } from "@shared/components/vehicle";
import type { Vehicle, VehicleType } from "@shared/types/vehicle";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

type PersonalForm = { first_name: string; last_name: string; phone_number: string };
type RegionForm = { region_id: string };
type VehicleForm = { make: string; model: string; year: string; color: string; plate_number: string; vehicle_type: VehicleType | ""; seat_capacity: string };
type DocumentFiles = Record<string, File | null>;

type Region = { id: string; name: string; cityState: string };

const STEPS = ["Personal", "Region", "Vehicle", "Documents", "Review", "Submitted"];

const DOC_LABELS: Record<string, string> = {
  GOVT_ID_FRONT: "Government ID — Front",
  GOVT_ID_BACK: "Government ID — Back",
  DRIVER_LICENSE: "Driver's License",
  VEHICLE_REGISTRATION: "Vehicle Registration",
  INSURANCE: "Insurance Certificate",
  PROFILE_PHOTO: "Profile Photo",
};
const DOC_TYPES = Object.keys(DOC_LABELS);

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const token = () => localStorage.getItem("access_token");
const authHeader = () => (token() ? { Authorization: `Bearer ${token()}` } : {});

async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${BASE}/api/v1${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...authHeader(), ...(opts.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message ?? body.detail ?? "Request failed");
  return body.data ?? body;
}

const inputCls = "w-full rounded-2xl border border-[#dfddd6] bg-white px-4 py-3 text-sm text-[#17211b] placeholder:text-[#67746c] focus:border-[#3a8f5b] focus:outline-none focus:ring-2 focus:ring-[#3a8f5b]/15";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[#17211b]">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

export function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [personal, setPersonal] = useState<PersonalForm>({ first_name: "", last_name: "", phone_number: "" });
  const [region, setRegion] = useState<RegionForm>({ region_id: "" });
  const [regions, setRegions] = useState<Region[]>([]);
  const [vehicle, setVehicle] = useState<VehicleForm>({ make: "", model: "", year: "", color: "", plate_number: "", vehicle_type: "", seat_capacity: "" });
  const [docs, setDocs] = useState<DocumentFiles>(Object.fromEntries(DOC_TYPES.map((t) => [t, null])));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<string>("SUBMITTED");
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    fetch(`${BASE}/api/v1/admin/regions`, { headers: authHeader() })
      .then((r) => r.json())
      .then((b) => setRegions(b.data ?? b))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (step !== 6) return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await apiFetch("/drivers/me/onboarding");
        setOnboardingStatus(data.status ?? "SUBMITTED");
        if (data.status === "APPROVED" || data.status === "REJECTED") {
          clearInterval(pollRef.current!);
        }
      } catch {}
    }, 10000);
    return () => clearInterval(pollRef.current!);
  }, [step]);

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!personal.first_name.trim()) return "First name is required";
      if (!personal.phone_number.trim()) return "Phone number is required";
    }
    if (step === 2 && !region.region_id) return "Please select a region";
    if (step === 3) {
      if (!vehicle.make || !vehicle.model || !vehicle.year || !vehicle.plate_number || !vehicle.vehicle_type || !vehicle.seat_capacity) return "All required vehicle fields must be filled";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => (s + 1) as Step);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/drivers/me/onboarding", {
        method: "POST",
        body: JSON.stringify({
          ...personal,
          region_id: region.region_id,
          vehicle: { ...vehicle, year: parseInt(vehicle.year), seat_capacity: parseInt(vehicle.seat_capacity) },
        }),
      });
      // Upload documents
      for (const [type, file] of Object.entries(docs)) {
        if (!file) continue;
        const form = new FormData();
        form.append("file", file);
        form.append("document_type", type);
        await fetch(`${BASE}/api/v1/drivers/me/documents`, { method: "POST", headers: authHeader(), body: form });
      }
      setStep(6);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100;
  const vehiclePreview: Vehicle | null =
    vehicle.make && vehicle.model && vehicle.year && vehicle.plate_number && vehicle.vehicle_type
      ? {
          id: "preview-vehicle",
          driver_id: "preview-driver",
          make: vehicle.make,
          model: vehicle.model,
          year: Number.parseInt(vehicle.year, 10),
          color: vehicle.color || null,
          plate_number: vehicle.plate_number,
          vehicle_type: vehicle.vehicle_type,
          seat_capacity: Number.parseInt(vehicle.seat_capacity || "4", 10),
          fuel_type: null,
          mileage_city: null,
          mileage_highway: null,
          is_active: true,
        }
      : null;

  return (
    <div className="min-h-screen bg-[#f6f4ee] flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#17211b]">Driver Onboarding</h1>
          <p className="mt-1 text-sm text-[#67746c]">Step {step} of {STEPS.length}: {STEPS[step - 1]}</p>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-[#dfddd6] overflow-hidden">
          <div className="h-full rounded-full bg-[#3a8f5b] transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="rounded-3xl border border-[#dfddd6] bg-white p-6 space-y-5">
          {/* Step 1 */}
          {step === 1 && (
            <>
              <Field label="First Name" required>
                <input className={inputCls} value={personal.first_name} onChange={(e) => setPersonal({ ...personal, first_name: e.target.value })} placeholder="John" />
              </Field>
              <Field label="Last Name">
                <input className={inputCls} value={personal.last_name} onChange={(e) => setPersonal({ ...personal, last_name: e.target.value })} placeholder="Smith" />
              </Field>
              <Field label="Phone Number" required>
                <input className={inputCls} value={personal.phone_number} onChange={(e) => setPersonal({ ...personal, phone_number: e.target.value })} placeholder="+1 555 000 0000" />
              </Field>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <Field label="Operating Region" required>
              <select className={inputCls} value={region.region_id} onChange={(e) => setRegion({ region_id: e.target.value })}>
                <option value="">Select region…</option>
                {regions.map((r) => <option key={r.id} value={r.id}>{r.name} — {r.cityState}</option>)}
              </select>
            </Field>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Make" required><input className={inputCls} value={vehicle.make} onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })} placeholder="Toyota" /></Field>
                <Field label="Model" required><input className={inputCls} value={vehicle.model} onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })} placeholder="Camry" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Year" required><input type="number" className={inputCls} value={vehicle.year} onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })} placeholder="2022" min="1990" /></Field>
                <Field label="Color"><input className={inputCls} value={vehicle.color} onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })} placeholder="Silver" /></Field>
              </div>
              <Field label="License Plate" required><input className={inputCls} value={vehicle.plate_number} onChange={(e) => setVehicle({ ...vehicle, plate_number: e.target.value })} placeholder="8ABC123" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Vehicle Type" required>
                  <VehicleTypeSelector
                    value={vehicle.vehicle_type || null}
                    onChange={(type) => setVehicle({ ...vehicle, vehicle_type: type })}
                    size="sm"
                  />
                </Field>
                <Field label="Seats" required><input type="number" className={inputCls} value={vehicle.seat_capacity} onChange={(e) => setVehicle({ ...vehicle, seat_capacity: e.target.value })} placeholder="4" min="2" max="9" /></Field>
              </div>
              {vehiclePreview ? <VehicleCard vehicle={vehiclePreview} /> : null}
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-3">
              {DOC_TYPES.map((type) => (
                <div key={type} className="flex items-center justify-between rounded-2xl border border-[#dfddd6] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#17211b]">{DOC_LABELS[type]}</p>
                    {docs[type] ? (
                      <p className="text-xs text-[#3a8f5b]">{docs[type]!.name}</p>
                    ) : (
                      <p className="text-xs text-[#67746c]">Not uploaded</p>
                    )}
                  </div>
                  <label className="cursor-pointer rounded-xl border border-[#dfddd6] px-3 py-1.5 text-xs font-medium text-[#17211b] hover:bg-[#f7f7f5] transition">
                    {docs[type] ? "Change" : "Upload"}
                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setDocs((prev) => ({ ...prev, [type]: file }));
                    }} />
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* Step 5 - Review */}
          {step === 5 && (
            <div className="space-y-4 text-sm">
              <div className="rounded-2xl bg-[#f6f4ee] p-4 space-y-2">
                <p className="text-xs font-semibold text-[#67746c] uppercase tracking-wide">Personal</p>
                <p className="text-[#17211b]">{personal.first_name} {personal.last_name}</p>
                <p className="text-[#67746c]">{personal.phone_number}</p>
              </div>
              <div className="rounded-2xl bg-[#f6f4ee] p-4 space-y-2">
                <p className="text-xs font-semibold text-[#67746c] uppercase tracking-wide">Region</p>
                <p className="text-[#17211b]">{regions.find((r) => r.id === region.region_id)?.name ?? region.region_id}</p>
              </div>
              <div className="rounded-2xl bg-[#f6f4ee] p-4 space-y-2">
                <p className="text-xs font-semibold text-[#67746c] uppercase tracking-wide">Vehicle</p>
                <p className="text-[#17211b]">{vehicle.year} {vehicle.make} {vehicle.model} · {vehicle.color}</p>
                <p className="text-[#67746c]">{vehicle.plate_number} · {vehicle.vehicle_type} · {vehicle.seat_capacity} seats</p>
              </div>
              <div className="rounded-2xl bg-[#f6f4ee] p-4 space-y-2">
                <p className="text-xs font-semibold text-[#67746c] uppercase tracking-wide">Documents</p>
                {DOC_TYPES.map((t) => (
                  <div key={t} className="flex justify-between">
                    <span className="text-[#67746c]">{DOC_LABELS[t]}</span>
                    <span className={docs[t] ? "text-emerald-600 font-medium" : "text-[#67746c]"}>{docs[t] ? "✓ Ready" : "Not uploaded"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 6 - Submitted */}
          {step === 6 && (
            <div className="py-4 text-center space-y-4">
              {onboardingStatus === "APPROVED" ? (
                <>
                  <div className="text-4xl">🎉</div>
                  <p className="text-lg font-semibold text-[#17211b]">Application Approved!</p>
                  <p className="text-sm text-[#67746c]">Welcome to RideConnect. You can now view your profile.</p>
                  <a href="/profile" className="inline-block rounded-2xl bg-[#3a8f5b] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2f7449] transition">Go to Profile</a>
                </>
              ) : onboardingStatus === "REJECTED" ? (
                <>
                  <div className="text-4xl">❌</div>
                  <p className="text-lg font-semibold text-[#17211b]">Application Rejected</p>
                  <p className="text-sm text-[#67746c]">Please review the feedback and resubmit your application.</p>
                  <button onClick={() => setStep(1)} className="rounded-2xl border border-[#dfddd6] px-6 py-3 text-sm font-semibold text-[#17211b] hover:bg-[#f7f7f5] transition">Resubmit</button>
                </>
              ) : (
                <>
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#3a8f5b] border-t-transparent" />
                  <p className="text-lg font-semibold text-[#17211b]">Application Submitted</p>
                  <p className="text-sm text-[#67746c]">Your application is under review. This page will update automatically.</p>
                  <span className="inline-block rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700">{onboardingStatus.replace(/_/g, " ")}</span>
                </>
              )}
            </div>
          )}

          {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        </div>

        {step < 6 && (
          <div className="flex gap-3">
            {step > 1 && (
              <button onClick={() => { setStep((s) => (s - 1) as Step); setError(null); }} className="rounded-2xl border border-[#dfddd6] px-6 py-3 text-sm font-semibold text-[#17211b] hover:bg-[#f7f7f5] transition">
                Back
              </button>
            )}
            {step < 5 ? (
              <button onClick={handleNext} className="flex-1 rounded-2xl bg-[#3a8f5b] py-3 text-sm font-semibold text-white hover:bg-[#2f7449] transition">
                Next
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 rounded-2xl bg-[#3a8f5b] py-3 text-sm font-semibold text-white hover:bg-[#2f7449] disabled:opacity-60 transition">
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
