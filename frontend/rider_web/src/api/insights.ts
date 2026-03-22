import { getRiderActivity } from "./riderActivity";

export type RiderTravelInsights = {
  lifetimeTripCount: number;
  avgDistanceKm: number;
  avgDurationMinutes: number;
  favoriteCity: string;
  commonRideType: string;
  cancellationCount: number;
  averageRatingGiven: number;
};

export async function getRiderTravelInsights(): Promise<RiderTravelInsights> {
  const data = await getRiderActivity({ status: "ALL", period: "all_time" });
  const completed = data.rides.filter((ride) => ride.status !== "CANCELLED");
  const avgDistanceKm = completed.length
    ? completed.reduce((sum, ride) => sum + (ride.distance_km ?? 0), 0) / completed.length
    : 0;
  const avgDurationMinutes = completed.length
    ? completed.reduce((sum, ride) => sum + (ride.duration_minutes ?? 0), 0) / completed.length
    : 0;
  const typeCount = new Map<string, number>();
  completed.forEach((ride) => {
    typeCount.set(ride.vehicle_type || "Economy", (typeCount.get(ride.vehicle_type || "Economy") ?? 0) + 1);
  });
  const commonRideType = [...typeCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Economy";
  const favoriteCity = completed[0]?.dropoff_address.split(",").slice(-2).join(", ").trim() || "Long Beach, CA";
  return {
    lifetimeTripCount: data.total_count,
    avgDistanceKm,
    avgDurationMinutes,
    favoriteCity,
    commonRideType,
    cancellationCount: data.rides.filter((ride) => ride.status === "CANCELLED").length,
    averageRatingGiven: data.summary.average_rating_given,
  };
}
