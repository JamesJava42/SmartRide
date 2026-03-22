import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getRiderActivity, getRiderActivityStats, groupActivitySections } from "../api/activity";
import { ActivitySection } from "../components/activity/ActivitySection";
import { ActivityStatsGrid } from "../components/activity/ActivityStatsGrid";
import { ActivityTabs } from "../components/activity/ActivityTabs";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";
import type { ActivityFilter } from "../types/activity";

const emptyStateCopy: Record<ActivityFilter, { title: string; subtitle: string }> = {
  ALL: {
    title: "No activity yet",
    subtitle: "Your rides, payments, and receipts will appear here.",
  },
  ONGOING: {
    title: "No ongoing rides",
    subtitle: "Active trips will show here while they are in progress.",
  },
  UPCOMING: {
    title: "No upcoming rides",
    subtitle: "Scheduled rides and reminders will appear here.",
  },
  PAST: {
    title: "No past rides",
    subtitle: "Completed and cancelled rides will appear here once you start riding.",
  },
  PAYMENTS: {
    title: "No payment activity",
    subtitle: "Charges, receipts, and payment updates will appear here.",
  },
};

export function ActivityPage() {
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>("ALL");

  const statsQuery = useQuery({
    queryKey: ["rider-activity-stats"],
    queryFn: getRiderActivityStats,
  });

  const activityQuery = useQuery({
    queryKey: ["rider-activity-design", activeFilter],
    queryFn: () => getRiderActivity({ filter: activeFilter }),
  });

  const groups = useMemo(() => groupActivitySections(activityQuery.data ?? []), [activityQuery.data]);

  const isLoading = statsQuery.isLoading || activityQuery.isLoading;
  const isError = statsQuery.isError || activityQuery.isError;

  return (
    <div className="min-h-full bg-[#F4F5F2] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1080px]">
        <section className="space-y-4">
          <div className="space-y-3">
            <h1 className="text-[52px] font-semibold leading-none tracking-[-0.04em] text-[#111111] sm:text-[58px]">
              Activity
            </h1>
            <p className="max-w-[720px] text-[17px] text-[#5F6762]">
              Stay updated on your rides, payments, and trip updates.
            </p>
          </div>

          <ActivityTabs active={activeFilter} onChange={setActiveFilter} />
        </section>

        <div className="mt-7">
          {isLoading ? (
            <LoadingState rows={4} />
          ) : isError || !statsQuery.data ? (
            <EmptyState title="Could not load activity" subtitle="Try again in a moment." />
          ) : (
            <div className="space-y-8">
              <ActivityStatsGrid summary={statsQuery.data} />

              {groups.length ? (
                <div className="space-y-7">
                  {groups.map((group) => (
                    <ActivitySection key={group.label} group={group} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={emptyStateCopy[activeFilter].title}
                  subtitle={emptyStateCopy[activeFilter].subtitle}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
