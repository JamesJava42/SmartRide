import type { DriverReviewData, DocumentType } from '../../types/onboarding';
import { DOC_LABELS, REQUIRED_DOC_TYPES, getDocumentsMap, getApprovalReadiness, fmtDate, fmtDateShort } from '../../utils/onboarding';
import { OnboardingStepper } from './OnboardingStepper';
import { StatusBadge } from '../common/StatusBadge';

type Props = { data: DriverReviewData; regionName?: string };

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value || '—'}</p>
    </div>
  );
}

export function SummaryTab({ data, regionName }: Props) {
  const { canApprove, reason } = getApprovalReadiness(data);
  const docMap = getDocumentsMap(data.documents);
  const onboarding = data.onboarding;

  return (
    <div className="space-y-6">

      {/* 1. Lifecycle stepper */}
      {onboarding && (
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Application Progress</p>
          <OnboardingStepper status={onboarding.status} />
        </div>
      )}

      {/* 2. Approval readiness banner */}
      {canApprove ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-semibold text-emerald-700">Ready for approval</span>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 flex items-start gap-2">
          <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
          <span className="text-sm text-amber-800">{reason}</span>
        </div>
      )}

      {/* 3. Review snapshot */}
      {onboarding && (
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Review Snapshot</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Onboarding Status" value={<StatusBadge status={onboarding.status} />} />
            <Field label="Submitted" value={fmtDate(onboarding.submitted_at)} />
            <Field label="Review Started" value={fmtDate(onboarding.review_started_at)} />
            <Field label="Reviewed" value={fmtDate(onboarding.reviewed_at)} />
            {onboarding.reviewed_by_admin_id && (
              <Field label="Reviewed By" value={`Admin ${onboarding.reviewed_by_admin_id.slice(0, 8)}`} />
            )}
            {onboarding.review_notes && (
              <div className="col-span-full">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Review Notes</p>
                <p className="mt-1 text-sm text-ink">{onboarding.review_notes}</p>
              </div>
            )}
            {onboarding.rejection_reason && (
              <div className="col-span-full rounded-xl bg-red-50 px-4 py-3">
                <p className="text-xs font-semibold text-red-700">Rejection Reason</p>
                <p className="mt-0.5 text-sm text-red-700">{onboarding.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Required documents checklist */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-line">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Required Documents</p>
        </div>
        <div className="divide-y divide-line">
          {REQUIRED_DOC_TYPES.map((type) => {
            const doc = docMap[type];
            return (
              <div key={type} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-ink">{DOC_LABELS[type]}</span>
                <div className="flex items-center gap-3">
                  {doc ? (
                    <>
                      <StatusBadge status={doc.verification_status} />
                      {doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">
                          View ↗
                        </a>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-muted">Not submitted</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Vehicle readiness */}
      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Vehicle</p>
        {data.vehicle ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">
                {data.vehicle.year} {data.vehicle.make} {data.vehicle.model}
                {data.vehicle.color && ` · ${data.vehicle.color}`}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {data.vehicle.plate_number} · {data.vehicle.vehicle_type} · {data.vehicle.seat_capacity} seats
              </p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              Active
            </span>
          </div>
        ) : (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-700">No active vehicle on file</p>
            <p className="mt-0.5 text-xs text-red-600">Driver cannot be approved without a vehicle.</p>
          </div>
        )}
      </div>
    </div>
  );
}
