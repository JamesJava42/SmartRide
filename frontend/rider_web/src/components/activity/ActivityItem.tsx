import { StatusBadge } from "../common/StatusBadge";
import type { RiderActivityItem } from "../../types/activity";
import { formatCurrency, formatDateShort } from "../../utils/formatters";

function iconForType(type: RiderActivityItem["type"]) {
  if (type === "PAYMENT_PROCESSED" || type === "RECEIPT_AVAILABLE") return "$";
  if (type === "RIDE_CANCELLED" || type === "REFUND_ISSUED") return "!";
  return "•";
}

export function ActivityItem({
  item,
  selected = false,
  onSelect,
  mobile = false,
}: {
  item: RiderActivityItem;
  selected?: boolean;
  onSelect: () => void;
  mobile?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`block w-full text-left transition ${
        mobile
          ? "rounded-[24px] border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_10px_28px_rgba(23,33,27,0.03)]"
          : "border-b border-[#F3F4F6] px-5 py-4 hover:bg-[#FAFAF9] last:border-b-0 sm:px-6"
      } ${selected && !mobile ? "border-l-[3px] border-l-[#1A6B45] bg-[#EDF9F2] pl-[21px]" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F4F5F2] text-sm font-semibold text-[#1A6B45]">
          {iconForType(item.type)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-[#9CA3AF]">{formatDateShort(item.timestamp)}</div>
              <div className="mt-1 text-[15px] font-semibold text-[#17211B]">{item.title}</div>
              <div className="mt-1 truncate text-sm text-[#374151]">{item.route_label}</div>
            </div>
            <div className="shrink-0 text-right">
              <StatusBadge status={item.status} />
              {item.amount != null ? (
                <div className={`mt-2 text-sm font-semibold ${item.status === "CANCELLED" ? "text-[#9CA3AF]" : "text-[#17211B]"}`}>
                  {formatCurrency(item.amount)}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[12px] text-muted">
            <div className="truncate">
              {[item.ride_type, item.duration_minutes ? `${item.duration_minutes} min` : null, item.driver_name].filter(Boolean).join(" · ")}
            </div>
            <span className="font-medium text-[#1A6B45]">{item.cta_label}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
