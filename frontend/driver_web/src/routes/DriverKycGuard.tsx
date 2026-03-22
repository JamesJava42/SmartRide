import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getDriverProfile } from "../api/driverDashboard";

export function DriverKycGuard() {
  const profileQuery = useQuery({
    queryKey: ["driver-approval-guard-profile"],
    queryFn: getDriverProfile,
    retry: false,
  });

  if (profileQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
        <div className="rounded-3xl border border-line bg-white px-6 py-5 text-center shadow-sm">
          <p className="text-sm font-semibold text-ink">Checking driver verification status...</p>
        </div>
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white px-6 py-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-ink">Unable to verify driver status right now.</h1>
          <p className="mt-2 text-sm text-muted">
            Please retry before accessing driver operations.
          </p>
          <button
            type="button"
            onClick={() => void profileQuery.refetch()}
            className="mt-5 rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#f7f5ef]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log("GUARD CHECK:", {
    isAuthenticated: true,
    isApproved: profileQuery.data.is_approved,
  });

  if (profileQuery.data.is_approved) {
    return <Outlet />;
  }

  return <Navigate replace to="/onboarding-pending" />;
}
