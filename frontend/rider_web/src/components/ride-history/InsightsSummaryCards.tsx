import type { RiderTravelInsights } from "../../api/insights";
import { formatMiles } from "../../utils/formatters";

export function InsightsSummaryCards({ insights }: { insights: RiderTravelInsights }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ["Total trips lifetime", String(insights.lifetimeTripCount)],
        ["Favorite city", insights.favoriteCity],
        ["Average ride distance", formatMiles(insights.avgDistanceKm)],
        ["Average trip duration", `${Math.round(insights.avgDurationMinutes)} min`],
      ].map(([label, value]) => (
        <div key={label} className="rounded-[22px] border border-line bg-white p-4 shadow-[0_12px_30px_rgba(23,33,27,0.04)]">
          <div className="text-[20px] font-bold text-[#111111]">{value}</div>
          <div className="mt-2 text-[12px] text-[#9CA3AF]">{label}</div>
        </div>
      ))}
    </div>
  );
}
