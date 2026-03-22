import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getStoredToken } from "../api/auth";

export function ProtectedRoute() {
  const location = useLocation();

  if (!getStoredToken()) {
    return <Navigate replace to="/login" state={{ from: location }} />;
  }

  return <Outlet />;
}
