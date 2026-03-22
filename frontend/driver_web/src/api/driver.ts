import { apiRequest } from "./client";
import type { DriverDashboardSummary, DriverStatusUpdate } from "../types/driver";
import type { EarningsSummary } from "../types/earnings";
import type { DriverProfile, DriverVehicle } from "../types/profile";
import type { ActiveTrip, Coordinate, PendingRideOffer, RouteCoordinate } from "../types/ride";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string | null;
  data: T;
};

type DriverProfileApi = {
  id: string;
  first_name: string;
  last_name?: string | null;
  phone_number: string;
  status: string;
  is_online: boolean;
  is_available: boolean;
  is_approved: boolean;
  rating_avg?: string | number | null;
  total_rides_completed: number;
};

type VehicleApi = {
  id: string;
  make: string;
  model: string;
  year: number;
  plate_number: string;
  vehicle_type: string;
  seat_capacity: number;
};

type RideHistoryApiItem = {
  ride_id: string;
  pickup_address: string;
  dropoff_address: string;
  status: string;
  completed_at?: string | null;
  driver_payout_amount?: string | number | null;
};

type RideHistoryApiResponse = {
  items: RideHistoryApiItem[];
};

type DriverEarningsApi = {
  today_earnings: string | number;
  week_earnings: string | number;
  month_earnings: string | number;
  rides_completed_today: number;
};

type RideDetailApi = {
  id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  estimated_distance_miles?: string | number | null;
  estimated_duration_minutes?: number | null;
  final_fare_amount?: string | number | null;
};

type LiveTrackingApi = {
  ride_id: string;
  status: string;
  driver_location?: {
    latitude: string | number;
    longitude: string | number;
  } | null;
  pickup_location?: {
    latitude: string | number;
    longitude: string | number;
  } | null;
  dropoff_location?: {
    latitude: string | number;
    longitude: string | number;
  } | null;
  eta_minutes?: number | null;
  route_geometry?: Array<{
    latitude: string | number;
    longitude: string | number;
  }> | null;
  route_distance_meters?: number | null;
  route_duration_seconds?: number | null;
};

type ActiveOfferApi = {
  offer_id: string;
  ride_id: string;
  offer_status: string;
  pickup_address?: string;
  dropoff_address?: string;
  trip_distance_miles?: string | number | null;
  estimated_payout?: string | number | null;
  expires_at?: string | null;
};

function unwrap<T>(response: ApiEnvelope<T>): T {
  return response.data;
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value == null) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function fullName(firstName?: string | null, lastName?: string | null) {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || "Driver";
}

function initials(value: string) {
  const chars = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase());
  return chars.join("") || "DR";
}

function availabilityState(profile: DriverProfileApi, hasActiveTrip: boolean): DriverDashboardSummary["availabilityState"] {
  if (hasActiveTrip) {
    return "ON_TRIP";
  }
  if (!profile.is_online) {
    return "OFFLINE";
  }
  if (profile.is_available) {
    return "ONLINE";
  }
  return "WAITING";
}

function toCoordinate(point?: { latitude: string | number; longitude: string | number } | null): Coordinate | null {
  if (!point) {
    return null;
  }
  return {
    latitude: Number(point.latitude),
    longitude: Number(point.longitude),
  };
}

function createIdempotencyKey(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function getDriverProfileApi() {
  return unwrap(await apiRequest<ApiEnvelope<DriverProfileApi>>("/drivers/me", { method: "GET" }));
}

async function getVehicleApi() {
  try {
    return unwrap(await apiRequest<ApiEnvelope<VehicleApi>>("/drivers/me/vehicle", { method: "GET" }));
  } catch {
    return null;
  }
}

async function getHistoryApi() {
  return unwrap(await apiRequest<ApiEnvelope<RideHistoryApiResponse>>("/drivers/me/rides?page=1&page_size=25", { method: "GET" }));
}

async function getEarningsApi() {
  return unwrap(await apiRequest<ApiEnvelope<DriverEarningsApi>>("/drivers/me/earnings/summary", { method: "GET" }));
}

async function getOffersApi() {
  try {
    return unwrap(await apiRequest<ApiEnvelope<ActiveOfferApi[]>>("/driver/offers/active", { method: "GET" }));
  } catch {
    return [];
  }
}

async function getRideDetail(rideId: string) {
  return unwrap(await apiRequest<ApiEnvelope<RideDetailApi>>(`/rides/${rideId}`, { method: "GET" }));
}

async function getLiveRideState(rideId: string) {
  try {
    return unwrap(await apiRequest<ApiEnvelope<LiveTrackingApi>>(`/tracking/rides/${rideId}/live`, { method: "GET" }));
  } catch {
    return null;
  }
}

function activeRideCandidate(items: RideHistoryApiItem[]) {
  return items.find((item) => !["RIDE_COMPLETED", "CANCELLED"].includes(item.status)) ?? null;
}

export async function getDriverDashboard(currentLocation: Coordinate | null): Promise<{
  summary: DriverDashboardSummary;
  activeTrip: ActiveTrip | null;
  pendingOffer: PendingRideOffer | null;
  profile: DriverProfile;
  vehicle: DriverVehicle | null;
  earnings: EarningsSummary;
}> {
  const [profileApi, vehicleApi, historyApi, earningsApi, offersApi] = await Promise.all([
    getDriverProfileApi(),
    getVehicleApi(),
    getHistoryApi(),
    getEarningsApi(),
    getOffersApi(),
  ]);

  const activeRideItem = activeRideCandidate(historyApi.items);
  const pendingOffer: PendingRideOffer | null = offersApi[0]
    ? {
        offerId: offersApi[0].offer_id,
        rideId: offersApi[0].ride_id,
        status: offersApi[0].offer_status,
        pickupAddress: offersApi[0].pickup_address ?? "Pickup location",
        destinationAddress: offersApi[0].dropoff_address ?? "Destination",
        estimatedDistanceMiles: toNumber(offersApi[0].trip_distance_miles),
        payoutEstimate: toNumber(offersApi[0].estimated_payout),
        expiresAt: offersApi[0].expires_at ?? null,
      }
    : null;
  let activeTrip: ActiveTrip | null = null;

  if (activeRideItem) {
    const [detail, live] = await Promise.all([getRideDetail(activeRideItem.ride_id), getLiveRideState(activeRideItem.ride_id)]);
    const route: RouteCoordinate[] =
      live?.route_geometry?.map((point) => ({
        latitude: Number(point.latitude),
        longitude: Number(point.longitude),
      })) ?? [];

    activeTrip = {
      rideId: detail.id,
      status: detail.status,
      riderName: "Assigned rider",
      pickupAddress: detail.pickup_address,
      destinationAddress: detail.dropoff_address,
      etaMinutes: live?.eta_minutes ?? null,
      estimatedDistanceMiles: toNumber(detail.estimated_distance_miles),
      estimatedDurationMinutes: detail.estimated_duration_minutes ?? null,
      payoutEstimate: toNumber(detail.final_fare_amount),
      driverLocation: live?.driver_location ? toCoordinate(live.driver_location) : currentLocation,
      pickupLocation: toCoordinate(live?.pickup_location),
      dropoffLocation: toCoordinate(live?.dropoff_location),
      route,
      routeDistanceMeters: live?.route_distance_meters ?? null,
      routeDurationSeconds: live?.route_duration_seconds ?? null,
    };
  }

  const driverName = fullName(profileApi.first_name, profileApi.last_name);

  const profile: DriverProfile = {
    id: profileApi.id,
    fullName: driverName,
    email: "",
    phoneNumber: profileApi.phone_number || "—",
    address: null,
    region: null,
    languages: [],
    joinedDate: null,
    totalRidesCompleted: profileApi.total_rides_completed,
    rating: toNumber(profileApi.rating_avg),
    status: profileApi.status,
    isOnline: profileApi.is_online,
    isAvailable: profileApi.is_available,
    isApproved: profileApi.is_approved,
  };

  const vehicle: DriverVehicle | null = vehicleApi
    ? {
        id: vehicleApi.id,
        make: vehicleApi.make,
        model: vehicleApi.model,
        year: vehicleApi.year,
        color: null,
        plateNumber: vehicleApi.plate_number,
        vehicleType: vehicleApi.vehicle_type,
        seatCount: vehicleApi.seat_capacity ?? null,
      }
    : null;

  const earnings: EarningsSummary = {
    todayEarnings: Number(earningsApi.today_earnings),
    weekEarnings: Number(earningsApi.week_earnings),
    monthEarnings: Number(earningsApi.month_earnings),
    pendingPayout: 0,
    grossFares: Number(earningsApi.month_earnings),
    platformFee: 0,
    adjustments: 0,
    netPayout: Number(earningsApi.month_earnings),
    tripsToday: earningsApi.rides_completed_today,
  };

  const summary: DriverDashboardSummary = {
    driverName,
    driverInitials: initials(driverName),
    availabilityState: availabilityState(profileApi, Boolean(activeTrip)),
    statusLabel: profileApi.status,
    todayEarnings: earnings.todayEarnings,
    tripsToday: earnings.tripsToday,
    currentRegion: null,
    activeRideState: activeTrip?.status ?? (pendingOffer ? pendingOffer.status : "No active ride"),
    currentLocation: activeTrip?.driverLocation ?? currentLocation,
  };

  return { summary, activeTrip, pendingOffer, profile, vehicle, earnings };
}

export async function updateDriverAvailability(payload: DriverStatusUpdate) {
  return unwrap(
    await apiRequest<ApiEnvelope<{ driver_id: string; is_online: boolean; is_available: boolean }>>("/drivers/me/availability", {
      method: "POST",
      body: {
        is_online: payload.isOnline,
        is_available: payload.isAvailable,
      },
    }),
  );
}

export async function getDriverCurrentTrip(): Promise<ActiveTrip | null> {
  const dashboard = await getDriverDashboard(null);
  return dashboard.activeTrip;
}

export async function getDriverCurrentLocation(rideId: string | null): Promise<Coordinate | null> {
  if (!rideId) {
    return null;
  }
  const live = await getLiveRideState(rideId);
  return toCoordinate(live?.driver_location);
}

export async function submitDriverLocation(payload: { rideId?: string | null; latitude: number; longitude: number; heading?: number | null }) {
  return unwrap(
    await apiRequest<ApiEnvelope<{ driver_id: string; ride_id?: string | null; recorded_at: string }>>("/tracking/location", {
      method: "POST",
      body: {
        ride_id: payload.rideId ?? null,
        latitude: payload.latitude,
        longitude: payload.longitude,
        heading: payload.heading ?? null,
      },
    }),
  );
}

export async function acceptDriverOffer(offerId: string) {
  return unwrap(
    await apiRequest<ApiEnvelope<{ offer_id: string; ride_id: string; offer_status: string; ride_status: string }>>(`/driver/offers/${offerId}/accept`, {
      method: "POST",
      headers: {
        "Idempotency-Key": createIdempotencyKey(`offer-accept-${offerId}`),
      },
    }),
  );
}

export async function rejectDriverOffer(offerId: string, reason = "Declined from driver dashboard") {
  return unwrap(
    await apiRequest<ApiEnvelope<{ offer_id: string; offer_status: string }>>(`/driver/offers/${offerId}/reject`, {
      method: "POST",
      body: { reason },
    }),
  );
}

export async function markDriverEnRoute(rideId: string) {
  return unwrap(
    await apiRequest<ApiEnvelope<{ ride_id: string; status: string }>>(`/rides/${rideId}/driver-en-route`, {
      method: "POST",
    }),
  );
}

export async function markDriverArrived(rideId: string) {
  return unwrap(
    await apiRequest<ApiEnvelope<{ ride_id: string; status: string }>>(`/rides/${rideId}/arrived`, {
      method: "POST",
    }),
  );
}

export async function startDriverRide(rideId: string) {
  return unwrap(
    await apiRequest<ApiEnvelope<{ ride_id: string; status: string }>>(`/rides/${rideId}/start`, {
      method: "POST",
    }),
  );
}

export async function completeDriverRide(rideId: string) {
  return unwrap(
    await apiRequest<ApiEnvelope<{ ride_id: string; status: string }>>(`/rides/${rideId}/complete`, {
      method: "POST",
    }),
  );
}
