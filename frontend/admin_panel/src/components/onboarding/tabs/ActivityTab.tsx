import type { DriverReviewData } from '../../../types/onboarding';
import { formatDateTime } from '../../../utils/onboarding';

type Props = {
  data: DriverReviewData;
};

function toneClass(tone: NonNullable<DriverReviewData['activity'][number]['tone']>) {
  if (tone === 'success') return 'bg-emerald-500';
  if (tone === 'warning') return 'bg-amber-500';
  if (tone === 'danger') return 'bg-red-500';
  return 'bg-zinc-400';
}

export function ActivityTab({ data }: Props) {
  return (
    <div className="rounded-3xl border border-line bg-white px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Activity</p>
      <ol className="mt-5 space-y-4">
        {data.activity.map((item) => (
          <li key={item.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className={`mt-1 h-2.5 w-2.5 rounded-full ${toneClass(item.tone ?? 'default')}`} />
              <span className="mt-1 h-full w-px bg-line" />
            </div>
            <div className="pb-4">
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.description}</p>
              <p className="mt-2 text-xs text-muted">{formatDateTime(item.timestamp)}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
