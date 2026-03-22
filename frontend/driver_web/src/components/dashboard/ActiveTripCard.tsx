import type { ActiveTrip } from "../../types/ride";
import { formatDistance, formatDuration, titleizeStatus } from "../../utils/formatters";
import { StatusBadge } from "../common/StatusBadge";

function toneForStatus(status: string) {
  if (status === "RIDE_COMPLETED") return "green";
  if (status === "CANCELLED") return "red";
  if (status === "RIDE_STARTED" || status === "DRIVER_EN_ROUTE" || status === "DRIVER_ARRIVED") return "blue";
  return "amber";
}

export function ActiveTripCard({
  trip,
  actionLabel,
  actionLoading,
  onAction,
}: {
  trip: ActiveTrip | null;
  actionLabel?: string | null;
  actionLoading?: boolean;
  onAction?: () => void;
}) {
  if (!trip) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-white/80 p-6 text-sm text-muted">
        No active ride. Go online to start receiving requests.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">Active trip</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">{trip.riderName ?? "Assigned rider"}</h3>
          <p className="mt-1 text-sm text-muted">{trip.pickupAddress}</p>
          <p className="mt-1 text-sm text-muted">to {trip.destinationAddress}</p>
        </div>
        <StatusBadge label={titleizeStatus(trip.status)} tone={toneForStatus(trip.status)} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">ETA</p>
          <p className="mt-2 text-lg font-semibold text-ink">{formatDuration(trip.etaMinutes)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Distance</p>
          <p className="mt-2 text-lg font-semibold text-ink">{formatDistance(trip.estimatedDistanceMiles)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Payout</p>
          <p className="mt-2 text-lg font-semibold text-ink">{trip.payoutEstimate != null ? `$${trip.payoutEstimate.toFixed(2)}` : "—"}</p>
        </div>
      </div>

      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          disabled={actionLoading}
          className="mt-5 w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accentDark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {actionLoading ? "Updating..." : actionLabel}
        </button>
      ) : null}
    </div>
  );
}
