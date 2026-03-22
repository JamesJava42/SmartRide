import type { ReactNode } from "react";
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
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <Header onLogout={onLogout} user={user} />
      <main className="mx-auto w-full max-w-[1220px] flex-1 px-4 py-4 sm:px-6 lg:px-8">{children}</main>
      <Footer />
    </div>
  );
}
