type KpiCardProps = {
  label: string;
  value: number;
  icon?: string;
};

export function KpiCard({ label, value, icon = "◔" }: KpiCardProps) {
  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-3 text-4xl font-semibold text-ink">{value}</p>
        </div>
        <span className="text-3xl text-muted">{icon}</span>
      </div>
    </div>
  );
}
