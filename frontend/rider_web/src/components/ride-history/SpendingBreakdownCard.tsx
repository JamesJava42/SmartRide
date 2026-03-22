import type { RiderSpendingSummary } from "../../api/payments";
import { formatCurrency } from "../../utils/formatters";

export function SpendingBreakdownCard({ summary }: { summary: RiderSpendingSummary }) {
  return (
    <div className="rounded-[24px] border border-line bg-white p-5 shadow-[0_16px_40px_rgba(23,33,27,0.04)]">
      {[
        ["Trips total", formatCurrency(summary.totalSpent)],
        ["Tips total", formatCurrency(summary.tipsTotal)],
        ["Fees/taxes total", formatCurrency(summary.feesTotal)],
        ["Saved via credits", formatCurrency(summary.discountsTotal)],
        ["Default payment", summary.defaultPaymentMethod],
      ].map(([label, value]) => (
        <div key={label} className="flex items-center justify-between border-b border-[#F3F4F6] py-3 last:border-b-0">
          <span className="text-sm text-[#6B7280]">{label}</span>
          <span className="text-sm font-semibold text-[#111111]">{value}</span>
        </div>
      ))}
    </div>
  );
}
