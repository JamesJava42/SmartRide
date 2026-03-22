import type { DriverProfile, Vehicle } from "../types/api";

export function AssignedDriverCard({
  name,
  driver,
  vehicle,
  compact = false,
}: {
  name: string;
  driver: DriverProfile;
  vehicle: Vehicle;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-[24px] border border-line bg-surface p-5 shadow-soft ${compact ? "" : ""}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Assigned driver</p>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-ink">{name}</h3>
          <p className="text-sm text-muted">
            {vehicle.make} {vehicle.model} • {vehicle.color}
          </p>
        </div>
        <div className="rounded-2xl bg-canvas px-4 py-3 text-right">
          <p className="text-[11px] text-muted">Rating</p>
          <p className="text-base font-bold text-ink">{driver.rating_avg}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-canvas px-4 py-3">
        <span className="text-sm text-muted">Plate</span>
        <span className="text-sm font-semibold text-ink">{vehicle.plate_number}</span>
      </div>
    </div>
  );
}
