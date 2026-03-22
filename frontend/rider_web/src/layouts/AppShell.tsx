import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import type { AuthUser } from "../types/api";

export function AppShell({
  children,
  onLogout,
  user,
}: {
  children: ReactNode;
  onLogout: () => void;
  user: AuthUser | null;
}) {
  const location = useLocation();
  const isDashboardHome = location.pathname === "/dashboard";
  const isSearchResults = location.pathname === "/search-results";
  const isFullBleedPage = isDashboardHome || isSearchResults;

  return (
    <div className={`flex min-h-screen flex-col ${isFullBleedPage ? "bg-white" : "bg-canvas"} text-ink`}>
      {isSearchResults ? null : <Header onLogout={onLogout} user={user} fullBleed={isFullBleedPage} />}
      <main className={isFullBleedPage ? "w-full flex-1 p-0" : "mx-auto w-full max-w-[1220px] flex-1 px-4 py-4 sm:px-6 lg:px-8"}>{children}</main>
      {isSearchResults ? null : <Footer flush={isFullBleedPage} />}
    </div>
  );
}
