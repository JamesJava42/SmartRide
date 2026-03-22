import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAdminSession } from "./hooks/useAdminSession";
import { useAuthSession } from "./hooks/useAuthSession";
import { AppShell } from "./layouts/AppShell";
import { DriverShell } from "./layouts/DriverShell";
import { ActivityPage } from "./pages/ActivityPage";
import { BookRidePage } from "./pages/BookRidePage";
import { DriverDashboardPage } from "./pages/DriverDashboardPage";
import { DriverLoginPage } from "./pages/DriverLoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RideTrackingPage } from "./pages/RideTrackingPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";

const AdminShell = lazy(() => import("./layouts/AdminShell").then((module) => ({ default: module.AdminShell })));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage").then((module) => ({ default: module.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage").then((module) => ({ default: module.AdminDashboardPage })));
const AdminLiveRidesPage = lazy(() => import("./pages/AdminLiveRidesPage").then((module) => ({ default: module.AdminLiveRidesPage })));
const AdminRideDetailPage = lazy(() => import("./pages/AdminRideDetailPage").then((module) => ({ default: module.AdminRideDetailPage })));
const AdminDriversPage = lazy(() => import("./pages/AdminDriversPage").then((module) => ({ default: module.AdminDriversPage })));
const AdminDriverDetailPage = lazy(() => import("./pages/AdminDriverDetailPage").then((module) => ({ default: module.AdminDriverDetailPage })));
const AdminOnboardingQueuePage = lazy(
  () => import("./pages/AdminOnboardingQueuePage").then((module) => ({ default: module.AdminOnboardingQueuePage })),
);
const AdminOnboardingReviewPage = lazy(
  () => import("./pages/AdminOnboardingReviewPage").then((module) => ({ default: module.AdminOnboardingReviewPage })),
);
const AdminRegionsPage = lazy(() => import("./pages/AdminRegionsPage").then((module) => ({ default: module.AdminRegionsPage })));
const AdminRegionDetailPage = lazy(
  () => import("./pages/AdminRegionDetailPage").then((module) => ({ default: module.AdminRegionDetailPage })),
);
const AdminAuditLogsPage = lazy(() => import("./pages/AdminAuditLogsPage").then((module) => ({ default: module.AdminAuditLogsPage })));
const AdminAlertsPage = lazy(() => import("./pages/AdminAlertsPage").then((module) => ({ default: module.AdminAlertsPage })));

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm font-semibold text-muted">
      Loading...
    </div>
  );
}

function App() {
  const auth = useAuthSession();
  const adminAuth = useAdminSession();

  if (auth.isLoading || adminAuth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4 text-sm font-semibold text-muted">
        Loading RideConnect...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/admin/login"
        element={
          adminAuth.isSignedIn ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Suspense fallback={<RouteLoadingFallback />}>
              <AdminLoginPage auth={adminAuth} />
            </Suspense>
          )
        }
      />
      <Route
        path="/admin/*"
        element={
          adminAuth.isSignedIn ? (
            <Suspense fallback={<RouteLoadingFallback />}>
              <AdminShell admin={adminAuth.admin} onLogout={adminAuth.signOut}>
                <Routes>
                  <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/live-rides" element={<AdminLiveRidesPage />} />
                  <Route path="/live-rides/:rideId" element={<AdminRideDetailPage />} />
                  <Route path="/drivers" element={<AdminDriversPage />} />
                  <Route path="/drivers/:driverId" element={<AdminDriverDetailPage />} />
                  <Route path="/onboarding" element={<AdminOnboardingQueuePage />} />
                  <Route path="/onboarding/:driverId" element={<AdminOnboardingReviewPage />} />
                  <Route path="/regions" element={<AdminRegionsPage />} />
                  <Route path="/regions/:regionId" element={<AdminRegionDetailPage />} />
                  <Route path="/audit-logs" element={<AdminAuditLogsPage />} />
                  <Route path="/alerts" element={<AdminAlertsPage />} />
                </Routes>
              </AdminShell>
            </Suspense>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="/driver/login"
        element={
          auth.isSignedIn ? (
            auth.user?.role === "driver" ? <Navigate to="/driver" replace /> : <Navigate to="/book-ride" replace />
          ) : (
            <DriverLoginPage auth={auth} />
          )
        }
      />
      <Route
        path="/driver/*"
        element={
          auth.isSignedIn ? (
            auth.user?.role === "driver" ? (
              <DriverShell onLogout={auth.signOut} user={auth.user}>
                <Routes>
                  <Route path="/" element={<DriverDashboardPage user={auth.user} />} />
                </Routes>
              </DriverShell>
            ) : (
              <Navigate to="/book-ride" replace />
            )
          ) : (
            <Navigate to="/driver/login" replace />
          )
        }
      />
      <Route
        path="/sign-in"
        element={
          auth.isSignedIn ? (
            auth.user?.role === "driver" ? <Navigate to="/driver" replace /> : <Navigate to="/book-ride" replace />
          ) : (
            <SignInPage auth={auth} />
          )
        }
      />
      <Route path="/sign-up" element={auth.isSignedIn ? <Navigate to="/book-ride" replace /> : <SignUpPage auth={auth} />} />
      <Route
        path="/*"
        element={
          auth.isSignedIn ? (
            auth.user?.role === "driver" ? (
              <Navigate to="/driver" replace />
            ) : (
              <AppShell onLogout={auth.signOut} user={auth.user}>
                <Routes>
                  <Route path="/" element={<Navigate to="/book-ride" replace />} />
                  <Route path="/book-ride" element={<BookRidePage />} />
                  <Route path="/tracking/:rideId" element={<RideTrackingPage />} />
                  <Route path="/activity" element={<ActivityPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Routes>
              </AppShell>
            )
          ) : (
            <Navigate to="/sign-in" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
