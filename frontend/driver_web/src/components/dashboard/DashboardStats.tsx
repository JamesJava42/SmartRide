import { formatCurrency, titleizeStatus } from "../../utils/formatters";

export function DashboardStats({
  todayEarnings,
  tripsToday,
  activeRideState,
  currentRegion,
}: {
  todayEarnings: number;
  tripsToday: number;
  activeRideState: string;
  currentRegion: string | null;
}) {
  const cards = [
    { label: "Today earnings", value: formatCurrency(todayEarnings) },
    { label: "Trips today", value: String(tripsToday) },
    { label: "Ride state", value: titleizeStatus(activeRideState || "No active ride") },
    { label: "Current region", value: currentRegion ?? "No data" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-3xl border border-line bg-white p-5 shadow-sm">
          <p className="text-sm text-muted">{card.label}</p>
          <p className="mt-3 text-2xl font-semibold text-ink">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
