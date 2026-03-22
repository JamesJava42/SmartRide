import type { RiderRecentPayment } from "../../api/payments";

export function SpendingChartCard({ payments }: { payments: RiderRecentPayment[] }) {
  const lastSeven = payments.slice(0, 7).reverse();
  const max = Math.max(...lastSeven.map((item) => item.amount), 1);

  return (
    <div className="rounded-[24px] border border-line bg-white p-5 shadow-[0_16px_40px_rgba(23,33,27,0.04)]">
      <div className="text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">Daily spending</div>
      <div className="mt-5 flex h-44 items-end gap-3">
        {lastSeven.map((item) => (
          <div key={item.rideId} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-[8px] bg-[#1A6B45]"
              style={{ height: `${Math.max(8, (item.amount / max) * 132)}px`, opacity: item.amount / max > 0.55 ? 1 : 0.45 }}
            />
            <div className="text-[10px] text-[#9CA3AF]">
              {new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
