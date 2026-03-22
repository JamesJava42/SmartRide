import type { RideHistoryItem } from "../../types/ride";
import { formatCurrency, formatDateTime, formatDistance, formatDuration, titleizeStatus } from "../../utils/formatters";
import { StatusBadge } from "../common/StatusBadge";

function statusTone(status: string) {
  if (status === "RIDE_COMPLETED") return "green";
  if (status === "CANCELLED") return "red";
  if (status === "RIDE_STARTED") return "blue";
  return "amber";
}

export function RideHistoryCard({ ride }: { ride: RideHistoryItem }) {
  return (
    <div className="rounded-3xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink">{ride.rideId.slice(0, 8)}</p>
          <p className="mt-1 text-xs text-muted">{formatDateTime(ride.completedAt)}</p>
        </div>
        <StatusBadge label={titleizeStatus(ride.status)} tone={statusTone(ride.status)} />
      </div>
      <div className="mt-4 space-y-2 text-sm text-muted">
        <p><span className="font-medium text-ink">Pickup:</span> {ride.pickupAddress}</p>
        <p><span className="font-medium text-ink">Drop-off:</span> {ride.dropoffAddress}</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-muted">Distance</p>
          <p className="mt-1 font-semibold text-ink">{formatDistance(ride.distanceMiles)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-muted">Duration</p>
          <p className="mt-1 font-semibold text-ink">{formatDuration(ride.durationMinutes)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-muted">Fare</p>
          <p className="mt-1 font-semibold text-ink">{formatCurrency(ride.fareEarned)}</p>
        </div>
      </div>
    </div>
  );
}
