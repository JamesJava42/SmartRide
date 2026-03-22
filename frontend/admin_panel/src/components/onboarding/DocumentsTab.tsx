import type { DriverReviewData } from '../../types/onboarding';
import { REQUIRED_DOC_TYPES, getDocumentsMap } from '../../utils/onboarding';
import { DocumentsReviewTab } from './tabs/DocumentsReviewTab';

type Props = { data: DriverReviewData; onRefresh: () => void };

export function DocumentsTab({ data, onRefresh }: Props) {
  const docMap = getDocumentsMap(data.documents);

  const approved = data.documents.filter((d) => d.verification_status === 'APPROVED').length;
  const submitted = data.documents.length;
  const total = REQUIRED_DOC_TYPES.length;

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="rounded-2xl border border-line bg-white px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Document Progress</p>
            <p className="mt-1 text-sm text-ink">
              <span className="font-bold text-emerald-700">{approved}</span>
              <span className="text-muted"> of </span>
              <span className="font-bold">{total}</span>
              {' '}required documents approved
            </p>
          </div>
          <div className="text-right text-xs text-muted space-y-0.5">
            <p>{submitted} of {total} submitted</p>
            <p>{approved} approved · {submitted - approved} pending</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${total > 0 ? (approved / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* All documents review layout */}
      <DocumentsReviewTab
        docTypes={REQUIRED_DOC_TYPES}
        docMap={docMap}
        onRefresh={onRefresh}
      />
    </div>
  );
}
