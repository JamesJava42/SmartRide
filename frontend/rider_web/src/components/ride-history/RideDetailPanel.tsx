import { FileText } from "lucide-react";
import type { RiderRideHistory } from "../../types/activity";
import { formatCurrency, formatDate, formatMiles } from "../../utils/formatters";
import { StatusBadge } from "../common/StatusBadge";

function StaticMap() {
  return (
    <svg viewBox="0 0 320 140" width="100%" height="100%" preserveAspectRatio="none">
      <rect width="320" height="140" fill="#E8F0E4" />
      <path d="M54 38 C110 18, 150 86, 260 102" stroke="#1F2937" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="52" cy="36" r="8" fill="#1A6B45" />
      <rect x="254" y="96" width="12" height="12" rx="2" fill="#111111" />
    </svg>
  );
}

export function RideDetailPanel({
  ride,
  onDownload,
}: {
  ride: RiderRideHistory;
  onDownload: () => void;
}) {
  return (
    <div className="sticky top-24 flex flex-col gap-4 rounded-[24px] border border-line bg-white p-4 shadow-[0_16px_40px_rgba(23,33,27,0.04)]">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-[#111111]">Trip details</div>
        <StatusBadge status={ride.status} />
      </div>

      <div className="h-[150px] overflow-hidden rounded-[12px] border border-line bg-[#E8F0E4]">
        <StaticMap />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-[#6B7280]">Trip total</div>
        <div className={`text-[22px] font-bold ${ride.status === "CANCELLED" ? "text-[#9CA3AF]" : "text-[#111111]"}`}>{formatCurrency(ride.fare_amount ?? 0)}</div>
      </div>

      <div className="rounded-[10px] bg-[#F9FAF8] p-3">
        <div className="flex items-start gap-2 text-xs text-[#374151]"><span className="mt-1 h-2 w-2 rounded-full bg-[#1A6B45]" /><span>{ride.pickup_address}</span></div>
        <div className="my-1 ml-1 h-3 w-px bg-[#D1D5DB]" />
        <div className="flex items-start gap-2 text-xs text-[#374151]"><span className="mt-1 h-2 w-2 bg-[#111111]" /><span>{ride.dropoff_address}</span></div>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-line bg-white">
        {[
          ["Date", formatDate(ride.created_at)],
          ["Driver", ride.driver_name],
          ["Vehicle", [ride.vehicle_type, `${ride.vehicle_make} ${ride.vehicle_model}`.trim(), ride.plate_number].filter(Boolean).join(" · ")],
          ["Duration", `${ride.duration_minutes ?? "—"} min`],
          ["Distance", ride.distance_km != null ? formatMiles(ride.distance_km) : "—"],
          ["Payment", ride.payment_method],
          ["Ride type", ride.vehicle_type],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3 last:border-b-0">
            <span className="text-xs text-[#6B7280]">{label}</span>
            <span className="text-right text-xs font-bold text-[#111111]">{value}</span>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[10px] border border-line bg-white">
        {[
          ["Base fare", formatCurrency(ride.fare_breakdown?.base_fare ?? ride.fare_amount ?? 0)],
          ["Distance & time", formatCurrency(ride.fare_breakdown?.distance_time_fare ?? 0)],
          ["Fees", formatCurrency(ride.fare_breakdown?.fees ?? 0)],
          ["Taxes", formatCurrency(ride.fare_breakdown?.taxes ?? 0)],
          ["Tip", formatCurrency(ride.fare_breakdown?.tip ?? 0)],
          ["Total charged", formatCurrency(ride.fare_breakdown?.total ?? ride.fare_amount ?? 0)],
        ].map(([label, value], index, rows) => (
          <div key={label} className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3 last:border-b-0">
            <span className="text-xs text-[#6B7280]">{label}</span>
            <span className={`text-xs font-bold ${index === rows.length - 1 ? "text-[#1A6B45]" : "text-[#111111]"}`}>{value}</span>
          </div>
        ))}
      </div>

      {ride.rider_rating ? (
        <div className="rounded-[10px] border border-line bg-white p-4">
          <div className="text-[11px] text-[#9CA3AF]">Your rating</div>
          <div className="mt-2 text-sm text-[#F59E0B]">{"★★★★★".slice(0, Math.round(ride.rider_rating)) + "☆☆☆☆☆".slice(0, 5 - Math.round(ride.rider_rating))}</div>
          <div className="mt-2 text-[11px] italic text-[#6B7280]">{ride.rider_comment || "No comment"}</div>
        </div>
      ) : null}

      <div className="grid gap-2">
        <button type="button" className="flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#F3F4F6] px-4 py-3 text-[13px] font-medium text-[#374151]" onClick={onDownload}>
          <FileText size={14} />
          Download receipt
        </button>
        <button type="button" className="rounded-[9px] border border-line px-4 py-3 text-[13px] font-medium text-[#111111] transition hover:bg-[#F8F8F6]">
          Get help
        </button>
      </div>
    </div>
  );
}
