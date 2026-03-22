import type { RideHistoryItem } from "../../types/ride";
import { formatCurrency, formatDateTime, formatDistance, formatDuration, titleizeStatus } from "../../utils/formatters";
import { StatusBadge } from "../common/StatusBadge";

function statusTone(status: string) {
  if (status === "RIDE_COMPLETED") return "green";
  if (status === "CANCELLED") return "red";
  if (status === "RIDE_STARTED") return "blue";
  return "amber";
}

export function RideHistoryTable({ rides }: { rides: RideHistoryItem[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-[#fbfaf7] text-left text-xs uppercase tracking-[0.15em] text-muted">
            <tr>
              <th className="px-4 py-3">Ride</th>
              <th className="px-4 py-3">Completed</th>
              <th className="px-4 py-3">Pickup</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Distance</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Fare</th>
              <th className="px-4 py-3">Payout</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-white">
            {rides.map((ride) => (
              <tr key={ride.rideId}>
                <td className="px-4 py-4 font-semibold text-ink">{ride.rideId.slice(0, 8)}</td>
                <td className="px-4 py-4 text-muted">{formatDateTime(ride.completedAt)}</td>
                <td className="px-4 py-4 text-muted">{ride.pickupAddress}</td>
                <td className="px-4 py-4 text-muted">{ride.dropoffAddress}</td>
                <td className="px-4 py-4 text-muted">{formatDistance(ride.distanceMiles)}</td>
                <td className="px-4 py-4 text-muted">{formatDuration(ride.durationMinutes)}</td>
                <td className="px-4 py-4 font-medium text-ink">{formatCurrency(ride.fareEarned)}</td>
                <td className="px-4 py-4 text-muted">{ride.payoutStatus ?? "—"}</td>
                <td className="px-4 py-4">
                  <StatusBadge label={titleizeStatus(ride.status)} tone={statusTone(ride.status)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
