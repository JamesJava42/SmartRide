import type { RiderTravelInsights } from "../../api/insights";

export function UsagePatternsCard({ insights }: { insights: RiderTravelInsights }) {
  const bars = [
    { label: "Mon", value: 42 },
    { label: "Tue", value: 58 },
    { label: "Wed", value: 71 },
    { label: "Thu", value: 63 },
    { label: "Fri", value: 88 },
    { label: "Sat", value: 54 },
    { label: "Sun", value: 36 },
  ];
  const max = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <div className="rounded-[24px] border border-line bg-white p-5 shadow-[0_16px_40px_rgba(23,33,27,0.04)]">
      <div className="text-sm font-semibold text-[#111111]">Usage patterns</div>
      <div className="mt-1 text-xs text-[#9CA3AF]">Most common ride type: {insights.commonRideType}</div>
      <div className="mt-6 flex h-40 items-end gap-3">
        {bars.map((bar) => (
          <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t-[8px] bg-[#1A6B45]" style={{ height: `${Math.max(10, (bar.value / max) * 112)}px`, opacity: bar.value / max > 0.55 ? 1 : 0.45 }} />
            <div className="text-[10px] text-[#9CA3AF]">{bar.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
