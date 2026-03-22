import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useDriverSession } from "../hooks/useDriverSession";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = useDriverSession();

  if (auth.isLoading) {
    return <div className="min-h-screen bg-canvas p-6 text-sm text-muted">Loading driver workspace...</div>;
  }

  if (!auth.isSignedIn) {
    return <Navigate replace to="/driver/login" />;
  }

  return <>{children}</>;
}
