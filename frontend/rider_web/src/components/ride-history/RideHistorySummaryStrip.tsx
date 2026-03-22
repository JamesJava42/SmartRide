import type { RiderActivitySummary } from "../../types/activity";
import { formatCurrency, formatMiles } from "../../utils/formatters";

export function RideHistorySummaryStrip({ summary }: { summary: RiderActivitySummary }) {
  const avgTripCost = summary.total_rides ? summary.total_spent / summary.total_rides : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { label: "Total trips", value: String(summary.total_rides), accent: false },
        { label: "Total spent", value: formatCurrency(summary.total_spent), accent: true },
        { label: "Average trip cost", value: formatCurrency(avgTripCost), accent: false },
        { label: "Average trip distance", value: formatMiles(summary.average_distance_km), accent: false },
      ].map((item) => (
        <div key={item.label} className="rounded-[22px] border border-line bg-white p-4 shadow-[0_12px_30px_rgba(23,33,27,0.04)]">
          <div className={`text-[22px] font-bold ${item.accent ? "text-[#1A6B45]" : "text-ink"}`}>{item.value}</div>
          <div className="mt-2 text-[12px] text-[#9CA3AF]">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
