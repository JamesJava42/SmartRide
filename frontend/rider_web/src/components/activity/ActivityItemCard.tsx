import { ReceiptText } from "lucide-react";

import type { RiderActivityItem } from "../../types/activity";
import { formatCurrency, formatDateShort } from "../../utils/formatters";
import { StatusPill } from "../common/StatusPill";

function getPillLabel(item: RiderActivityItem) {
  if (item.type === "RECEIPT_AVAILABLE") return "Receipt available";
  if (item.type === "PAYMENT_PROCESSED") return "Payment processed";
  if (item.type === "RIDE_COMPLETED") return "Completed";
  if (item.type === "RIDE_CANCELLED") return "Cancelled";
  return item.title;
}

export function ActivityItemCard({ item }: { item: RiderActivityItem }) {
  return (
    <article className="rounded-[10px] border border-[#E2E4E0] bg-white">
      <div className="flex flex-col gap-4 px-4 py-4 md:grid md:grid-cols-[minmax(0,1.6fr)_minmax(180px,0.7fr)_minmax(180px,0.7fr)] md:items-center md:gap-0 md:px-5">
        <div className="min-w-0 md:pr-6">
          <div className="text-[16px] leading-[1.25] text-[#17211B]">{formatDateShort(item.timestamp)}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[16px] leading-[1.35] text-[#17211B]">
            <span className="truncate">{item.pickup_address || "Unknown location"}</span>
            <span className="text-[#154E38]">→</span>
            <span className="truncate">{item.dropoff_address || "Unknown location"}</span>
          </div>
          <div className="mt-2 text-[14px] text-[#3F4541]">{item.event_note}</div>
        </div>

        <div className="md:border-l md:border-[#E3E5E1] md:px-6">
          <div className="text-[18px] font-medium leading-none text-[#17211B]">
            {item.amount != null ? formatCurrency(item.amount) : "—"}
          </div>
          <div className="mt-3 text-[14px] text-[#2F3430]">
            {[item.ride_type?.toUpperCase?.() ?? item.ride_type, item.duration_minutes ? `${item.duration_minutes} min` : null, item.driver_name].filter(Boolean).join(" · ")}
          </div>
          {item.cta_label === "View details" ? (
            <div className="mt-3 inline-flex items-center gap-2 text-[14px] text-[#154E38]">
              <ReceiptText size={14} />
              <span>View details</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end md:pl-6">
          <StatusPill>{getPillLabel(item)}</StatusPill>
          <button type="button" className="text-[14px] font-medium text-[#154E38]">
            {item.cta_label}
          </button>
        </div>
      </div>
    </article>
  );
}
