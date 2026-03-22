import { apiRequest } from "./client";
import type {
  DriverActivityResponse,
  DriverEarnings,
  DriverPerformance,
  DriverRideHistory,
} from "../types/driverActivity";

type HistoryParams = {
  status?: "RIDE_COMPLETED" | "CANCELLED" | "ALL";
  period?: "this_month" | "last_3_months" | "this_year" | "all_time";
};

type ApiEnvelope<T> = { data?: T } & T;

type DriverRideHistoryListItem = {
  ride_id: string;
  pickup_address: string;
  dropoff_address: string;
  status: string;
  completed_at?: string | null;
  driver_payout_amount?: number | string | null;
};

type DriverRideHistoryListResponse = {
  items: DriverRideHistoryListItem[];
};

type RideDetailApi = {
  id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  vehicle?: {
    vehicle_type?: string | null;
    plate_number?: string | null;
    make?: string | null;
    model?: string | null;
  } | null;
  requested_at?: string | null;
  completed_at?: string | null;
  estimated_distance_miles?: number | string | null;
  actual_distance_miles?: number | string | null;
  estimated_duration_minutes?: number | null;
  actual_duration_minutes?: number | null;
  final_fare_amount?: number | string | null;
};

function filterRides(rides: DriverRideHistory[], params?: HistoryParams) {
  let filtered = [...rides];
  if (params?.status && params.status !== "ALL") {
    filtered = filtered.filter((ride) => ride.status === params.status);
  }
  const now = Date.now();
  if (params?.period && params.period !== "all_time") {
    filtered = filtered.filter((ride) => {
      const createdAt = new Date(ride.created_at).getTime();
      const diffDays = (now - createdAt) / 86400000;
      if (params.period === "this_month") return diffDays <= 31;
      if (params.period === "last_3_months") return diffDays <= 92;
      if (params.period === "this_year") return diffDays <= 365;
      return true;
    });
  }
  return filtered;
}

function summaryFromRides(rides: DriverRideHistory[]) {
  const completed = rides.filter((ride) => ride.status === "RIDE_COMPLETED");
  const ratings = completed.map((ride) => ride.rider_rating).filter((value): value is number => value != null);
  const distances = completed.map((ride) => ride.distance_km).filter((value): value is number => value != null);
  return {
    total_rides: rides.length,
    total_earned: completed.reduce((sum, ride) => sum + (ride.payout_amount ?? 0), 0),
    average_rating: ratings.length ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : 0,
    average_distance_km: distances.length ? distances.reduce((sum, value) => sum + value, 0) / distances.length : 0,
    currency: "USD",
  };
}

function unwrap<T>(payload: ApiEnvelope<T>): T {
  if (payload && typeof payload === "object" && "data" in payload && payload.data !== undefined) {
    return payload.data as T;
  }
  return payload as T;
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function milesToKm(value: unknown) {
  const miles = Number(value);
  return Number.isFinite(miles) ? miles / 0.621371 : null;
}

function normalizeStatus(value: string): DriverRideHistory["status"] {
  return value === "CANCELLED" ? "CANCELLED" : value === "RIDE_STARTED" ? "RIDE_STARTED" : "RIDE_COMPLETED";
}

async function getDriverRideList(): Promise<DriverRideHistoryListItem[]> {
  const response = await apiRequest<ApiEnvelope<DriverRideHistoryListResponse>>("/drivers/me/rides?page=1&page_size=50", { method: "GET" });
  const data = unwrap(response);
  return Array.isArray(data.items) ? data.items : [];
}

async function getRideDetailApi(rideId: string): Promise<RideDetailApi> {
  const response = await apiRequest<ApiEnvelope<RideDetailApi>>(`/rides/${rideId}`, { method: "GET" });
  return unwrap(response);
}

async function normalizeRide(item: DriverRideHistoryListItem): Promise<DriverRideHistory> {
  const detail = await getRideDetailApi(item.ride_id);
  return {
    ride_id: item.ride_id,
    status: normalizeStatus(item.status),
    pickup_address: item.pickup_address,
    dropoff_address: item.dropoff_address,
    vehicle_type: detail.vehicle?.vehicle_type ?? "Economy",
    plate_number: detail.vehicle?.plate_number ?? "—",
    rider_name: "Rider",
    fare_amount: detail.final_fare_amount == null ? null : toNumber(detail.final_fare_amount),
    tip_amount: 0,
    bonus_amount: 0,
    payout_amount: item.driver_payout_amount == null ? null : toNumber(item.driver_payout_amount),
    payment_method: "Card",
    duration_minutes: detail.actual_duration_minutes ?? detail.estimated_duration_minutes ?? null,
    distance_km: milesToKm(detail.actual_distance_miles ?? detail.estimated_distance_miles),
    rider_rating: null,
    rider_comment: null,
    created_at: detail.requested_at ?? item.completed_at ?? new Date().toISOString(),
    completed_at: detail.completed_at ?? item.completed_at ?? null,
  };
}

export async function getDriverRideHistory(params?: HistoryParams): Promise<DriverActivityResponse> {
  const rides = await Promise.all((await getDriverRideList()).map(normalizeRide));
  const filtered = filterRides(rides, params);
  return {
    rides: filtered,
    summary: summaryFromRides(filtered),
    total_count: filtered.length,
  };
}

export async function getDriverRideDetail(rideId: string): Promise<DriverRideHistory> {
  const list = await getDriverRideList();
  const listItem = list.find((item) => item.ride_id === rideId);
  if (listItem) {
    return normalizeRide(listItem);
  }

  const detail = await getRideDetailApi(rideId);
  return {
    ride_id: detail.id,
    status: normalizeStatus(detail.status),
    pickup_address: detail.pickup_address,
    dropoff_address: detail.dropoff_address,
    vehicle_type: detail.vehicle?.vehicle_type ?? "Economy",
    plate_number: detail.vehicle?.plate_number ?? "—",
    rider_name: "Rider",
    fare_amount: detail.final_fare_amount == null ? null : toNumber(detail.final_fare_amount),
    tip_amount: 0,
    bonus_amount: 0,
    payout_amount: null,
    payment_method: "Card",
    duration_minutes: detail.actual_duration_minutes ?? detail.estimated_duration_minutes ?? null,
    distance_km: milesToKm(detail.actual_distance_miles ?? detail.estimated_distance_miles),
    rider_rating: null,
    rider_comment: null,
    created_at: detail.requested_at ?? new Date().toISOString(),
    completed_at: detail.completed_at ?? null,
  };
}

export async function downloadDriverReceipt(rideId: string): Promise<Blob> {
  const token = window.localStorage.getItem("rc_driver_token");
  const response = await fetch(`${(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "")}/api/v1/drivers/rides/${rideId}/receipt`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error("Could not download receipt");
  }
  return response.blob();
}

export async function getDriverEarnings(_params: { period: string }): Promise<DriverEarnings> {
  const response = await apiRequest<{ data?: DriverEarnings } & DriverEarnings>(`/drivers/earnings?period=${encodeURIComponent(_params.period)}`, { method: "GET" });
  return response.data ?? response;
}

export async function getDriverPerformance(): Promise<DriverPerformance> {
  const response = await apiRequest<{ data?: DriverPerformance } & DriverPerformance>("/drivers/me/performance", { method: "GET" });
  return response.data ?? response;
}
