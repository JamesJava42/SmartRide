import { useParams } from "react-router-dom";
import { PageTitle } from "../../components/common/PageTitle";
import { SectionCard } from "../../components/common/SectionCard";
import { StatusBadge } from "../../components/common/StatusBadge";
import { KycAuditTimeline } from "../../components/kyc/KycAuditTimeline";
import { KycDecisionPanel } from "../../components/kyc/KycDecisionPanel";
import { KycDocumentReviewCard } from "../../components/kyc/KycDocumentReviewCard";
import { useKycDecision } from "../../hooks/useKycDecision";
import { useKycDetail } from "../../hooks/useKycDetail";

function formatDate(value?: string) {
  if (!value) {
    return "Not available";
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
}

export default function KycDriverDetailPage() {
  const { driverUserId } = useParams<{ driverUserId: string }>();
  const { data, isLoading, isError, error } = useKycDetail(driverUserId);
  const { approve, reject, requestMoreInfo, isActing } = useKycDecision(driverUserId);

  return (
    <section className="space-y-8">
      <PageTitle
        title="Driver KYC Detail"
        subtitle="Inspect document status, reasons, and take a review action through the admin workflow."
      />

      {isLoading ? (
        <div className="rounded-3xl border border-sand-200 bg-white px-6 py-10 text-sm text-muted shadow-sm">
          Loading driver KYC detail...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700">
          {error instanceof Error ? error.message : "Unable to load the driver KYC detail."}
        </div>
      ) : null}

      {data ? (
        <>
          <SectionCard title="Driver summary">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Driver</div>
                <div className="mt-2 text-lg font-semibold text-ink">
                  {data.driverName ?? data.driverUserId}
                </div>
                <div className="text-sm text-muted">{data.driverEmail ?? "Email unavailable"}</div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted">Overall status</span>
                  <StatusBadge status={data.overallStatus} label={formatStatus(data.overallStatus)} />
                </div>
                <div className="text-sm text-muted">Submitted at: {formatDate(data.submittedAt)}</div>
                <div className="text-sm text-muted">Last reviewed: {formatDate(data.lastReviewedAt)}</div>
              </div>
            </div>
          </SectionCard>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              {data.documents.map((document) => (
                <KycDocumentReviewCard
                  key={document.documentType}
                  document={document}
                />
              ))}
              <SectionCard title="Audit timeline">
                <KycAuditTimeline />
              </SectionCard>
            </div>

            <div className="space-y-6">
              <KycDecisionPanel
                onApprove={approve}
                onReject={(reason, notes) => reject({ reason, notes })}
                onRequestMoreInfo={(reason, notes) => requestMoreInfo({ reason, notes })}
                isActing={isActing}
              />
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
