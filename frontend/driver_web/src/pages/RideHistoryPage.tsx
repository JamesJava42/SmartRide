import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getDriverRideHistory } from "../api/rides";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";
import { SectionCard } from "../components/common/SectionCard";
import { DriverLayout } from "../components/layout/DriverLayout";
import { RideHistoryCard } from "../components/rides/RideHistoryCard";
import { RideHistoryFilters } from "../components/rides/RideHistoryFilters";
import { RideHistoryTable } from "../components/rides/RideHistoryTable";
import type { RideHistoryFilters as RideHistoryFilterValues } from "../types/ride";
import { formatCurrency } from "../utils/formatters";

export function RideHistoryPage() {
  const [filters, setFilters] = useState<RideHistoryFilterValues>({
    range: "week",
    status: "all",
    search: "",
  });

  const historyQuery = useQuery({
    queryKey: ["driver-ride-history", filters],
    queryFn: () => getDriverRideHistory(filters),
  });

  return (
    <DriverLayout>
      <div className="space-y-5">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Ride History</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">Past rides and payouts</h2>
          <p className="mt-2 text-sm text-muted">Track completed trips, cancellations, and driver payouts.</p>
        </section>

        <RideHistoryFilters filters={filters} onChange={setFilters} />

        {historyQuery.isLoading ? <LoadingState label="Loading ride history..." /> : null}
        {historyQuery.isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {historyQuery.error instanceof Error ? historyQuery.error.message : "Unable to load ride history."}
          </div>
        ) : null}

        {historyQuery.data ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-line bg-white p-5 shadow-sm">
                <p className="text-sm text-muted">Completed rides</p>
                <p className="mt-3 text-2xl font-semibold text-ink">{historyQuery.data.stats.totalCompletedRides}</p>
              </div>
              <div className="rounded-3xl border border-line bg-white p-5 shadow-sm">
                <p className="text-sm text-muted">Total earnings</p>
                <p className="mt-3 text-2xl font-semibold text-ink">{formatCurrency(historyQuery.data.stats.totalEarnings)}</p>
              </div>
              <div className="rounded-3xl border border-line bg-white p-5 shadow-sm">
                <p className="text-sm text-muted">Average fare</p>
                <p className="mt-3 text-2xl font-semibold text-ink">{formatCurrency(historyQuery.data.stats.averageFare)}</p>
              </div>
              <div className="rounded-3xl border border-line bg-white p-5 shadow-sm">
                <p className="text-sm text-muted">Cancellations</p>
                <p className="mt-3 text-2xl font-semibold text-ink">{historyQuery.data.stats.cancellationCount}</p>
              </div>
            </div>

            {historyQuery.data.items.length === 0 ? (
              <EmptyState title="No rides found" description="There are no rides for the selected filters yet." />
            ) : (
              <>
                <div className="hidden lg:block">
                  <RideHistoryTable rides={historyQuery.data.items} />
                </div>
                <div className="space-y-4 lg:hidden">
                  {historyQuery.data.items.map((ride) => (
                    <RideHistoryCard key={ride.rideId} ride={ride} />
                  ))}
                </div>
              </>
            )}

            <SectionCard title="Operator note" description="This history is sourced from completed driver ride records in marketplace service.">
              <p className="text-sm text-muted">Distance, duration, and rider labels will become richer as the backend exposes more ride telemetry. The page already uses safe fallbacks instead of showing blank cells.</p>
            </SectionCard>
          </>
        ) : null}
      </div>
    </DriverLayout>
  );
}
