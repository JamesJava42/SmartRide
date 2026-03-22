import type { RiderActivityItem } from "../../types/activity";
import { formatCurrency } from "../../utils/formatters";

export function PaymentActivityView({ items }: { items: RiderActivityItem[] }) {
  const total = items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const receipts = items.filter((item) => item.type === "RECEIPT_AVAILABLE").length;

  return (
    <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_16px_40px_rgba(23,33,27,0.04)] sm:p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Payments tracked</div>
          <div className="mt-2 text-2xl font-semibold text-[#17211B]">{items.length}</div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Total charged</div>
          <div className="mt-2 text-2xl font-semibold text-[#1A6B45]">{formatCurrency(total)}</div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Receipts ready</div>
          <div className="mt-2 text-2xl font-semibold text-[#17211B]">{receipts}</div>
        </div>
      </div>
    </div>
  );
}
