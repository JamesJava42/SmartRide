import type { RegionRecord } from '../../api/admin';

type OnboardingFiltersProps = {
  statusFilter: string;
  regionFilter: string;
  search: string;
  onStatusChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  regions: RegionRecord[];
};

const selectClassName =
  'h-12 rounded-2xl border border-line bg-white px-4 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15';

export function OnboardingFilters({
  statusFilter,
  regionFilter,
  search,
  onStatusChange,
  onRegionChange,
  onSearchChange,
  regions,
}: OnboardingFiltersProps) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
      <div className="relative xl:w-[152px]">
        <select
          className={`${selectClassName} w-full appearance-none`}
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="">All Status</option>
          <option value="SUBMITTED">Pending</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="NEEDS_INFO">Needs Info</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.25 7.5L10 12.25 14.75 7.5" />
        </svg>
      </div>

      <div className="relative xl:w-[152px]">
        <select
          className={`${selectClassName} w-full appearance-none`}
          value={regionFilter}
          onChange={(event) => onRegionChange(event.target.value)}
        >
          <option value="">All Regions</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.25 7.5L10 12.25 14.75 7.5" />
        </svg>
      </div>

      <div className="relative flex-1">
        <svg
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M14.5 14.5L18 18" strokeLinecap="round" />
          <circle cx="8.75" cy="8.75" r="5.75" />
        </svg>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by driver name, email, or phone..."
          className="h-12 w-full rounded-2xl border border-line bg-white px-4 pr-12 text-sm text-ink placeholder:text-muted shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
      </div>
    </div>
  );
}
