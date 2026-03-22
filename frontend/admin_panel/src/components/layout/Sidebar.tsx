import { NavLink } from "react-router-dom";

const items = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/live-rides", label: "Live Rides" },
  { to: "/drivers", label: "Drivers" },
  { to: "/onboarding", label: "Onboarding" },
  { to: "/regions", label: "Regions" },
  { to: "/audit-logs", label: "Audit Logs" },
];

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-[#e6e0d6] bg-[#fbfaf7] xl:flex xl:flex-col">
      <div className="border-b border-[#e6e0d6] px-6 py-7">
        <div className="text-[2rem] font-extrabold tracking-tight text-ink">
          RideConnect <span className="text-lg font-medium text-muted">Admin</span>
        </div>
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
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
