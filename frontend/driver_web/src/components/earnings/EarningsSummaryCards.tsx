import type { EarningsSummary } from "../../types/earnings";
import { formatCurrency } from "../../utils/formatters";

export function EarningsSummaryCards({ summary }: { summary: EarningsSummary }) {
  const cards = [
    { label: "Today", value: formatCurrency(summary.todayEarnings) },
    { label: "This week", value: formatCurrency(summary.weekEarnings) },
    { label: "This month", value: formatCurrency(summary.monthEarnings) },
    { label: "Pending payout", value: formatCurrency(summary.pendingPayout) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-3xl border border-line bg-white p-5 shadow-sm">
          <p className="text-sm text-muted">{card.label}</p>
          <p className="mt-3 text-2xl font-semibold text-ink">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
