import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useRiderSession } from "../hooks/useRiderSession";
import { AppShell } from "../layouts/AppShell";

function isStoredTokenExpired() {
  const token = window.localStorage.getItem("rc_rider_token");
  if (!token) {
    return true;
  }
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;
    const decoded = JSON.parse(window.atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (!decoded?.exp) return false;
    return decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  return <ProtectedRouteWithShell shell>{children}</ProtectedRouteWithShell>;
}

export function ProtectedRouteWithShell({ children, shell = true }: { children: ReactNode; shell?: boolean }) {
  const auth = useRiderSession();

  if (auth.isLoading) {
    return <div className="min-h-screen bg-canvas p-6 text-sm text-muted">Loading RideConnect...</div>;
  }

  if (!auth.isSignedIn || isStoredTokenExpired()) {
    window.localStorage.removeItem("rc_rider_token");
    window.localStorage.removeItem("rideconnect_access_token");
    window.localStorage.removeItem("rideconnect_auth_user");
    return <Navigate replace to="/login" />;
  }

  if (!shell) {
    return <>{children}</>;
  }

  return <AppShell onLogout={auth.signOut} user={auth.user}>{children}</AppShell>;
}
