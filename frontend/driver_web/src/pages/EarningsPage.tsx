import { useQuery } from "@tanstack/react-query";

import { getDriverEarningsSummary, getDriverPayoutHistory } from "../api/earnings";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";
import { SectionCard } from "../components/common/SectionCard";
import { EarningsSummaryCards } from "../components/earnings/EarningsSummaryCards";
import { PayoutHistoryTable } from "../components/earnings/PayoutHistoryTable";
import { DriverLayout } from "../components/layout/DriverLayout";
import { formatCurrency } from "../utils/formatters";

export function EarningsPage() {
  const summaryQuery = useQuery({
    queryKey: ["driver-earnings-summary"],
    queryFn: getDriverEarningsSummary,
  });
  const payoutQuery = useQuery({
    queryKey: ["driver-payout-history"],
    queryFn: getDriverPayoutHistory,
  });

  return (
    <DriverLayout>
      <div className="space-y-5">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Earnings</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">Daily earnings and payout history</h2>
          <p className="mt-2 text-sm text-muted">Review how much you earned today, this week, and this month.</p>
        </section>

        {summaryQuery.isLoading ? <LoadingState label="Loading earnings..." /> : null}
        {summaryQuery.isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {summaryQuery.error instanceof Error ? summaryQuery.error.message : "Unable to load earnings."}
          </div>
        ) : null}

        {summaryQuery.data ? (
          <>
            <EarningsSummaryCards summary={summaryQuery.data} />

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_360px]">
              <PayoutHistoryTable items={payoutQuery.data ?? []} />
              <SectionCard title="Breakdown" description="Current payout composition based on available backend data.">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Gross fares</span>
                    <span className="font-semibold text-ink">{formatCurrency(summaryQuery.data.grossFares)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Platform fee</span>
                    <span className="font-semibold text-ink">{formatCurrency(summaryQuery.data.platformFee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Adjustments</span>
                    <span className="font-semibold text-ink">{formatCurrency(summaryQuery.data.adjustments)}</span>
                  </div>
                  <div className="border-t border-line pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-ink">Net payout</span>
                      <span className="text-lg font-semibold text-ink">{formatCurrency(summaryQuery.data.netPayout)}</span>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            {payoutQuery.data && payoutQuery.data.length === 0 ? (
              <EmptyState title="No payouts yet" description="Completed ride payouts will appear here once you finish trips." />
            ) : null}
          </>
        ) : null}
      </div>
    </DriverLayout>
  );
}
