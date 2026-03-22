import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthGuard } from '../components/AuthGuard';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DriverReviewPage } from '../pages/DriverReviewPage';
import { LiveRidesPage } from '../pages/LiveRidesPage';
import { DriversPage } from '../pages/DriversPage';
import DriverDetailPage from '../pages/DriverDetailPage';
import { RegionsPage } from '../pages/RegionsPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { AlertsPage } from '../pages/AlertsPage';

function Protected({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}

function LegacyOnboardingDriverRedirect() {
  const { driverId } = useParams<{ driverId: string }>();
  return <Navigate to={driverId ? `/kyc/${driverId}` : "/kyc"} replace />;
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    element: <Protected><AdminLayout /></Protected>,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/alerts', element: <AlertsPage /> },
      { path: '/live-rides', element: <LiveRidesPage /> },
      { path: '/drivers', element: <DriversPage /> },
      { path: '/drivers/:driverId', element: <DriverDetailPage /> },
      { path: '/onboarding', element: <Navigate to="/kyc" replace /> },
      { path: '/onboarding/:driverId', element: <LegacyOnboardingDriverRedirect /> },
      { path: '/kyc', element: <OnboardingPage /> },
      { path: '/kyc/:driverId', element: <DriverReviewPage /> },
      { path: '/regions', element: <RegionsPage /> },
      { path: '/audit-logs', element: <AuditLogsPage /> },
      { path: '*', element: <Navigate to="/kyc" replace /> },
    ],
  },
]);
