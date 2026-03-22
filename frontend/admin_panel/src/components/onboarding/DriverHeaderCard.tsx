import type { DriverReviewData, DriverStatus, OnboardingStatus } from '../../types/onboarding';
import { fmtDate, fmtDateShort } from '../../utils/onboarding';

type DriverHeaderCardProps = {
  data: DriverReviewData;
  regionName?: string;
};

function statusBadgeClass(status: DriverStatus | OnboardingStatus | string): string {
  switch (status) {
    case 'PENDING_APPROVAL':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'ACTIVE':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'SUSPENDED':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'INACTIVE':
      return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    case 'DRAFT':
      return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    case 'SUBMITTED':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'UNDER_REVIEW':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'DOCS_PENDING':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'APPROVED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'REJECTED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-zinc-100 text-zinc-600 border-zinc-200';
  }
}

function Badge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${colorClass}`}
    >
      {label.replace(/_/g, ' ')}
    </span>
  );
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-xs font-medium text-ink">{value}</span>
    </div>
  );
}

export function DriverHeaderCard({ data, regionName }: DriverHeaderCardProps) {
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');
  const initials = [data.first_name?.[0], data.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?';

  const onboarding = data.onboarding;

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <span className="text-xl font-bold text-accent">{initials}</span>
          </div>
        </div>

        {/* Identity + badges */}
        <div className="flex-1 space-y-2">
          <h2 className="text-xl font-semibold text-ink">{fullName}</h2>
          <p className="text-sm text-muted">{data.phone_number}</p>

          <div className="flex flex-wrap gap-2 pt-1">
            {onboarding && (
              <Badge
                label={onboarding.status}
                colorClass={statusBadgeClass(onboarding.status)}
              />
            )}
            <Badge label={data.status} colorClass={statusBadgeClass(data.status)} />
            {data.is_approved ? (
              <Badge
                label="Approved"
                colorClass="bg-emerald-50 text-emerald-700 border-emerald-200"
              />
            ) : (
              <Badge
                label="Not Approved"
                colorClass="bg-zinc-100 text-zinc-600 border-zinc-200"
              />
            )}
            {data.is_online && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Online
              </span>
            )}
          </div>
        </div>

        {/* Right column: stats */}
        <div className="flex-shrink-0 space-y-1.5 text-right">
          {data.rating_avg !== null && (
            <div>
              <span className="text-xs text-muted">Rating</span>
              <p className="text-sm font-semibold text-ink">
                {data.rating_avg.toFixed(1)} / 5.0
              </p>
            </div>
          )}
          <div>
            <span className="text-xs text-muted">Total Rides</span>
            <p className="text-sm font-semibold text-ink">{data.total_rides_completed}</p>
          </div>
          {(regionName ?? data.region_id) && (
            <div>
              <span className="text-xs text-muted">Region</span>
              <p className="text-sm font-semibold text-ink">{regionName ?? data.region_id}</p>
            </div>
          )}
          <div>
            <span className="text-xs text-muted">Member Since</span>
            <p className="text-sm font-medium text-ink">{fmtDateShort(data.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Onboarding timeline */}
      {onboarding && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Onboarding Timeline
          </p>
          <div className="flex flex-wrap gap-6">
            <TimelineItem label="Submitted" value={fmtDate(onboarding.submitted_at)} />
            <TimelineItem
              label="Review Started"
              value={fmtDate(onboarding.review_started_at)}
            />
            <TimelineItem label="Reviewed" value={fmtDate(onboarding.reviewed_at)} />
          </div>
        </div>
      )}
    </div>
  );
}
