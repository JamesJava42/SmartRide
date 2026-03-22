import type { RideRecord } from "../../api/rides";
import { StatusBadge } from "../common/StatusBadge";

type LiveRideRowProps = {
  ride: RideRecord;
};

export function LiveRideRow({ ride }: LiveRideRowProps) {
  return (
    <tr className="border-t border-line">
      <td className="px-5 py-4">{ride.rider_name}</td>
      <td className="px-5 py-4">{ride.driver_name ?? "Unassigned"}</td>
      <td className="px-5 py-4">{ride.region_name}</td>
      <td className="px-5 py-4">
        <StatusBadge status={ride.status} />
      </td>
      <td className="px-5 py-4 text-muted">{ride.recent_activity}</td>
    </tr>
  );
}
