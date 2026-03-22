import type { RiderRideHistory } from "../../types/activity";
import { formatCurrency, formatDateShort } from "../../utils/formatters";
import { StatusBadge } from "../common/StatusBadge";

export function RideHistoryMobileCard({
  ride,
  selected,
  onSelect,
}: {
  ride: RiderRideHistory;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <article className={`rounded-[22px] border bg-white p-4 shadow-[0_12px_30px_rgba(23,33,27,0.04)] ${selected ? "border-[#1A6B45]" : "border-line"}`}>
      <button type="button" className="w-full text-left" onClick={onSelect}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#9CA3AF]">{formatDateShort(ride.created_at)}</span>
          <span className={`text-[15px] font-bold ${ride.status === "CANCELLED" ? "text-[#9CA3AF]" : "text-[#111111]"}`}>{formatCurrency(ride.fare_amount ?? 0)}</span>
        </div>
        <div className="mt-3 space-y-1.5 text-[12px] text-[#374151]">
          <div className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[#1A6B45]" /><span>{ride.pickup_address}</span></div>
          <div className="ml-1 h-2 w-px bg-[#D1D5DB]" />
          <div className="flex items-start gap-2"><span className="mt-1 h-2 w-2 bg-[#111111]" /><span>{ride.dropoff_address}</span></div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#6B7280]">{ride.vehicle_type} · {ride.duration_minutes ?? "—"} min · {ride.driver_name}</span>
          <StatusBadge status={ride.status} />
        </div>
      </button>
    </article>
  );
}
