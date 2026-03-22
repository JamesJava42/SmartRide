import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type { AdminUser } from "../types/api";

const items = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/live-rides", label: "Live Rides" },
  { to: "/admin/drivers", label: "Drivers" },
  { to: "/admin/onboarding", label: "Onboarding" },
  { to: "/admin/regions", label: "Regions" },
  { to: "/admin/audit-logs", label: "Audit Logs" },
  { to: "/admin/alerts", label: "Alerts" },
];

export function AdminShell({
  children,
  admin,
  onLogout,
}: {
  children: ReactNode;
  admin: AdminUser | null;
  onLogout: () => void;
}) {
  const navigate = useNavigate();

  function handleLogout() {
    onLogout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-[#f4f2ed] text-ink">
      <aside className="hidden w-72 shrink-0 border-r border-[#e6e0d6] bg-[#fbfaf7] xl:flex xl:flex-col">
        <div className="border-b border-[#e6e0d6] px-6 py-7">
          <div className="text-[2rem] font-extrabold tracking-tight">RideConnect <span className="text-lg font-medium text-muted">Admin</span></div>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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
          <div className="text-sm font-semibold">{admin?.name}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">{admin?.role.replaceAll("_", " ")}</div>
          <button type="button" onClick={handleLogout} className="mt-4 w-full rounded-2xl border border-line px-4 py-3 text-sm font-semibold">
            Logout
          </button>
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-[#e6e0d6] bg-white px-5 py-4 xl:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="hidden max-w-md flex-1 items-center gap-3 xl:flex">
              <input
                placeholder="Search rides, drivers, onboarding..."
                className="w-full rounded-2xl border border-[#e6e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none"
              />
              <select className="rounded-2xl border border-[#e6e0d6] bg-[#fbfaf7] px-4 py-3 text-sm font-medium outline-none">
                <option>{admin?.regions[0]?.name ?? "All Regions"}</option>
                {admin?.regions.slice(1).map((region) => (
                  <option key={region.id}>{region.name}</option>
                ))}
              </select>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e6e0d6] text-lg">
                ◌
              </button>
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e6e0d6] text-lg">
                ⌁
              </button>
              <div className="rounded-full bg-[#edf6ef] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                {admin?.regions.length ? `${admin.regions.length} region scope` : "All regions"}
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
