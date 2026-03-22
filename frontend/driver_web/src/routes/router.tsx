import { Suspense, lazy, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { DriverAuthGuard } from "../components/guards/DriverAuthGuard";
import { DriverPublicGuard } from "../components/guards/DriverPublicGuard";
import DriverVerifyEmailPage from "../pages/auth/DriverVerifyEmailPage";
import DriverVerifyPhonePage from "../pages/auth/DriverVerifyPhonePage";
import DriverDashboardPage from "../pages/dashboard/DriverDashboardPage";
import DriverOnboardingPendingPage from "../pages/onboarding/DriverOnboardingPendingPage";
import DriverOfferDetailPage from "../pages/offers/DriverOfferDetailPage";
import DriverOfferInboxPage from "../pages/offers/DriverOfferInboxPage";
import { ProfilePage as DriverProfilePage } from "../pages/ProfilePage";
import DriverActiveRidePage from "../pages/rides/DriverActiveRidePage";
import DriverRideHistoryPage from "../pages/rides/DriverRideHistoryPage";
import { DriverKycGuard } from "./DriverKycGuard";

const DriverWelcomePage = lazy(() => import("../pages/auth/DriverWelcomePage"));
const DriverAuthPage = lazy(() => import("../pages/auth/DriverAuthPage"));

function LazyPage({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)", color: "var(--text-secondary)" }}>
          Loading...
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <DriverPublicGuard />,
    children: [
      { path: "/", element: <Navigate replace to="/driver/welcome" /> },
      { path: "/login", element: <Navigate replace to="/driver/login" /> },
      {
        path: "/driver/welcome",
        element: (
          <LazyPage>
            <DriverWelcomePage />
          </LazyPage>
        ),
      },
      {
        path: "/driver/register",
        element: (
          <LazyPage>
            <DriverAuthPage initialFace="register" />
          </LazyPage>
        ),
      },
      {
        path: "/driver/login",
        element: (
          <LazyPage>
            <DriverAuthPage initialFace="login" />
          </LazyPage>
        ),
      },
    ],
  },
  {
    element: <DriverAuthGuard />,
    children: [
      { path: "/driver/verify-email", element: <DriverVerifyEmailPage /> },
      { path: "/driver/verify-phone", element: <DriverVerifyPhonePage /> },
      { path: "/onboarding-pending", element: <DriverOnboardingPendingPage /> },
      { path: "/profile", element: <DriverProfilePage /> },
      { path: "/kyc/status", element: <Navigate replace to="/profile?tab=documents" /> },
      { path: "/kyc/review-pending", element: <Navigate replace to="/onboarding-pending" /> },
      {
        element: <DriverKycGuard />,
        children: [
          { path: "/dashboard", element: <DriverDashboardPage /> },
          { path: "/offers", element: <DriverOfferInboxPage /> },
          { path: "/offers/:rideId", element: <DriverOfferDetailPage /> },
          { path: "/rides/active", element: <DriverActiveRidePage /> },
          { path: "/ride-history", element: <DriverRideHistoryPage /> },
        ],
      },
    ],
  },
  { path: "/onboarding", element: <Navigate replace to="/onboarding-pending" /> },
  { path: "*", element: <Navigate replace to="/driver/welcome" /> },
]);
