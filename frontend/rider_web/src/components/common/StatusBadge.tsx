type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toUpperCase();
  const config =
    normalized === "CANCELLED"
      ? { label: "Cancelled", className: "bg-[#FEE2E2] text-[#991B1B]" }
      : normalized === "RIDE_STARTED"
        ? { label: "In progress", className: "bg-[#EFF6FF] text-[#1D4ED8]" }
        : normalized === "SCHEDULED"
          ? { label: "Scheduled", className: "bg-[#FEF3C7] text-[#92400E]" }
          : { label: "Completed", className: "bg-[#EDF9F2] text-[#1A6B45]" };

  return <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${config.className}`}>{config.label}</span>;
}
