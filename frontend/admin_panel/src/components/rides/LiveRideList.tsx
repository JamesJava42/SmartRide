import type { RideRecord } from "../../api/rides";
import { LiveRideRow } from "./LiveRideRow";

type LiveRideListProps = {
  rides: RideRecord[];
};

export function LiveRideList({ rides }: LiveRideListProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#f7f7f5] text-muted">
          <tr>
            <th className="px-5 py-4 font-medium">Rider</th>
            <th className="px-5 py-4 font-medium">Driver</th>
            <th className="px-5 py-4 font-medium">Region</th>
            <th className="px-5 py-4 font-medium">Status</th>
            <th className="px-5 py-4 font-medium">Recent Activity</th>
          </tr>
        </thead>
        <tbody>
          {rides.map((ride) => (
            <LiveRideRow key={ride.ride_id} ride={ride} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
