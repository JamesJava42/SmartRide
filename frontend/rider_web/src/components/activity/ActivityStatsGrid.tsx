import { CarFront, MapPin } from "lucide-react";

import type { ActivityStatsSummary } from "../../types/activity";
import { formatCurrency } from "../../utils/formatters";
import { ActivityStatCard } from "./ActivityStatCard";

export function ActivityStatsGrid({ summary }: { summary: ActivityStatsSummary }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <ActivityStatCard
        icon={<CarFront size={20} strokeWidth={1.9} />}
        value={String(summary.totalTrips)}
        label="Total Trips"
      />
      <ActivityStatCard value={formatCurrency(summary.totalSpent)} label="Total Spent" />
      <ActivityStatCard value={formatCurrency(summary.averageTripCost)} label="Average Trip Cost" />
      <ActivityStatCard
        icon={<MapPin size={20} strokeWidth={1.9} />}
        value={`${summary.averageTripDistanceMiles.toFixed(1)} mi`}
        label="Average Trip Distance"
      />
    </div>
  );
}
