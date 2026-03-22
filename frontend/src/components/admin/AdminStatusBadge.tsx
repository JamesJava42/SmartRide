const toneMap: Record<string, string> = {
  MATCHING: "bg-amber-100 text-amber-800",
  DRIVER_ASSIGNED: "bg-sky-100 text-sky-800",
  DRIVER_EN_ROUTE: "bg-teal-100 text-teal-800",
  RIDE_STARTED: "bg-emerald-100 text-emerald-800",
  RIDE_COMPLETED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-rose-100 text-rose-700",
  SUBMITTED: "bg-slate-100 text-slate-700",
  UNDER_REVIEW: "bg-sky-100 text-sky-800",
  DOCS_PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-700",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  SUSPENDED: "bg-rose-100 text-rose-700",
  AVAILABLE: "bg-emerald-100 text-emerald-800",
  BUSY: "bg-teal-100 text-teal-800",
  OFFLINE: "bg-slate-100 text-slate-700",
  green: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-rose-100 text-rose-700",
};

export function AdminStatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneMap[value] ?? "bg-slate-100 text-slate-700"}`}>
      {value.replaceAll("_", " ")}
    </span>
  );
}
