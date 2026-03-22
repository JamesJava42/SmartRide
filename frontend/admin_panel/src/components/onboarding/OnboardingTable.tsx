import type { OnboardingQueueItem } from '../../types/onboarding';
import { EmptyState } from '../common/EmptyState';
import { LoadingState } from '../common/LoadingState';
import { OnboardingRow } from './OnboardingRow';

type OnboardingTableProps = {
  items: OnboardingQueueItem[];
  loading: boolean;
  error?: string | null;
  onReview: (driverId: string) => void;
  page?: number;
  totalItems?: number;
};

export function OnboardingTable({
  items,
  loading,
  error,
  onReview,
  page = 1,
  totalItems,
}: OnboardingTableProps) {
  const visibleCount = items.length;
  const start = visibleCount === 0 ? 0 : (page - 1) * visibleCount + 1;
  const end = visibleCount === 0 ? 0 : start + visibleCount - 1;
  const total = totalItems ?? visibleCount;

  return (
    <div className="overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_2px_10px_rgba(20,20,20,0.03)]">
      {loading ? (
        <LoadingState className="rounded-none border-0" label="Loading onboarding applications..." />
      ) : error ? (
        <EmptyState
          className="rounded-none border-0"
          icon="!"
          title="Unable to load onboarding queue"
          description={error}
        />
      ) : items.length === 0 ? (
        <EmptyState
          className="rounded-none border-0"
          icon="○"
          title="No applications found"
          description="There are no onboarding records matching the current filters."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="text-[14px] text-muted">
              <tr>
                <th className="px-5 py-4 font-medium">ID</th>
                <th className="px-5 py-4 font-medium">Driver</th>
                <th className="px-5 py-4 font-medium">Region</th>
                <th className="px-5 py-4 font-medium">Submitted</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Documents</th>
                <th className="px-5 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <OnboardingRow key={item.driver_id} item={item} onReview={onReview} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && items.length > 0 ? (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-4 text-sm text-ink md:flex-row">
          <p className="text-muted">
            Showing {start} to {end} of {total} results
          </p>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-xl border border-line px-4 py-2 transition hover:bg-[#f7f5ef]">
              Previous
            </button>
            <span className="rounded-xl border border-line px-4 py-2 font-medium">{page}</span>
            <button type="button" className="rounded-xl border border-line px-4 py-2 transition hover:bg-[#f7f5ef]">
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
