import type { OnboardingProfile } from "@shared/types/driver";

type Props = { status: OnboardingProfile["status"]; size?: "sm" | "md" };

const CONFIG = {
  DRAFT:        { label: "Draft",         dot: "bg-slate-400",              badge: "bg-slate-50 text-slate-600 border-slate-200" },
  SUBMITTED:    { label: "Submitted",     dot: "bg-blue-400",               badge: "bg-blue-50 text-blue-700 border-blue-200" },
  UNDER_REVIEW: { label: "Under Review",  dot: "bg-amber-400 animate-pulse", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  DOCS_PENDING: { label: "Docs Pending",  dot: "bg-orange-400 animate-pulse", badge: "bg-orange-50 text-orange-700 border-orange-200" },
  APPROVED:     { label: "Approved",      dot: "bg-emerald-500",             badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED:     { label: "Rejected",      dot: "bg-red-500",                 badge: "bg-red-50 text-red-700 border-red-200" },
};

export function OnboardingStatusBadge({ status, size = "md" }: Props) {
  const c = CONFIG[status] ?? CONFIG.DRAFT;
  const px = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${px} ${c.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
