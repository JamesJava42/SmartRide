import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useRiderSession } from "../../hooks/useRiderSession";
import styles from "./MobileNav.module.css";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/", label: "Book Ride" },
  { to: "/activity", label: "Rides" },
  { to: "/profile?tab=payments", label: "Payments" },
  { to: "/profile", label: "Profile" },
];

export function MobileNav({
  showLogout = false,
  onBack,
}: {
  showLogout?: boolean;
  onBack?: () => void;
}) {
  const session = useRiderSession();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const initials = useMemo(() => {
    const fullName = session.user?.full_name?.trim();
    if (!fullName) {
      return "R";
    }
    return fullName
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [session.user?.full_name]);

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
    <header className={styles.nav}>
      <div className={styles.logo}>RideConnect</div>
      <div className={styles.actions} ref={menuRef}>
        {onBack ? (
          <button type="button" className={styles.backBtn} onClick={onBack}>
            ← Back
          </button>
        ) : null}
        <button
          type="button"
          className={styles.avatarButton}
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="Open rider menu"
          aria-expanded={menuOpen}
        >
          <div className={styles.avatar}>{initials}</div>
        </button>
        {menuOpen ? (
          <div className={styles.menu}>
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={styles.menuItem}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              className={styles.menuLogout}
              onClick={() => {
                setMenuOpen(false);
                session.signOut();
                navigate("/login", { replace: true });
              }}
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
