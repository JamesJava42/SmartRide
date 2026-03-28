import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AuditLogsIcon,
  DashboardIcon,
  DriversIcon,
  LiveRidesIcon,
  MenuIcon,
  NotificationIcon,
  OnboardingIcon,
  RegionsIcon,
} from '@shared/constants/icons';
import { useUnmatchedRidesReport } from '../hooks/useUnmatchedRidesReport';
import styles from './AdminLayout.module.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/alerts', label: 'Alerts', icon: NotificationIcon },
  { to: '/live-rides', label: 'Live Rides', icon: LiveRidesIcon },
  { to: '/drivers', label: 'Drivers', icon: DriversIcon },
  { to: '/kyc', label: 'KYC Queue', icon: OnboardingIcon },
  { to: '/regions', label: 'Regions', icon: RegionsIcon },
  { to: '/audit-logs', label: 'Audit Logs', icon: AuditLogsIcon },
];

function getAdminFromToken(): { name: string; email: string; role: string } {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return { name: 'Admin', email: '', role: 'ADMIN' };
    const payload = JSON.parse(atob(token.split('.')[1]));
    const name = payload.name ?? payload.full_name ?? payload.email?.split('@')[0] ?? 'Admin';
    const email = payload.email ?? payload.sub ?? '';
    const role = payload.role ?? 'ADMIN';
    return { name, email, role };
  } catch {
    return { name: 'Admin', email: '', role: 'ADMIN' };
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const admin = getAdminFromToken();
  const { data: unmatchedReport } = useUnmatchedRidesReport();
  const unmatchedCount = unmatchedReport?.total_unmatched_rides ?? 0;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    localStorage.removeItem('access_token');
    navigate('/login');
  }

  const navigation = NAV_ITEMS.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) =>
        `${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ''}`
      }
    >
      {({ isActive }: { isActive: boolean }) => {
        const Icon = item.icon;
        const showBadge = item.to === '/live-rides' && unmatchedCount > 0;
        return (
          <>
            <Icon size={16} color={isActive ? 'var(--green-700)' : 'var(--text-muted)'} />
            <span>{item.label}</span>
            {showBadge && (
              <span className={styles.navBadge}>{unmatchedCount > 9 ? '9+' : unmatchedCount}</span>
            )}
          </>
        );
      }}
    </NavLink>
  ));

  return (
    <div className={styles.root}>
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <button
            className={styles.mobileMenuButton}
            onClick={() => setMobileNavOpen(true)}
            type="button"
            aria-label="Open navigation"
          >
            <MenuIcon size={18} color="var(--text-primary)" />
          </button>
          <span className={styles.logo}>RideConnect</span>
        </div>

        <div className={styles.navRight}>
          <button className={styles.iconBtn} title="Notifications"><NotificationIcon size={16} color="var(--text-muted)" /></button>

          <div className={styles.profileWrap} ref={dropdownRef}>
            <button className={styles.profileBtn} onClick={() => setDropdownOpen((o) => !o)}>
              <span className={styles.avatar}>{getInitials(admin.name)}</span>
              <span className={styles.profileName}>{admin.name}</span>
              <span className={styles.chevron}>{dropdownOpen ? '▲' : '▼'}</span>
            </button>

            {dropdownOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <span className={styles.dropdownName}>{admin.name}</span>
                  {admin.email && <span className={styles.dropdownEmail}>{admin.email}</span>}
                  <span className={styles.dropdownRole}>{admin.role}</span>
                </div>
                <div className={styles.dropdownDivider} />
                <button className={styles.dropdownItem} onClick={handleLogout}>
                  <span>🚪</span> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside className={styles.sidebarDesktop}>
        {navigation}
      </aside>

      <button
        className={`${styles.mobileBackdrop} ${mobileNavOpen ? styles.mobileBackdropVisible : ''}`}
        onClick={() => setMobileNavOpen(false)}
        type="button"
        aria-label="Close navigation"
      />
      <aside className={`${styles.mobileSidebar} ${mobileNavOpen ? styles.mobileSidebarOpen : ''}`}>
        <div className={styles.mobileSidebarHeader}>
          <div>
            <div className={styles.logo}>RideConnect</div>
            <div className={styles.mobileSidebarSubhead}>Admin Navigation</div>
          </div>
          <button
            className={styles.mobileCloseButton}
            onClick={() => setMobileNavOpen(false)}
            type="button"
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>
        <nav className={styles.mobileSidebarNav}>{navigation}</nav>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
