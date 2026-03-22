import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { getActiveRide, getDriverProfile } from "../../api/driverDashboard";
import { getOffers } from "../../api/driverOffers";
import { useDriverSession } from "../../hooks/useDriverSession";
import { DriverSidebar } from "./DriverSidebar";
import { DriverTopNav } from "./DriverTopNav";
import styles from "./DriverLayout.module.css";

export function DriverLayout({ children }: { children: ReactNode }) {
  const auth = useDriverSession();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const profileQuery = useQuery({
    queryKey: ["driver-profile"],
    queryFn: getDriverProfile,
  });
  const offersQuery = useQuery({
    queryKey: ["offers"],
    queryFn: getOffers,
    refetchInterval: 5000,
  });
  const activeRideQuery = useQuery({
    queryKey: ["driver-layout-active-ride"],
    queryFn: getActiveRide,
    refetchInterval: 10000,
  });

  const initials =
    profileQuery.data?.full_name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") ||
    auth.user?.fullName
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "D";

  return (
    <div className={styles.shell}>
      <DriverTopNav
        initials={initials}
        availability={profileQuery.data?.availability}
        hasActiveRide={!!activeRideQuery.data}
        isMenuOpen={mobileSidebarOpen}
        onMenuClick={() => setMobileSidebarOpen((current) => !current)}
      />
      <div
        className={`${styles.mobileSidebarOverlay} ${mobileSidebarOpen ? styles.mobileSidebarOverlayOpen : ""}`}
        onClick={() => setMobileSidebarOpen(false)}
      />
      <aside className={`${styles.mobileSidebar} ${mobileSidebarOpen ? styles.mobileSidebarOpen : ""}`}>
        <div className={styles.mobileSidebarHeader}>
          <div className={styles.mobileSidebarTitle}>Navigation</div>
        </div>
        <DriverSidebar
          mobile
          offerCount={offersQuery.data?.filter((offer) => offer.status === "PENDING").length ?? 0}
          onNavigate={() => setMobileSidebarOpen(false)}
        />
      </aside>
      <div className={styles.body}>
        <DriverSidebar
          offerCount={offersQuery.data?.filter((offer) => offer.status === "PENDING").length ?? 0}
        />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
