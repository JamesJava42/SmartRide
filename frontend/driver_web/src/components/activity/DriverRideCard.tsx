import type { DriverRideHistory } from "../../types/driverActivity";
import { formatCurrency, formatDate, formatDateShort, formatMiles, shortAddress } from "../../utils/formatters";

function renderStars(rating: number | null) {
  if (!rating) return null;
  const filled = Math.round(rating);
  return "★★★★★".slice(0, filled) + "☆☆☆☆☆".slice(0, 5 - filled);
}

export function DriverRideCard({
  ride,
  selected,
  onSelect,
  mobile = false,
}: {
  ride: DriverRideHistory;
  selected?: boolean;
  onSelect: () => void;
  mobile?: boolean;
}) {
  const badgeClass = ride.status === "CANCELLED" ? "bg-[#FEE2E2] text-[#991B1B]" : "bg-[#EDF9F2] text-[#1A6B45]";
  const payoutClass = ride.status === "CANCELLED" ? "text-[#9CA3AF]" : "text-[#1A6B45]";

  if (mobile) {
    return (
      <article className="border-b border-[#F3F4F6] bg-white px-4 py-3" onClick={onSelect}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#9CA3AF]">{formatDateShort(ride.created_at)}</span>
          <span className={`text-[15px] font-bold ${payoutClass}`}>{formatCurrency(ride.payout_amount ?? 0)}</span>
        </div>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-start gap-2 text-[12px] text-[#374151]"><span className="mt-1 h-2 w-2 rounded-full bg-[#1A6B45]" /><span>{ride.pickup_address}</span></div>
          <div className="ml-1 h-2 w-px bg-[#D1D5DB]" />
          <div className="flex items-start gap-2 text-[12px] text-[#374151]"><span className="mt-1 h-2 w-2 bg-[#111111]" /><span>{ride.dropoff_address}</span></div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#6B7280]">{ride.vehicle_type} · {ride.duration_minutes ?? "—"} min · {ride.rider_name}</span>
          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${badgeClass}`}>{ride.status === "CANCELLED" ? "Cancelled" : ride.status === "RIDE_STARTED" ? "In progress" : "Completed"}</span>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`flex cursor-pointer items-center gap-4 border-b border-[#F3F4F6] px-6 py-4 ${selected ? "border-l-[3px] border-l-[#1A6B45] bg-[#EDF9F2] pl-[21px]" : "bg-white hover:bg-[#FAFAF9]"}`}
      onClick={onSelect}
    >
      <div className={`flex h-[38px] w-[38px] items-center justify-center rounded-full text-sm font-bold ${ride.status === "CANCELLED" ? "bg-[#FEE2E2] text-[#991B1B]" : "bg-[#EDF9F2] text-[#1A6B45]"}`}>
        {ride.status === "CANCELLED" ? "✕" : "✓"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-[#9CA3AF]">{formatDate(ride.created_at)}</div>
        <div className="mt-1 truncate text-[13px] font-bold text-[#111111]">
          {shortAddress(ride.pickup_address)} → {shortAddress(ride.dropoff_address)}
        </div>
        <div className="mt-1 text-[11px] text-[#6B7280]">
          {ride.vehicle_type} · {ride.duration_minutes ?? "—"} min · {formatMiles(ride.distance_km)} · {ride.rider_name}
        </div>
      </div>
      <div className="text-right">
        <div className={`text-[14px] font-bold ${payoutClass}`}>{formatCurrency(ride.payout_amount ?? 0)}</div>
        <div className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${badgeClass}`}>
          {ride.status === "CANCELLED" ? "Cancelled" : ride.status === "RIDE_STARTED" ? "In progress" : "Completed"}
        </div>
        {ride.rider_rating ? <div className="mt-1 text-[11px] text-[#F59E0B]">{renderStars(ride.rider_rating)}</div> : null}
      </div>
    </article>
  );
}
