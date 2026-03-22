import {
  BadgeDollarSign,
  CarFront,
  Clock3,
  LayoutGrid,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type { DashboardNavItem } from "../../types/dashboard";

type DriverSidebarProps = {
  activeItem: string;
  offerCount?: number;
  onSelect?: (item: DashboardNavItem) => void;
};

const sidebarSections: Array<{
  title: string;
  items: Array<{ key: DashboardNavItem; label: string; icon: typeof LayoutGrid }>;
}> = [
  {
    title: "Overview",
    items: [
      { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
      { key: "ride_offers", label: "Ride offers", icon: Clock3 },
      { key: "active_ride", label: "Active ride", icon: CarFront },
    ],
  },
  {
    title: "Records",
    items: [
      { key: "ride_history", label: "Ride history", icon: CarFront },
      { key: "earnings", label: "Earnings", icon: BadgeDollarSign },
    ],
  },
  {
    title: "Account",
    items: [
      { key: "profile", label: "Profile", icon: UserRound },
      { key: "verification", label: "Verification", icon: ShieldCheck },
      { key: "logout", label: "Logout", icon: LogOut },
    ],
  },
];

export function DriverSidebar({ activeItem, offerCount = 0, onSelect }: DriverSidebarProps) {
  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-[#E2E5DE] bg-[#F8F8F5] px-5 py-6">
      <div className="mb-8 text-[18px] font-medium text-[#141A13]">RideConnect</div>
      <div className="space-y-7">
        {sidebarSections.map((section) => (
          <section key={section.title}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8A9B85]">
              {section.title}
            </p>
            <div className="space-y-1.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onSelect?.(item.key)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                      isActive
                        ? "border border-[#D7E9DD] bg-[#EDF9F2] text-[#1A6B45]"
                        : "border border-transparent text-[#5A6B56] hover:bg-white"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={16} />
                      <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{item.label}</span>
                    </span>
                    {item.key === "ride_offers" && offerCount > 0 ? (
                      <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#1A6B45] px-1 text-[10px] font-semibold text-white">
                        {offerCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
