import type { RideRecord } from "../../api/rides";
import { StatusBadge } from "../common/StatusBadge";

type RecentActiveRidesTableProps = {
  rides: RideRecord[];
};

export function RecentActiveRidesTable({ rides }: RecentActiveRidesTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#f7f7f5] text-muted">
          <tr>
            <th className="px-5 py-4 font-medium">Ride ID</th>
            <th className="px-5 py-4 font-medium">Rider</th>
            <th className="px-5 py-4 font-medium">Driver</th>
            <th className="px-5 py-4 font-medium">Region</th>
            <th className="px-5 py-4 font-medium">Pickup &amp; Drop-off</th>
            <th className="px-5 py-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rides.map((ride) => (
            <tr key={ride.ride_id} className="border-t border-line">
              <td className="px-5 py-4 font-medium text-ink">{ride.ride_id}</td>
              <td className="px-5 py-4">{ride.rider_name}</td>
              <td className="px-5 py-4">{ride.driver_name ?? "Unassigned"}</td>
              <td className="px-5 py-4">{ride.region_name}</td>
              <td className="px-5 py-4 text-muted">{ride.pickup_address} → {ride.dropoff_address}</td>
              <td className="px-5 py-4">
                <StatusBadge status={ride.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
