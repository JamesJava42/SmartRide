import { FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { downloadDriverReceipt, getDriverRideDetail } from "../../api/driverActivity";
import { formatCurrency, formatDate, formatMiles } from "../../utils/formatters";

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

function stars(rating: number) {
  const filled = Math.round(rating);
  return "★★★★★".slice(0, filled) + "☆☆☆☆☆".slice(0, 5 - filled);
}

export function DriverRideDetailPanel({
  rideId,
  onClose,
}: {
  rideId: string;
  onClose?: () => void;
}) {
  const detailQuery = useQuery({
    queryKey: ["driver-ride-detail", rideId],
    queryFn: () => getDriverRideDetail(rideId),
  });

  async function handleDownload() {
    const blob = await downloadDriverReceipt(rideId);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `driver-receipt-${rideId}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (detailQuery.isLoading) {
    return <div className="grid min-h-[280px] place-items-center p-6 text-sm text-[#6B7280]">Loading ride details...</div>;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return <div className="grid min-h-[280px] place-items-center p-6 text-sm text-[#6B7280]">Could not load ride details.</div>;
  }

  const ride = detailQuery.data;
  const badgeClass = ride.status === "CANCELLED" ? "bg-[#FEE2E2] text-[#991B1B]" : "bg-[#EDF9F2] text-[#1A6B45]";
  const payoutClass = ride.status === "CANCELLED" ? "text-[#9CA3AF]" : "text-[#1A6B45]";

  return (
    <div className="flex flex-col gap-4 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-[#111111]">Ride details</div>
        {onClose ? <button type="button" className="h-7 w-7 rounded-full bg-[#F3F4F6]" onClick={onClose}>✕</button> : null}
      </div>

      <div className="h-[140px] overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-[#E8F0E4]">
        <StaticMap />
      </div>

      <div className="flex items-center justify-between">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
          {ride.status === "CANCELLED" ? "Cancelled" : ride.status === "RIDE_STARTED" ? "In progress" : "Completed"}
        </span>
        <span className={`text-[20px] font-bold ${payoutClass}`}>{formatCurrency(ride.payout_amount ?? 0)}</span>
      </div>

      <div className="rounded-[10px] bg-[#F9FAF8] p-3">
        <div className="flex items-start gap-2 text-xs text-[#374151]"><span className="mt-1 h-2 w-2 rounded-full bg-[#1A6B45]" /><span>{ride.pickup_address}</span></div>
        <div className="ml-1 my-1 h-3 w-px bg-[#D1D5DB]" />
        <div className="flex items-start gap-2 text-xs text-[#374151]"><span className="mt-1 h-2 w-2 bg-[#111111]" /><span>{ride.dropoff_address}</span></div>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-white">
        {[
          ["Rider", ride.rider_name],
          ["Date", formatDate(ride.created_at)],
          ["Vehicle", `${ride.vehicle_type} · ${ride.plate_number}`],
          ["Duration", `${ride.duration_minutes ?? "—"} min`],
          ["Distance", formatMiles(ride.distance_km)],
          ["Payment", ride.payment_method],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3 last:border-b-0">
            <span className="text-xs text-[#6B7280]">{label}</span>
            <span className="text-xs font-bold text-[#111111]">{value}</span>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-white">
        {[
          ["Ride fare", formatCurrency(ride.fare_amount ?? 0)],
          ["Tip", formatCurrency(ride.tip_amount ?? 0)],
          ["Bonus", formatCurrency(ride.bonus_amount ?? 0)],
          ["Your payout", formatCurrency(ride.payout_amount ?? 0)],
        ].map(([label, value], index, rows) => (
          <div key={label} className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3 last:border-b-0">
            <span className="text-xs text-[#6B7280]">{label}</span>
            <span className={`text-xs font-bold ${index === rows.length - 1 ? "text-[#1A6B45]" : "text-[#111111]"}`}>{value}</span>
          </div>
        ))}
      </div>

      {ride.status !== "CANCELLED" && ride.rider_rating ? (
        <div className="rounded-[10px] border border-[#E5E7EB] bg-white p-4">
          <div className="text-[11px] text-[#9CA3AF]">Rider&apos;s rating for you</div>
          <div className="mt-2 text-sm text-[#F59E0B]">{stars(ride.rider_rating)}</div>
          {ride.rider_comment ? <div className="mt-2 text-[11px] italic text-[#6B7280]">{ride.rider_comment}</div> : null}
        </div>
      ) : null}

      <button type="button" className="flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#F3F4F6] px-4 py-3 text-[13px] font-medium text-[#374151]" onClick={() => void handleDownload()}>
        <FileText size={14} />
        Download trip receipt
      </button>
    </div>
  );
}
