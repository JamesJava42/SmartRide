import { Link } from "react-router-dom";

import { DriverLayout } from "../../components/layout/DriverLayout";
import { KycStatusBadge } from "../../components/kyc/KycStatusBadge";
import { useKycStatus } from "../../hooks/useKycStatus";

function getStatusMessage(status: string) {
  switch (status) {
    case "approved":
      return "Your driver account is approved. You can continue to the dashboard.";
    case "submitted":
    case "under_review":
      return "Your onboarding details are under review. You will be able to drive once approval is complete.";
    case "rejected":
      return "Your onboarding was rejected. An admin will need to review and update your status before you can drive.";
    case "needs_more_info":
      return "More information is required. Please contact support or an admin to continue onboarding.";
    case "expired":
    case "suspended":
      return "Your driver account needs an admin review before access can be restored.";
    default:
      return "Your driver onboarding is still pending. Once approved, operational pages will unlock automatically.";
  }
}

export function DriverKycStatusPage() {
  const kycQuery = useKycStatus();

  return (
    <DriverLayout>
      <div className="space-y-5">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Onboarding</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-semibold text-ink">Driver status</h2>
            {kycQuery.data ? <KycStatusBadge status={kycQuery.data.overallStatus} /> : null}
          </div>
          <p className="mt-2 text-sm text-muted">
            Driver access is currently determined by your approved marketplace profile.
          </p>
        </section>

        {kycQuery.isLoading ? (
          <div className="rounded-3xl border border-line bg-white px-5 py-4 text-sm text-muted">
            Checking driver approval status...
          </div>
        ) : null}

        {kycQuery.isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {kycQuery.error instanceof Error ? kycQuery.error.message : "Unable to load driver status."}
          </div>
        ) : null}

        {kycQuery.data ? (
          <section className="rounded-3xl border border-line bg-white p-6 shadow-sm">
            <p className="text-sm text-muted">{getStatusMessage(kycQuery.data.overallStatus)}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {kycQuery.data.overallStatus === "approved" ? (
                <Link
                  to="/dashboard"
                  className="rounded-2xl bg-[#1A6B45] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#155c3a]"
                >
                  Go to dashboard
                </Link>
              ) : (
                <Link
                  to="/kyc/review-pending"
                  className="rounded-2xl bg-[#1A6B45] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#155c3a]"
                >
                  View review status
                </Link>
              )}
              <button
                type="button"
                onClick={() => void kycQuery.refetch()}
                className="rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#f7f5ef]"
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
