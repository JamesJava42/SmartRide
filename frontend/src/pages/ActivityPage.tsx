import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ActivityHistoryList } from "../components/ActivityHistoryList";
import { PageContainer } from "../components/PageContainer";
import { api } from "../services/api";
import type { RideHistoryItem } from "../types/api";

const filters = ["All", "Upcoming", "Completed", "Cancelled"] as const;

function groupRides(items: RideHistoryItem[]) {
  return {
    All: items,
    Upcoming: items.filter((item) => item.status === "REQUESTED"),
    Completed: items.filter((item) => item.status === "RIDE_COMPLETED"),
    Cancelled: items.filter((item) => ["CANCELLED", "NO_DRIVER_FOUND", "EXPIRED"].includes(item.status)),
  };
}

export function ActivityPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");
  const ridesQuery = useQuery({
    queryKey: ["rides"],
    queryFn: api.getRides,
    refetchInterval: 10000,
  });

  const grouped = useMemo(() => {
    const filtered =
      ridesQuery.data?.filter((ride: RideHistoryItem) =>
        `${ride.pickup_label} ${ride.destination_label} ${ride.driver_name ?? ""}`.toLowerCase().includes(search.toLowerCase()),
      ) ?? [];
    return groupRides(filtered);
  }, [ridesQuery.data, search]);

  return (
    <PageContainer>
      <div className="p-4 md:p-5">
        <h1 className="text-[1.75rem] font-semibold text-ink">Activity</h1>

        <div className="mt-5 flex flex-wrap border border-line bg-canvas">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`border-r border-line px-4 py-2.5 text-sm last:border-r-0 ${activeFilter === filter ? "bg-surface text-ink" : "text-muted"}`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search.."
            className="flex-1 rounded-none border border-line bg-white px-4 py-2.5 text-sm outline-none"
          />
          <button type="button" className="rounded-none border border-line bg-canvas px-5 py-2.5 text-sm text-muted">
            Filters
          </button>
        </div>

        {ridesQuery.isLoading ? <p className="mt-8 text-lg text-muted">Loading ride history...</p> : null}
        {ridesQuery.isError ? (
          <p className="mt-8 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Unable to load activity.</p>
        ) : null}

        <div className="mt-5 space-y-5">
          <section>
            <h2 className="text-[1.4rem] font-semibold text-ink">{activeFilter}</h2>
            <div className="mt-4">
              <ActivityHistoryList items={grouped[activeFilter]} />
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
