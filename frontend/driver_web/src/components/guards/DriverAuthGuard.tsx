import { Navigate, Outlet } from "react-router-dom";

import { isDriverTokenValid } from "../../api/driverAuth";

export function DriverAuthGuard() {
  if (!isDriverTokenValid()) {
    return <Navigate replace to="/driver/login" />;
  }

  return <Outlet />;
}
