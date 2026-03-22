import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Home" },
  { to: "/onboarding-pending", label: "Approval" },
  { to: "/ride-history", label: "Rides" },
  { to: "/earnings", label: "Earnings" },
  { to: "/profile", label: "Profile" },
];

export function DriverMobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-3 py-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-5 gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `rounded-2xl px-3 py-2 text-center text-xs font-semibold ${isActive ? "bg-canvas text-ink" : "text-muted"}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
