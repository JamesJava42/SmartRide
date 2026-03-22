import type { RideHistoryFilters as RideHistoryFilterValues } from "../../types/ride";

export function RideHistoryFilters({
  filters,
  onChange,
}: {
  filters: RideHistoryFilterValues;
  onChange: (next: RideHistoryFilterValues) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-[180px_180px_minmax(0,1fr)]">
      <select
        value={filters.range}
        onChange={(event) => onChange({ ...filters, range: event.target.value as RideHistoryFilterValues["range"] })}
        className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink"
      >
        <option value="today">Today</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="all">All time</option>
      </select>
      <select
        value={filters.status}
        onChange={(event) => onChange({ ...filters, status: event.target.value as RideHistoryFilterValues["status"] })}
        className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink"
      >
        <option value="all">All statuses</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <input
        value={filters.search}
        onChange={(event) => onChange({ ...filters, search: event.target.value })}
        className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink"
        placeholder="Search ride ID or location..."
      />
    </div>
  );
}
