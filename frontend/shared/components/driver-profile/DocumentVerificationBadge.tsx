import type { DriverDocument } from "@shared/types/driver";

type Props = { status: DriverDocument["verification_status"]; size?: "sm" | "md" };

const CONFIG = {
  SUBMITTED:    { label: "Submitted",    icon: "○", badge: "bg-slate-50 text-slate-600 border-slate-200" },
  UNDER_REVIEW: { label: "Under Review", icon: "◷", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED:     { label: "Approved",     icon: "✓", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED:     { label: "Rejected",     icon: "✕", badge: "bg-red-50 text-red-700 border-red-200" },
};

export function DocumentVerificationBadge({ status, size = "md" }: Props) {
  const c = CONFIG[status] ?? CONFIG.SUBMITTED;
  const px = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-xs";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${px} ${c.badge}`}>
      <span>{c.icon}</span>
      {c.label}
    </span>
  );
}
