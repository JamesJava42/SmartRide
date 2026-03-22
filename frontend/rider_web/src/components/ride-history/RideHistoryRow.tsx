import { StatusBadge } from "../common/StatusBadge";
import type { RiderRideHistory } from "../../types/activity";
import { formatCurrency, formatDate, formatMiles, shortAddress } from "../../utils/formatters";

export function RideHistoryRow({
  ride,
  selected,
  onSelect,
}: {
  ride: RiderRideHistory;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-4 border-b border-[#F3F4F6] px-6 py-4 text-left transition ${selected ? "border-l-[3px] border-l-[#1A6B45] bg-[#EDF9F2] pl-[21px]" : "bg-white hover:bg-[#FAFAF9]"}`}
    >
      <div className={`grid h-[38px] w-[38px] place-items-center rounded-full text-sm font-bold ${ride.status === "CANCELLED" ? "bg-[#FEE2E2] text-[#991B1B]" : "bg-[#EDF9F2] text-[#1A6B45]"}`}>
        {ride.status === "CANCELLED" ? "✕" : "✓"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-[#9CA3AF]">{formatDate(ride.created_at)}</div>
        <div className="mt-1 truncate text-[13px] font-bold text-[#111111]">
          {shortAddress(ride.pickup_address)} → {shortAddress(ride.dropoff_address)}
        </div>
        <div className="mt-1 text-[11px] text-[#6B7280]">
          {ride.vehicle_type} · {ride.duration_minutes ?? "—"} min · {ride.distance_km != null ? formatMiles(ride.distance_km) : "—"} · {ride.driver_name}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className={`text-[14px] font-bold ${ride.status === "CANCELLED" ? "text-[#9CA3AF]" : "text-[#111111]"}`}>{formatCurrency(ride.fare_amount ?? 0)}</div>
        <div className="mt-2">
          <StatusBadge status={ride.status} />
        </div>
      </div>
    </button>
  );
}
