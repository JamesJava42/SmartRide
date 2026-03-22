import type { DriverAvailabilityState } from "../../types/driver";
import { DriverStatusBadge } from "./DriverStatusBadge";

export function StatusToggleCard({
  status,
  statusLabel,
  isToggling,
  onToggle,
}: {
  status: DriverAvailabilityState;
  statusLabel: string;
  isToggling: boolean;
  onToggle: () => void;
}) {
  const isOffline = status === "OFFLINE";

  return (
    <div className="rounded-3xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">Availability</p>
          <div className="mt-2">
            <DriverStatusBadge status={status} />
          </div>
          <p className="mt-3 text-sm text-muted">Backend status: {statusLabel}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={isToggling}
          className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${
            isOffline ? "bg-accent hover:bg-accentDark" : "bg-slate-700 hover:bg-slate-800"
          } disabled:cursor-not-allowed disabled:opacity-70`}
        >
          {isToggling ? "Updating..." : isOffline ? "Go Online" : "Go Offline"}
        </button>
      </div>
    </div>
  );
}
