import type { DriverReviewData } from '../../types/onboarding';
import { fmtDate } from '../../utils/onboarding';

type Props = { data: DriverReviewData };

type TimelineEvent = {
  label: string;
  ts: string | null | undefined;
  color: string;
};

export function ActivityTab({ data }: Props) {
  const ob = data.onboarding;

  const events: TimelineEvent[] = [
    { label: 'Driver account created', ts: data.created_at, color: 'bg-zinc-400' },
    { label: 'Application submitted', ts: ob?.submitted_at, color: 'bg-amber-500' },
    { label: 'Review started', ts: ob?.review_started_at, color: 'bg-sky-500' },
    { label: ob?.status === 'REJECTED' ? 'Application rejected' : 'Application reviewed', ts: ob?.reviewed_at, color: ob?.status === 'REJECTED' ? 'bg-red-500' : ob?.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-zinc-400' },
  ].filter((e) => e.ts);

  return (
    <div className="space-y-4">
      {/* Profile info */}
      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Driver Profile</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Full Name</p>
            <p className="mt-0.5 text-sm font-medium text-ink">
              {data.first_name} {data.last_name ?? ''}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Phone</p>
            <p className="mt-0.5 text-sm font-medium text-ink">{data.phone_number}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Driver Status</p>
            <p className="mt-0.5 text-sm font-medium text-ink">{data.status.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Account Created</p>
            <p className="mt-0.5 text-sm font-medium text-ink">{fmtDate(data.created_at)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Total Rides</p>
            <p className="mt-0.5 text-sm font-medium text-ink">{data.total_rides_completed}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Rating</p>
            <p className="mt-0.5 text-sm font-medium text-ink">
              {data.rating_avg != null ? `${data.rating_avg.toFixed(1)} ★` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Onboarding timeline */}
      {ob && (
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="mb-5 text-xs font-semibold uppercase tracking-wide text-muted">Onboarding Timeline</p>

          {events.length === 0 ? (
            <p className="text-sm text-muted">No timeline events recorded yet.</p>
          ) : (
            <ol className="relative border-l border-line pl-6 space-y-6">
              {events.map((event, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[1.35rem] top-0.5 h-3 w-3 rounded-full border-2 border-white ring-1 ring-line ${event.color}`} />
                  <p className="text-sm font-medium text-ink">{event.label}</p>
                  <p className="mt-0.5 text-xs text-muted">{fmtDate(event.ts)}</p>
                </li>
              ))}
            </ol>
          )}

          {ob.reviewed_by_admin_id && (
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Reviewed By</p>
              <p className="mt-0.5 text-sm text-ink font-medium">Admin {ob.reviewed_by_admin_id.slice(0, 8)}…</p>
            </div>
          )}

          {ob.review_notes && (
            <div className="mt-4 rounded-xl bg-[#f7f7f5] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Review Notes</p>
              <p className="mt-1 text-sm text-ink">{ob.review_notes}</p>
            </div>
          )}

          {ob.rejection_reason && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Rejection Reason</p>
              <p className="mt-1 text-sm text-red-700">{ob.rejection_reason}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
