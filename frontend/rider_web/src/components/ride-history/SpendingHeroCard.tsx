import { formatCurrency } from "../../utils/formatters";
import type { RiderSpendingSummary } from "../../api/payments";

export function SpendingHeroCard({ summary }: { summary: RiderSpendingSummary }) {
  return (
    <div className="rounded-[24px] bg-[#1A6B45] p-6 text-white shadow-[0_20px_50px_rgba(26,107,69,0.24)]">
      <div className="text-[11px] uppercase tracking-[0.12em] text-white/70">This month</div>
      <div className="mt-3 text-[34px] font-semibold">{formatCurrency(summary.totalSpent)}</div>
      <div className="mt-2 text-sm text-white/70">{summary.tripCount} rides · Avg {formatCurrency(summary.avgTripCost)}</div>
    </div>
  );
}
