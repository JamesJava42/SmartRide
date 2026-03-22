import { createBrowserRouter, Navigate } from "react-router-dom";

import { ActivityPage } from "../pages/ActivityPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { ProfilePage } from "../pages/ProfilePage";
import { RideHistoryPage } from "../pages/RideHistoryPage";
import { RideTrackingPage } from "../pages/RideTrackingPage";
import { PaymentPage } from "../pages/PaymentPage";
import { RideSummaryPage } from "../pages/RideSummaryPage";
import { RideCompletePage } from "../pages/RideCompletePage";
import { ProtectedRoute, ProtectedRouteWithShell } from "./ProtectedRoute";

const APP_TITLE = "RideConnect Rider";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRouteWithShell shell={false}>
        <HomePage />
      </ProtectedRouteWithShell>
    ),
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <LoginPage initialFace="register" /> },
  { path: "/home", element: <Navigate replace to="/" /> },
  { path: "/dashboard", element: <Navigate replace to="/" /> },
  {
    path: "/activity",
    element: (
      <ProtectedRoute>
        <ActivityPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ride-history",
    element: (
      <ProtectedRoute>
        <RideHistoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment",
    element: (
      <ProtectedRouteWithShell shell={false}>
        <PaymentPage />
      </ProtectedRouteWithShell>
    ),
  },
  {
    path: "/ride/summary",
    element: (
      <ProtectedRouteWithShell shell={false}>
        <RideSummaryPage />
      </ProtectedRouteWithShell>
    ),
  },
  {
    path: "/ride/tracking/:rideId",
    element: (
      <ProtectedRouteWithShell shell={false}>
        <RideTrackingPage />
      </ProtectedRouteWithShell>
    ),
  },
  {
    path: "/ride/complete/:rideId",
    element: (
      <ProtectedRouteWithShell shell={false}>
        <RideCompletePage />
      </ProtectedRouteWithShell>
    ),
  },
]);
