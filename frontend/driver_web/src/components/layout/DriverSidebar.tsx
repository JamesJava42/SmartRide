import { ArrowRight, Clock3, FileText, LayoutGrid, List, Shield, User } from "lucide-react";
import { NavLink } from "react-router-dom";

import styles from "./DriverSidebar.module.css";

type DriverSidebarProps = {
  offerCount: number;
  className?: string;
  onNavigate?: () => void;
  mobile?: boolean;
};

const overviewItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/offers", label: "Ride offers", icon: Clock3 },
  { to: "/rides/active", label: "Active ride", icon: ArrowRight },
];

const historyItems = [
  { to: "/ride-history", label: "Ride history", icon: List },
  { to: "/earnings", label: "Earnings", icon: Shield },
];

const accountItems = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/onboarding-pending", label: "Approval", icon: FileText },
];

function SidebarLink({
  to,
  label,
  icon: Icon,
  badge,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: typeof LayoutGrid;
  badge?: number;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ""}`}
    >
      <span className={styles.linkLeft}>
        <Icon size={16} />
        <span>{label}</span>
      </span>
      {badge && badge > 0 ? <span className={styles.badge}>{badge > 9 ? "9+" : badge}</span> : null}
    </NavLink>
  );
}

export function DriverSidebar({ offerCount, className, onNavigate, mobile = false }: DriverSidebarProps) {
  return (
    <aside className={`${mobile ? styles.sidebarMobile : styles.sidebar} ${className ?? ""}`}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Overview</div>
        {overviewItems.map((item) => (
          <SidebarLink key={item.to} {...item} badge={item.to === "/offers" ? offerCount : undefined} onNavigate={onNavigate} />
        ))}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>History</div>
        {historyItems.map((item) => (
          <SidebarLink key={item.to} {...item} onNavigate={onNavigate} />
        ))}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Account</div>
        {accountItems.map((item) => (
          <SidebarLink key={item.to} {...item} onNavigate={onNavigate} />
        ))}
      </div>
    </aside>
  );
}
