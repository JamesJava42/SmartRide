type StatusFilter = "ALL" | "RIDE_COMPLETED" | "CANCELLED";
type PeriodFilter = "all_time" | "this_month" | "last_3_months";

export function RideHistoryFilters({
  activeStatus,
  activePeriod,
  onStatusChange,
  onPeriodChange,
}: {
  activeStatus: StatusFilter;
  activePeriod: PeriodFilter;
  onStatusChange: (status: StatusFilter) => void;
  onPeriodChange: (period: PeriodFilter) => void;
}) {
  const pills = [
    { type: "status", value: "ALL", label: "All" },
    { type: "status", value: "RIDE_COMPLETED", label: "Completed" },
    { type: "status", value: "CANCELLED", label: "Cancelled" },
    { type: "period", value: "this_month", label: "This Month" },
    { type: "period", value: "last_3_months", label: "Last 3 Months" },
  ] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((pill) => {
        const active = pill.type === "status" ? activeStatus === pill.value : activePeriod === pill.value;
        return (
          <button
            key={pill.label}
            type="button"
            className={`rounded-full border px-4 py-2 text-xs font-medium transition ${active ? "border-[#1A6B45] bg-[#EDF9F2] text-[#1A6B45]" : "border-line bg-white text-muted hover:text-ink"}`}
            onClick={() => {
              if (pill.type === "status") {
                onStatusChange(pill.value as StatusFilter);
              } else {
                onPeriodChange(pill.value as PeriodFilter);
              }
            }}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}
