import { Link } from "react-router-dom";

import { DriverLayout } from "../../components/layout/DriverLayout";
import { KycStatusBadge } from "../../components/kyc/KycStatusBadge";
import { useKycStatus } from "../../hooks/useKycStatus";

function getReviewText(status: string) {
  if (status === "approved") {
    return "Your driver account is approved. You can continue into the operational app.";
  }
  if (status === "submitted" || status === "under_review") {
    return "Your onboarding is being reviewed. Check back after an admin approves your account.";
  }
  return "Your onboarding has not been approved yet. An admin review is required before you can drive.";
}

export function DriverKycReviewPendingPage() {
  const kycQuery = useKycStatus();

  return (
    <DriverLayout>
      <div className="space-y-5">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Onboarding</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">Review status</h2>
          <p className="mt-2 text-sm text-muted">
            This screen stays safe even when document-upload KYC APIs are not available yet.
          </p>
        </section>

        {kycQuery.isLoading ? (
          <div className="rounded-3xl border border-line bg-white px-5 py-4 text-sm text-muted">
            Refreshing driver review status...
          </div>
        ) : null}

        {kycQuery.isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {kycQuery.error instanceof Error ? kycQuery.error.message : "Unable to load review status."}
          </div>
        ) : null}

        {kycQuery.data ? (
          <section className="rounded-3xl border border-line bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-semibold text-ink">Current driver status</h3>
              <KycStatusBadge status={kycQuery.data.overallStatus} />
            </div>
            <p className="mt-3 text-sm text-muted">{getReviewText(kycQuery.data.overallStatus)}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {kycQuery.data.overallStatus === "approved" ? (
                <Link
                  to="/dashboard"
                  className="rounded-2xl bg-[#1A6B45] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#155c3a]"
                >
                  Continue to dashboard
                </Link>
              ) : null}
              <Link
                to="/kyc/status"
                className="rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#f7f5ef]"
              >
                Back to status page
              </Link>
              <button
                type="button"
                className="rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#f7f5ef]"
                onClick={() => void kycQuery.refetch()}
              >
                Refresh status
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </DriverLayout>
  );
}
