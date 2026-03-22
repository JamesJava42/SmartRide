import { apiDataRequest } from "./client";

export type RideRecord = {
  ride_id: string;
  status: string;
  rider_name: string;
  driver_name?: string | null;
  pickup_address: string;
  dropoff_address: string;
  requested_at: string;
  region_name: string;
  recent_activity: string;
};

export type UnmatchedRideReportItem = {
  ride_id: string;
  rider_name: string;
  pickup_address: string;
  dropoff_address: string;
  requested_at: string | null;
  dispatch_retry_count: number;
  recent_activity: string;
};

export type UnmatchedRideReport = {
  total_unmatched_rides: number;
  max_dispatch_retries: number;
  items: UnmatchedRideReportItem[];
};

export async function getLiveRides(regionId?: string): Promise<RideRecord[]> {
  const query = regionId ? `?region_id=${encodeURIComponent(regionId)}` : "";
  const rides = await apiDataRequest<RideRecord[]>(`/admin/rides/active${query}`, { method: "GET" });
  return rides.map((ride) => ({
    ...ride,
    region_name: ride.region_name ?? "—",
    recent_activity: ride.recent_activity ?? "—",
    requested_at: typeof ride.requested_at === "string" ? ride.requested_at : new Date().toISOString(),
  }));
}

export async function redispatchRide(rideId: string): Promise<{ ride_id: string; status: string }> {
  return apiDataRequest(`/internal/admin/rides/${rideId}/redispatch`, { method: "POST" });
}

export async function getUnmatchedRidesReport(): Promise<UnmatchedRideReport> {
  return apiDataRequest<UnmatchedRideReport>("/admin/rides/unmatched-report", { method: "GET" });
}
