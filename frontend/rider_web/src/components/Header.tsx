import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import type { AuthUser } from "../types/api";
import { StatusPill } from "./common/StatusPill";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/", label: "Book Ride" },
  { to: "/activity", label: "Rides" },
  { to: "/profile?tab=payments", label: "Payments" },
  { to: "/profile", label: "Profile" },
];

export function Header({ onLogout: _onLogout, user, fullBleed = false }: { onLogout: () => void; user: AuthUser | null; fullBleed?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const initials =
    user?.full_name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "RC";

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handlePointerDown);
    }

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-[1200] border-b border-line bg-white/95 backdrop-blur">
      <div className={`${fullBleed ? "w-full px-4 py-3" : "mx-auto w-full max-w-[1220px] px-4 py-3 sm:px-6 lg:px-8"} flex items-center justify-between gap-4`}>
        <Link to="/" className="text-[1.75rem] font-extrabold leading-none tracking-tight text-ink">
          RideConnect
        </Link>
        <nav className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => `text-[15px] font-medium transition ${isActive ? "text-[#1A6B45]" : "text-muted hover:text-ink"}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="relative flex items-center gap-3" ref={menuRef}>
          <div className="hidden md:block">
            <StatusPill>Verified account</StatusPill>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#1A6B45] bg-white text-sm font-bold text-[#1A6B45]"
            aria-label="Open rider menu"
            aria-expanded={menuOpen}
          >
            {initials}
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-[calc(100%+10px)] z-[1210] min-w-[220px] rounded-2xl border border-line bg-white p-2 shadow-[0_20px_40px_rgba(20,26,19,0.08)]">
              <div className="flex flex-col md:hidden">
                {navItems.map((item) => (
                  <Link
                    key={`mobile-${item.label}`}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-ink transition hover:bg-[#EDF9F2] hover:text-[#1A6B45]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  _onLogout();
                }}
                className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-[#B42318] transition hover:bg-[#FEF3F2]"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
