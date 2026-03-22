type StatusBadgeProps = {
  status: string;
  label?: string;
  className?: string;
};

const statusStyles: Record<string, string> = {
  MATCHING: "bg-amber-50 text-amber-700 border-amber-200",
  DRIVER_ASSIGNED: "bg-sky-50 text-sky-700 border-sky-200",
  DRIVER_EN_ROUTE: "bg-sky-50 text-sky-700 border-sky-200",
  DRIVER_ARRIVED: "bg-teal-50 text-teal-700 border-teal-200",
  RIDE_STARTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  RIDE_COMPLETED: "bg-zinc-100 text-zinc-700 border-zinc-200",
  NO_DRIVERS_FOUND: "bg-zinc-100 text-zinc-700 border-zinc-200",
  SUBMITTED: "bg-amber-50 text-amber-700 border-amber-200",
  UNDER_REVIEW: "bg-sky-50 text-sky-700 border-sky-200",
  DOCS_PENDING: "bg-orange-50 text-orange-700 border-orange-200",
  NEEDS_INFO: "bg-violet-50 text-violet-700 border-violet-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SUSPENDED: "bg-red-50 text-red-700 border-red-200",
  PENDING_APPROVAL: "bg-amber-50 text-amber-700 border-amber-200",
  MISSING: "bg-zinc-100 text-zinc-600 border-zinc-200",
  REUPLOAD_REQUESTED: "bg-violet-50 text-violet-700 border-violet-200",
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  const toneClass = statusStyles[normalized] ?? "bg-zinc-100 text-zinc-700 border-zinc-200";
  const defaultLabelMap: Record<string, string> = {
    DRIVER_ASSIGNED: "Assigned",
    DRIVER_EN_ROUTE: "En Route",
    DRIVER_ARRIVED: "Arrived",
    RIDE_STARTED: "Started",
    RIDE_COMPLETED: "Completed",
    NO_DRIVERS_FOUND: "No Drivers Found",
    PENDING_APPROVAL: "Pending Approval",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${toneClass} ${className ?? ""}`}>
      {label ?? defaultLabelMap[normalized] ?? status.replace(/_/g, " ")}
    </span>
  );
}
