import type { OnboardingTimelineItem } from '../../types/onboarding';
import { formatDateTime } from '../../utils/onboarding';

type Props = {
  items: OnboardingTimelineItem[];
};

function markerClass(state: OnboardingTimelineItem['state']) {
  if (state === 'complete') return 'border-emerald-500 bg-emerald-500 text-white';
  if (state === 'current') return 'border-accent bg-accent text-white';
  if (state === 'rejected') return 'border-red-500 bg-red-500 text-white';
  return 'border-zinc-200 bg-white text-zinc-300';
}

export function OnboardingTimeline({ items }: Props) {
  return (
    <div className="rounded-3xl border border-line bg-white px-5 py-5">
      <p className="mb-5 text-xs font-semibold uppercase tracking-wide text-muted">Onboarding Timeline</p>
      <div className="grid gap-4 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="relative rounded-2xl border border-line bg-[#fcfbf8] px-4 py-4">
            <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold ${markerClass(item.state)}`}>
              {item.state === 'complete' ? '✓' : item.state === 'rejected' ? '!' : item.state === 'current' ? '•' : '○'}
            </div>
            <p className="text-sm font-semibold text-ink">{item.label}</p>
            <p className="mt-1 text-xs text-muted">{formatDateTime(item.timestamp)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
