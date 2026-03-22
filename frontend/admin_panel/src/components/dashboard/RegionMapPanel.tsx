export function RegionMapPanel() {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white">
      <div className="relative h-[330px] bg-[linear-gradient(180deg,#f5f5f3_0%,#ebebe8_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.9),transparent_35%),linear-gradient(90deg,transparent_24%,rgba(160,160,160,0.15)_25%,rgba(160,160,160,0.15)_26%,transparent_27%,transparent_49%,rgba(160,160,160,0.15)_50%,rgba(160,160,160,0.15)_51%,transparent_52%),linear-gradient(0deg,transparent_24%,rgba(160,160,160,0.15)_25%,rgba(160,160,160,0.15)_26%,transparent_27%,transparent_49%,rgba(160,160,160,0.15)_50%,rgba(160,160,160,0.15)_51%,transparent_52%)] bg-[length:100%_100%,120px_120px,120px_120px]" />
        <div className="absolute left-[16%] top-[58%] h-4 w-4 rounded-full bg-accent ring-4 ring-accent/20" />
        <div className="absolute left-[58%] top-[22%] h-4 w-4 rounded-full bg-ink ring-4 ring-black/10" />
        <div className="absolute left-[76%] top-[54%] h-4 w-4 rounded-full bg-accent ring-4 ring-accent/20" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" fill="none">
          <path d="M40 210C120 160 160 180 240 120C290 84 330 92 360 78" stroke="#8B8F8C" strokeWidth="6" strokeLinecap="round" />
          <path d="M80 230C150 200 220 220 310 150" stroke="#C6C8C4" strokeWidth="4" strokeDasharray="8 10" strokeLinecap="round" />
        </svg>
      </div>
      <div className="grid grid-cols-3 divide-x divide-line bg-[#fcfcfb] text-center">
        <div className="px-4 py-4">
          <p className="text-3xl font-semibold text-ink">38</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Active Rides</p>
        </div>
        <div className="px-4 py-4">
          <p className="text-3xl font-semibold text-ink">6</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Matching</p>
        </div>
        <div className="px-4 py-4">
          <p className="text-3xl font-semibold text-ink">24</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">In Progress</p>
        </div>
      </div>
    </div>
  );
}
