import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./DriverTopNav.module.css";
import type { DriverAvailability } from "../../types/driverOperations";
import { useDriverSession } from "../../hooks/useDriverSession";

type DriverTopNavProps = {
  initials: string;
  availability?: DriverAvailability;
  hasActiveRide?: boolean;
  onMenuClick?: () => void;
  isMenuOpen?: boolean;
};

export function DriverTopNav({ initials, availability = "OFFLINE", hasActiveRide = false, onMenuClick, isMenuOpen = false }: DriverTopNavProps) {
  const navigate = useNavigate();
  const auth = useDriverSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  const avatarToneClass = hasActiveRide
    ? styles.avatarRide
    : availability === "ONLINE"
      ? styles.avatarOnline
      : styles.avatarOffline;

  return (
    <header className={styles.navbar}>
      <div className={styles.leftGroup}>
        <button
          type="button"
          className={`${styles.menuButton} ${isMenuOpen ? styles.menuButtonOpen : ""}`}
          onClick={onMenuClick}
          aria-label={isMenuOpen ? "Close sidebar menu" : "Open sidebar menu"}
          aria-expanded={isMenuOpen}
        >
          <Menu size={18} />
        </button>
        <div className={styles.logo}>RideConnect</div>
      </div>
      <div className={styles.actions} ref={menuRef}>
        <button
          type="button"
          className={`${styles.avatarButton} ${styles.avatar} ${avatarToneClass}`}
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="Open account menu"
          aria-expanded={menuOpen}
        >
          {initials}
        </button>
        {menuOpen ? (
          <div className={styles.dropdown}>
            <button
              type="button"
              className={styles.dropdownItem}
              onClick={() => {
                setMenuOpen(false);
                auth.signOut();
                navigate("/driver/login");
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
