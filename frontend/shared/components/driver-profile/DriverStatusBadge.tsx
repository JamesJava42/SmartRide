import type { DriverProfile } from "@shared/types/driver";

type Props = { status: DriverProfile["status"]; size?: "sm" | "md" };

const CONFIG = {
  PENDING_APPROVAL: { label: "Pending Approval", dot: "bg-amber-400 animate-pulse", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  ACTIVE:           { label: "Active",            dot: "bg-emerald-500 animate-pulse", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  SUSPENDED:        { label: "Suspended",         dot: "bg-red-500",                  badge: "bg-red-50 text-red-700 border-red-200" },
  INACTIVE:         { label: "Inactive",          dot: "bg-slate-400",               badge: "bg-slate-50 text-slate-600 border-slate-200" },
};

export function DriverStatusBadge({ status, size = "md" }: Props) {
  const c = CONFIG[status] ?? CONFIG.INACTIVE;
  const px = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${px} ${c.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
