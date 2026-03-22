import { SearchInput } from "../common/SearchInput";

type LiveRideFiltersProps = {
  region: string;
  status: string;
  search: string;
  onRegionChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
};

export function LiveRideFilters(props: LiveRideFiltersProps) {
  return (
    <div className="grid gap-3 rounded-3xl border border-line bg-white p-4 md:grid-cols-[180px_180px_1fr]">
      <select
        className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none"
        value={props.region}
        onChange={(event) => props.onRegionChange(event.target.value)}
      >
        <option value="all">All Regions</option>
        <option value="long-beach">Long Beach, CA</option>
        <option value="los-angeles">Los Angeles, CA</option>
      </select>
      <select
        className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none"
        value={props.status}
        onChange={(event) => props.onStatusChange(event.target.value)}
      >
        <option value="ALL">All</option>
        <option value="MATCHING">Matching</option>
        <option value="DRIVER_ASSIGNED">Assigned</option>
        <option value="DRIVER_EN_ROUTE">En Route</option>
        <option value="DRIVER_ARRIVED">Arrived</option>
        <option value="RIDE_STARTED">Started</option>
        <option value="NO_DRIVERS_FOUND">No Drivers Found</option>
      </select>
      <SearchInput value={props.search} onChange={props.onSearchChange} placeholder="Search rider or driver name" />
    </div>
  );
}
