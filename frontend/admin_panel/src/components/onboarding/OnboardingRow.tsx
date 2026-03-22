import type { OnboardingQueueItem } from '../../types/onboarding';
import { formatDate } from '../../utils/onboarding';
import { StatusBadge } from '../common/StatusBadge';

type OnboardingRowProps = {
  item: OnboardingQueueItem;
  onReview: (id: string) => void;
};

function DocumentProgress({
  submitted,
  approved,
  total,
}: {
  submitted: number;
  approved: number;
  total: number;
}) {
  const completion = total > 0 ? Math.round((submitted / total) * 100) : 0;
  const approvedCompletion = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <div className="min-w-[120px]">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{submitted}/{total}</span>
        <span>{approved} approved</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#ece8df]">
        <div className="relative h-full rounded-full bg-[#d8d2c7]" style={{ width: `${completion}%` }}>
          <div className="absolute left-0 top-0 h-full rounded-full bg-accent" style={{ width: `${approvedCompletion}%` }} />
        </div>
      </div>
    </div>
  );
}

export function OnboardingRow({ item, onReview }: OnboardingRowProps) {
  return (
    <tr className="border-t border-line text-sm text-ink transition hover:bg-[#fcfbf8]">
      <td className="px-5 py-4 align-top">
        <span className="font-mono text-[13px] text-muted">{item.driver_id.slice(0, 8)}</span>
      </td>
      <td className="px-5 py-4 align-top">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2d8d8c] text-xs font-semibold text-white">
            {item.driver_initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium text-ink">{item.driver_name}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 align-top text-[15px] text-ink">{item.region_name}</td>
      <td className="px-5 py-4 align-top text-[15px] text-ink">{formatDate(item.submitted_at)}</td>
      <td className="px-5 py-4 align-top">
        <StatusBadge
          status={item.onboarding_status}
          label={item.onboarding_status === 'SUBMITTED' ? 'Pending' : undefined}
          className="bg-[#f4e3a9] text-[#5f5120] border-[#efdfae] px-3 py-1 text-[13px]"
        />
      </td>
      <td className="px-5 py-4 align-top">
        <DocumentProgress
          submitted={item.doc_submitted_count}
          approved={item.doc_approved_count}
          total={item.docs_total}
        />
      </td>
      <td className="px-5 py-4 align-top">
        <button
          type="button"
          onClick={() => onReview(item.driver_id)}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accentDark"
        >
          Review
        </button>
      </td>
    </tr>
  );
}
