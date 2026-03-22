export function AdminKpiCard({ label, value, detail }: { label: string; value: number | string; detail?: string }) {
  return (
    <div className="rounded-[24px] border border-line bg-white px-5 py-4 shadow-[0_6px_24px_rgba(15,23,18,0.04)]">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-3 text-3xl font-bold tracking-tight text-ink">{value}</div>
      {detail ? <div className="mt-2 text-sm text-muted">{detail}</div> : null}
    </div>
  );
}
