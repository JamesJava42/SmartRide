import { apiRequest } from "./client";
import type { ActiveRide, RideStage } from "../types/driverOperations";
import { getActiveRide } from "./driverDashboard";

type ApiEnvelope<T> = { data?: T } & T;
type UnknownRecord = Record<string, unknown>;

function unwrap<T>(payload: ApiEnvelope<T>): T {
  if (payload && typeof payload === "object" && "data" in payload && payload.data !== undefined) {
    return payload.data as T;
  }
  return payload as T;
}

function toString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapRide(payload: unknown): ActiveRide {
  const source = (payload ?? {}) as UnknownRecord;
  return {
    ride_id: toString(source.ride_id ?? source.rideId ?? source.id),
    stage: String(source.stage ?? source.status ?? "DRIVER_ASSIGNED").toUpperCase() as RideStage,
    rider_name: toString(source.rider_name ?? source.riderName, "Rider"),
    rider_phone: toString(source.rider_phone ?? source.riderPhone) || null,
    pickup_address: toString(source.pickup_address ?? source.pickupAddress),
    pickup_latitude: toNumber(source.pickup_latitude ?? source.pickupLatitude),
    pickup_longitude: toNumber(source.pickup_longitude ?? source.pickupLongitude),
    dropoff_address: toString(source.dropoff_address ?? source.dropoffAddress),
    dropoff_latitude: toNumber(source.dropoff_latitude ?? source.dropoffLatitude),
    dropoff_longitude: toNumber(source.dropoff_longitude ?? source.dropoffLongitude),
    vehicle_type: toString(source.vehicle_type ?? source.vehicleType),
    seats: toNumber(source.seats, 4),
    fare_amount: toNumber(source.fare_amount ?? source.fareAmount),
    started_at: toString(source.started_at ?? source.startedAt) || null,
    eta_minutes: source.eta_minutes == null && source.etaMinutes == null ? null : toNumber(source.eta_minutes ?? source.etaMinutes),
  };
}

export { getActiveRide };

export async function updateRideStage(rideId: string, stage: RideStage): Promise<ActiveRide> {
  const path =
    stage === "DRIVER_ARRIVED"
      ? `/rides/${rideId}/arrived`
      : stage === "RIDE_STARTED"
        ? `/rides/${rideId}/start`
        : stage === "RIDE_COMPLETED"
          ? `/rides/${rideId}/complete`
          : `/rides/${rideId}/driver-en-route`;

  const response = await apiRequest<ApiEnvelope<unknown>>(path, {
    method: "POST",
    body: stage === "RIDE_COMPLETED" ? {} : undefined,
  });

  const source = unwrap(response) as UnknownRecord;
  const latestRide = await getActiveRide();

  if (latestRide) {
    return latestRide;
  }

  return mapRide({
    ride_id: toString(source.ride_id ?? rideId),
    status: source.status ?? stage,
  });
}

export async function cancelRide(rideId: string): Promise<void> {
  await apiRequest(`/rides/${rideId}/cancel`, {
    method: "POST",
    body: { cancel_reason: "Cancelled by driver" },
  });
}
