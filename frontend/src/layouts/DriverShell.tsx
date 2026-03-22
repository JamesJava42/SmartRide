import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import type { AuthUser } from "../types/api";

const navItems = [{ to: "/driver", label: "Dashboard" }];

export function DriverShell({
  children,
  onLogout,
  user,
}: {
  children: ReactNode;
  onLogout: () => void;
  user: AuthUser | null;
}) {
  const navigate = useNavigate();

  function handleLogout() {
    onLogout();
    navigate("/driver/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-[#f4f2ed] text-ink">
      <aside className="hidden w-72 shrink-0 border-r border-[#e6e0d6] bg-[#fbfaf7] xl:flex xl:flex-col">
        <div className="border-b border-[#e6e0d6] px-6 py-7">
          <div className="text-[2rem] font-extrabold tracking-tight">RideConnect <span className="text-lg font-medium text-muted">Driver</span></div>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive ? "bg-white text-ink shadow-[0_10px_20px_rgba(15,23,18,0.05)]" : "text-muted hover:bg-white hover:text-ink"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-[#e6e0d6] px-6 py-5">
          <div className="text-sm font-semibold">{user?.full_name}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">Driver account</div>
          <button type="button" onClick={handleLogout} className="mt-4 w-full rounded-2xl border border-line px-4 py-3 text-sm font-semibold">
            Logout
          </button>
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-[#e6e0d6] bg-white px-5 py-4 xl:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link to="/driver" className="text-2xl font-extrabold tracking-tight text-ink xl:hidden">
              RideConnect Driver
            </Link>
            <div className="ml-auto flex items-center gap-3">
              <div className="rounded-full bg-[#edf6ef] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Driver online tools
              </div>
              <button type="button" onClick={handleLogout} className="rounded-full border border-[#d8d1c7] px-5 py-2 text-sm font-semibold">
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 px-5 py-5 xl:px-8">{children}</main>
      </div>
    </div>
  );
}
