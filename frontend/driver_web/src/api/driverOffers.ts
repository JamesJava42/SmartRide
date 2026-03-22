import { apiRequest } from "./client";
import type { RideOffer } from "../types/driverOperations";

type ApiEnvelope<T> = { data?: T } & T;
type UnknownRecord = Record<string, unknown>;

function unwrap<T>(payload: ApiEnvelope<T>): T {
  if (payload && typeof payload === "object" && "data" in payload && payload.data !== undefined) {
    return payload.data as T;
  }
  return payload as T;
}

function createIdempotencyKey(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeStatus(value: unknown): RideOffer["status"] {
  const normalized = String(value ?? "PENDING").toUpperCase();
  if (normalized === "ACCEPTED" || normalized === "REJECTED" || normalized === "EXPIRED") {
    return normalized;
  }
  return "PENDING";
}

function mapOffer(payload: unknown): RideOffer {
  const source = (payload ?? {}) as UnknownRecord;
  return {
    offer_id: toString(source.offer_id ?? source.offerId ?? source.id),
    ride_id: toString(source.ride_id ?? source.rideId),
    status: normalizeStatus(source.status ?? source.offer_status),
    vehicle_type: toString(source.vehicle_type ?? source.vehicleType),
    pickup_address: toString(source.pickup_address ?? source.pickupAddress),
    pickup_latitude: toNumber(source.pickup_latitude ?? source.pickupLatitude),
    pickup_longitude: toNumber(source.pickup_longitude ?? source.pickupLongitude),
    dropoff_address: toString(source.dropoff_address ?? source.dropoffAddress),
    dropoff_longitude: toNumber(source.dropoff_longitude ?? source.dropoffLongitude),
    dropoff_latitude: toNumber(source.dropoff_latitude ?? source.dropoffLatitude),
    estimated_fare: toNumber(source.estimated_fare ?? source.estimatedFare),
    estimated_distance_km: toNumber(source.estimated_distance_km ?? source.estimatedDistanceKm),
    estimated_duration_min: toNumber(source.estimated_duration_min ?? source.estimatedDurationMin),
    expires_at: toString(source.expires_at ?? source.expiresAt),
    created_at: toString(source.created_at ?? source.createdAt),
  };
}

export async function getOffers(): Promise<RideOffer[]> {
  const response = await apiRequest<ApiEnvelope<unknown[]>>("/driver/offers/active", { method: "GET" });
  const items = unwrap(response);
  return Array.isArray(items) ? items.map(mapOffer) : [];
}

export async function acceptOffer(offerId: string): Promise<{ ride_id: string }> {
  const response = await apiRequest<ApiEnvelope<unknown>>(`/driver/offers/${offerId}/accept`, {
    method: "POST",
    headers: {
      "Idempotency-Key": createIdempotencyKey(`offer-accept-${offerId}`),
    },
  });
  const source = unwrap(response) as UnknownRecord;
  return { ride_id: toString(source.ride_id ?? source.rideId) };
}

export async function rejectOffer(offerId: string): Promise<void> {
  await apiRequest(`/driver/offers/${offerId}/reject`, {
    method: "POST",
    body: { reason: "Not available" },
  });
}
