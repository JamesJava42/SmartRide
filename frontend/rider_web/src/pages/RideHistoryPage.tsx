import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { downloadRiderReceipt, getRiderActivity } from "../api/riderActivity";
import { getRiderTravelInsights } from "../api/insights";
import { getRiderRecentPayments, getRiderSpendingSummary } from "../api/payments";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";
import { RideDetailPanel } from "../components/ride-history/RideDetailPanel";
import { RideHistoryFilters } from "../components/ride-history/RideHistoryFilters";
import { RideHistorySummaryStrip } from "../components/ride-history/RideHistorySummaryStrip";
import { RideHistoryTabs } from "../components/ride-history/RideHistoryTabs";
import { RideMonthGroup } from "../components/ride-history/RideMonthGroup";
import { InsightsBreakdownCard } from "../components/ride-history/InsightsBreakdownCard";
import { InsightsSummaryCards } from "../components/ride-history/InsightsSummaryCards";
import { RecentPaymentsList } from "../components/ride-history/RecentPaymentsList";
import { SpendingBreakdownCard } from "../components/ride-history/SpendingBreakdownCard";
import { SpendingChartCard } from "../components/ride-history/SpendingChartCard";
import { SpendingHeroCard } from "../components/ride-history/SpendingHeroCard";
import { UsagePatternsCard } from "../components/ride-history/UsagePatternsCard";
import { useMediaQuery } from "../hooks/useMediaQuery";
import type { RiderRideHistory } from "../types/activity";
import { formatMonthYear } from "../utils/formatters";

function groupByMonth(rides: RiderRideHistory[]) {
  const groups: Record<string, RiderRideHistory[]> = {};
  rides.forEach((ride) => {
    const key = formatMonthYear(ride.created_at);
    groups[key] ??= [];
    groups[key].push(ride);
  });
  return groups;
}

export function RideHistoryPage() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [activeTab, setActiveTab] = useState<"HISTORY" | "SPENDING" | "INSIGHTS">("HISTORY");
  const [activeStatus, setActiveStatus] = useState<"ALL" | "RIDE_COMPLETED" | "CANCELLED">("ALL");
  const [activePeriod, setActivePeriod] = useState<"all_time" | "this_month" | "last_3_months">("all_time");
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);

  const historyQuery = useQuery({
    queryKey: ["rider-ride-workspace", activeStatus, activePeriod],
    queryFn: () => getRiderActivity({ status: activeStatus, period: activePeriod }),
    enabled: activeTab === "HISTORY",
  });
  const spendingQuery = useQuery({
    queryKey: ["rider-spending-workspace", activePeriod],
    queryFn: () => getRiderSpendingSummary({ period: activePeriod }),
    enabled: activeTab === "SPENDING",
  });
  const paymentsQuery = useQuery({
    queryKey: ["rider-payments-workspace"],
    queryFn: getRiderRecentPayments,
    enabled: activeTab === "SPENDING",
  });
  const insightsQuery = useQuery({
    queryKey: ["rider-insights-workspace"],
    queryFn: getRiderTravelInsights,
    enabled: activeTab === "INSIGHTS",
  });

  const groups = useMemo(() => groupByMonth(historyQuery.data?.rides ?? []), [historyQuery.data?.rides]);
  const selectedRide = useMemo(
    () => historyQuery.data?.rides.find((ride) => ride.ride_id === selectedRideId) ?? null,
    [historyQuery.data?.rides, selectedRideId],
  );

  useEffect(() => {
    if (activeTab !== "HISTORY" || isMobile) {
      return;
    }
    const firstRideId = historyQuery.data?.rides[0]?.ride_id ?? null;
    setSelectedRideId((current) => (current && historyQuery.data?.rides.some((ride) => ride.ride_id === current) ? current : firstRideId));
  }, [activeTab, historyQuery.data?.rides, isMobile]);

  return (
    <div className="min-h-full bg-[#F4F5F2] p-4 sm:p-5 lg:p-6">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-5">
        <RideHistoryTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "HISTORY" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <RideHistorySummaryStrip
                summary={
                  historyQuery.data?.summary ?? {
                    total_rides: 0,
                    total_spent: 0,
                    average_distance_km: 0,
                    average_rating_given: 0,
                    currency: "USD",
                  }
                }
              />
              <RideHistoryFilters
                activeStatus={activeStatus}
                activePeriod={activePeriod}
                onStatusChange={setActiveStatus}
                onPeriodChange={setActivePeriod}
              />

              {historyQuery.isLoading ? <LoadingState /> : null}

              {historyQuery.isError ? (
                <EmptyState title="Could not load your trips" subtitle="Try again in a moment." />
              ) : null}

              {!historyQuery.isLoading && !historyQuery.isError ? (
                historyQuery.data?.rides.length ? (
                  <div className="overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_16px_40px_rgba(23,33,27,0.04)]">
                    {Object.entries(groups).map(([month, rides]) => (
                      <RideMonthGroup
                        key={month}
                        month={month}
                        rides={rides}
                        isMobile={isMobile}
                        selectedRideId={selectedRideId}
                        onSelect={setSelectedRideId}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title={`No ${activeStatus === "ALL" ? "trips" : activeStatus.toLowerCase()} found`}
                    subtitle="Your previous trips will appear here once you start riding."
                  />
                )
              ) : null}
            </div>

            {!isMobile && selectedRide ? (
              <RideDetailPanel ride={selectedRide} onDownload={() => void downloadRiderReceipt(selectedRide.ride_id)} />
            ) : null}
          </div>
        ) : null}

        {activeTab === "SPENDING" ? (
          <div className="space-y-5">
            {spendingQuery.isLoading || paymentsQuery.isLoading ? <LoadingState rows={4} /> : null}
            {!spendingQuery.isLoading && !paymentsQuery.isLoading && spendingQuery.data && paymentsQuery.data ? (
              <>
                <SpendingHeroCard summary={spendingQuery.data} />
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                  <SpendingChartCard payments={paymentsQuery.data} />
                  <SpendingBreakdownCard summary={spendingQuery.data} />
                </div>
                <RecentPaymentsList payments={paymentsQuery.data} />
              </>
            ) : null}
          </div>
        ) : null}

        {activeTab === "INSIGHTS" ? (
          <div className="space-y-5">
            {insightsQuery.isLoading ? <LoadingState rows={4} /> : null}
            {!insightsQuery.isLoading && insightsQuery.data ? (
              <>
                <InsightsSummaryCards insights={insightsQuery.data} />
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                  <InsightsBreakdownCard insights={insightsQuery.data} />
                  <UsagePatternsCard insights={insightsQuery.data} />
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
