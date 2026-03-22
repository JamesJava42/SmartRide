import { DriverStatCard } from "./DriverStatCard";

type DriverStatsGridProps = {
  ridesToday: string;
  earnedToday: string;
  rating: string;
  totalRides: string;
};

export function DriverStatsGrid({
  ridesToday,
  earnedToday,
  rating,
  totalRides,
}: DriverStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <DriverStatCard value={ridesToday} label="Rides today" />
      <DriverStatCard value={earnedToday} label={"Earned\ntoday"} accent="green" />
      <DriverStatCard value={rating} label="Driver rating" />
      <DriverStatCard value={totalRides} label="Total rides" />
    </div>
  );
}
