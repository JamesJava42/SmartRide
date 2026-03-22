import { useQuery } from "@tanstack/react-query";

import { downloadRideReceipt, getRiderActivityById } from "../../api/activity";
import { EmptyState } from "../common/EmptyState";
import { LoadingState } from "../common/LoadingState";
import { SectionCard } from "../common/SectionCard";
import { StatusBadge } from "../common/StatusBadge";
import { formatCurrency, formatDate, formatMiles } from "../../utils/formatters";

export function ActivityDetailPanel({ activityId }: { activityId: string }) {
  const detailQuery = useQuery({
    queryKey: ["rider-activity-detail", activityId],
    queryFn: () => getRiderActivityById(activityId),
    enabled: Boolean(activityId),
  });

  const detail = detailQuery.data;

  async function handleDownload() {
    if (!detail?.ride_id) {
      return;
    }
    const blob = await downloadRideReceipt(detail.ride_id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${detail.ride_id}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  if (detailQuery.isLoading) {
    return <LoadingState rows={3} />;
  }

  if (!detail) {
    return <EmptyState title="No activity selected" subtitle="Choose a trip or payment event to inspect it here." />;
  }

  return (
    <div className="sticky top-24 space-y-4">
      <SectionCard title="Activity detail" subtitle={detail.title}>
        <div className="space-y-4 pb-2">
          <div className="h-40 rounded-[20px] border border-line bg-[radial-gradient(circle_at_top_left,_rgba(26,107,69,0.16),_transparent_35%),linear-gradient(180deg,#EEF4EA_0%,#E7F0E4_100%)] p-4">
            <div className="flex h-full items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-[#1A6B45]" />
                  <span className="text-sm text-[#374151]">{detail.pickup_address}</span>
                </div>
                <div className="ml-[5px] h-10 w-px bg-[#C7D2CB]" />
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-sm bg-[#141A13]" />
                  <span className="text-sm text-[#374151]">{detail.dropoff_address}</span>
                </div>
              </div>
              <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="opacity-80">
                <path d="M18 20C38 18 55 24 63 38C70 50 64 64 78 76" stroke="#1A6B45" strokeWidth="4" strokeLinecap="round" />
                <circle cx="18" cy="20" r="6" fill="#1A6B45" />
                <rect x="72" y="70" width="12" height="12" rx="3" fill="#141A13" />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <StatusBadge status={detail.status} />
            <div className={`text-xl font-semibold ${detail.status === "CANCELLED" ? "text-[#9CA3AF]" : "text-[#17211B]"}`}>
              {detail.amount != null ? formatCurrency(detail.amount) : "—"}
            </div>
          </div>

          <div className="rounded-[20px] bg-[#F9FAF8] p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#1A6B45]" />
                <p className="text-sm text-[#374151]">{detail.pickup_address}</p>
              </div>
              <div className="ml-[5px] h-8 w-px bg-[#D1D5DB]" />
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-sm bg-[#141A13]" />
                <p className="text-sm text-[#374151]">{detail.dropoff_address}</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[20px] border border-[#E5E7EB]">
            {[
              ["Date", formatDate(detail.timestamp)],
              ["Driver", detail.driver_name],
              ["Vehicle", [detail.vehicle_label, detail.plate_number && detail.plate_number !== "—" ? detail.plate_number : null].filter(Boolean).join(" · ")],
              ["Duration", detail.duration_minutes != null ? `${detail.duration_minutes} min` : "—"],
              ["Distance", detail.distance_miles != null ? `${detail.distance_miles.toFixed(1)} mi` : "—"],
              ["Payment", detail.payment_method],
              ["Ride type", detail.ride_type],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3 text-sm last:border-b-0">
                <span className="text-[#67746C]">{label}</span>
                <span className="max-w-[58%] text-right font-semibold text-[#17211B]">{value}</span>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-[20px] border border-[#E5E7EB]">
            {[
              ["Base fare", formatCurrency(detail.fare_breakdown.base_fare)],
              ["Distance & time", formatCurrency(detail.fare_breakdown.distance_time_fare)],
              ["Fees", formatCurrency(detail.fare_breakdown.fees)],
              ["Taxes", formatCurrency(detail.fare_breakdown.taxes)],
              ["Tip", formatCurrency(detail.fare_breakdown.tip)],
              ["Total", formatCurrency(detail.fare_breakdown.total)],
            ].map(([label, value], index, all) => (
              <div key={label} className={`flex items-center justify-between px-4 py-3 text-sm ${index !== all.length - 1 ? "border-b border-[#F3F4F6]" : ""}`}>
                <span className="text-[#67746C]">{label}</span>
                <span className={`font-semibold ${label === "Total" ? "text-[#1A6B45]" : "text-[#17211B]"}`}>{value}</span>
              </div>
            ))}
          </div>

          {(detail.rider_rating != null || detail.rider_comment) && (
            <div className="rounded-[20px] border border-line p-4">
              <div className="text-xs font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">Feedback</div>
              {detail.rider_rating != null ? (
                <div className="mt-3 text-sm font-semibold text-[#F59E0B]">
                  {"★".repeat(detail.rider_rating)}
                  {"☆".repeat(Math.max(5 - detail.rider_rating, 0))}
                </div>
              ) : null}
              <div className="mt-2 text-sm text-[#67746C]">{detail.rider_comment || "No comment"}</div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => void handleDownload()}
              disabled={!detail.receipt_available || !detail.ride_id}
              className="rounded-2xl bg-[#F3F4F6] px-4 py-3 text-sm font-medium text-[#374151] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Download receipt
            </button>
            <button type="button" className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#17211B]">
              Book again
            </button>
            <button type="button" className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#17211B]">
              Get help
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
