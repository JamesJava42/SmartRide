import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getDriverProfile } from "../../api/driverDashboard";
import { DriverLayout } from "../../components/layout/DriverLayout";

export default function DriverOnboardingPendingPage() {
  const profileQuery = useQuery({
    queryKey: ["driver-profile"],
    queryFn: getDriverProfile,
  });

  if (profileQuery.isLoading) {
    return (
      <DriverLayout>
        <div className="mx-auto max-w-2xl rounded-3xl border border-line bg-white px-6 py-8 text-center shadow-sm">
          Checking driver approval status...
        </div>
      </DriverLayout>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <DriverLayout>
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-white px-6 py-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-ink">Unable to load driver status.</h1>
          <p className="mt-2 text-sm text-muted">Please retry before accessing driver operations.</p>
          <button
            type="button"
            onClick={() => void profileQuery.refetch()}
            className="mt-5 rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#f7f5ef]"
          >
            Refresh status
          </button>
        </div>
      </DriverLayout>
    );
  }

  const profile = profileQuery.data;

  return (
    <DriverLayout>
      <div className="mx-auto max-w-2xl rounded-3xl border border-line bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Driver onboarding</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Approval pending</h1>
        <p className="mt-3 text-sm text-muted">
          Your account is signed in, but driver operations unlock only after approval. Once your marketplace
          profile is approved, dashboard access will open automatically.
        </p>

        <div className="mt-6 rounded-2xl border border-line bg-canvas px-4 py-4 text-sm text-ink">
          <div className="flex items-center justify-between gap-3">
            <span>Driver</span>
            <strong>{profile.full_name}</strong>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span>Email</span>
            <strong>{profile.email}</strong>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span>Approval status</span>
            <strong>{profile.is_approved ? "Approved" : "Pending review"}</strong>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {profile.is_approved ? (
            <Link
              to="/dashboard"
              className="rounded-2xl bg-[#1A6B45] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#155c3a]"
            >
              Go to dashboard
            </Link>
          ) : null}
          <Link
            to="/profile?tab=documents"
            className="rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#f7f5ef]"
          >
            Open profile & documents
          </Link>
          <button
            type="button"
            onClick={() => void profileQuery.refetch()}
            className="rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#f7f5ef]"
          >
            Refresh status
          </button>
        </div>
      </div>
    </DriverLayout>
  );
}
