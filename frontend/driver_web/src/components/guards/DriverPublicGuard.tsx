import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { isDriverTokenValid } from "../../api/driverAuth";
import { getDriverProfile } from "../../api/driverDashboard";

export function DriverPublicGuard() {
  const tokenValid = isDriverTokenValid();
  const profileQuery = useQuery({
    queryKey: ["driver-public-guard-profile"],
    queryFn: getDriverProfile,
    enabled: tokenValid,
    retry: false,
  });

  if (!tokenValid) {
    console.log("GUARD CHECK:", {
      isAuthenticated: false,
      isApproved: false,
    });
    return <Outlet />;
  }

  if (profileQuery.isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px 24px" }}>
          Checking your driver session...
        </div>
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    console.log("GUARD CHECK:", {
      isAuthenticated: true,
      isApproved: false,
    });
    return <Navigate replace to="/onboarding-pending" />;
  }

  console.log("GUARD CHECK:", {
    isAuthenticated: true,
    isApproved: profileQuery.data.is_approved,
  });
  return <Navigate replace to={profileQuery.data.is_approved ? "/dashboard" : "/onboarding-pending"} />;
}
