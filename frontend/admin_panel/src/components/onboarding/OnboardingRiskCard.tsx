import type { DriverReviewData } from '../../types/onboarding';

type Props = {
  data: DriverReviewData;
  compact?: boolean;
};

function toneClass(status: DriverReviewData['risk_signals'][number]['status']) {
  if (status === 'complete') return 'bg-emerald-100 text-emerald-700';
  if (status === 'flagged') return 'bg-red-100 text-red-700';
  if (status === 'missing') return 'bg-zinc-200 text-zinc-700';
  return 'bg-amber-100 text-amber-700';
}

export function OnboardingRiskCard({ data, compact = false }: Props) {
  return (
    <div className="rounded-[20px] border border-line bg-white">
      <div className="px-5 py-5">
        <h4 className="text-[18px] font-semibold text-ink">Onboarding Risk</h4>
        <div className={`mt-5 space-y-3 ${compact ? '' : ''}`}>
          {data.risk_signals.slice(0, compact ? 2 : data.risk_signals.length).map((signal) => (
            <div key={signal.id} className="rounded-2xl border border-line px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink">{signal.label}</p>
                {!compact ? (
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClass(signal.status)}`}>
                    {signal.status}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-muted">{signal.detail}</p>
            </div>
          ))}
        </div>

        {compact ? (
          <div className="mt-4 flex justify-end">
            <button type="button" className="rounded-xl border border-line px-5 py-2 text-sm font-medium text-ink transition hover:bg-[#f7f5ef]">
              Save
            </button>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-[#faf8f3] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Flags</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{data.compliance_flags_count}</p>
          </div>
        )}
      </div>
    </div>
  );
}
