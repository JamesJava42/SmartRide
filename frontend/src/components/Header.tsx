import { Link, NavLink, useNavigate } from "react-router-dom";
import type { AuthUser } from "../types/api";

const navItems = [
  { to: "/book-ride", label: "Trips" },
  { to: "/book-ride", label: "Reserve" },
  { to: "/book-ride", label: "Courier" },
  { to: "/book-ride", label: "Hourly" },
  { to: "/activity", label: "Activity" },
  { to: "/profile", label: "Profile" },
];

export function Header({ onLogout, user }: { onLogout: () => void; user: AuthUser | null }) {
  const navigate = useNavigate();

  function handleLogout() {
    onLogout();
    navigate("/sign-in", { replace: true });
  }

  const initials = user?.full_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "RC";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1220px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/book-ride" className="text-[1.75rem] font-extrabold leading-none tracking-tight text-ink">
          RideConnect
        </Link>
        <nav className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `text-base font-medium transition ${isActive ? "text-ink" : "text-muted hover:text-ink"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/profile" className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-canvas text-sm font-bold text-ink">
            {initials}
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-canvas text-ink">
              ⌕
            </button>
            <Link to="/profile" className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-canvas text-ink">
              ☺
            </Link>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
