import { Menu } from "lucide-react";

type DriverTopNavProps = {
  mobile: boolean;
  driverInitials: string;
  showOnlineBadge?: boolean;
  onMenuClick?: () => void;
};

export function DriverTopNav({
  mobile,
  driverInitials,
  showOnlineBadge = true,
  onMenuClick,
}: DriverTopNavProps) {
  if (mobile) {
    return (
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E2E5DE] bg-[#F4F5F2]/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E5DE] bg-white text-[#141A13]"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <div className="text-[17px] font-medium text-[#141A13]">RideConnect</div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#D5ECDD] bg-white text-sm font-semibold text-[#1A6B45]">
          {driverInitials}
        </div>
      </header>
    );
  }

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-[#E2E5DE] bg-[#F4F5F2] px-8">
      <div className="text-[17px] font-medium text-[#141A13]">RideConnect</div>
      <div className="flex items-center gap-3">
        {showOnlineBadge ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D7E9DD] bg-[#EDF9F2] px-3 py-1.5 text-xs font-medium text-[#1A6B45]">
            <span className="h-2 w-2 rounded-full bg-[#1A6B45]" />
            Online
          </div>
        ) : null}
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#D5ECDD] bg-white text-sm font-semibold text-[#1A6B45]">
          {driverInitials}
        </div>
      </div>
    </header>
  );
}
