export type RideMode = "ride" | "reserve" | "courier" | "hourly";
export type RiderType = "self" | "someone_else";
export type RideUiState =
  | "idle"
  | "route_ready"
  | "estimate_ready"
  | "ride_selected"
  | "requesting"
  | "matching"
  | "driver_assigned"
  | "driver_arriving"
  | "ride_started"
  | "ride_completed";

export interface User {
  id: string;
  user_id?: string;
  full_name: string;
  first_name?: string;
  last_name?: string | null;
  email: string;
  phone_number: string;
  role?: "rider" | "driver" | "admin";
  created_at?: string;
}

export type AuthUser = User;

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: "bearer";
  user: AuthUser;
}

export interface FareEstimate {
  fare_estimate_id: string;
  market_code?: string;
  product_code?: string;
  estimated_distance_miles: number;
  estimated_duration_minutes: number;
  currency_code?: string;
  quote_expires_at?: string;
  breakdown: {
    trip_fare: string;
    booking_fee: string;
    third_party_fees: string;
    toll_estimate: string;
    reserve_fee: string;
    discount: string;
    rider_total: string;
    driver_estimated_payout: string;
    platform_estimated_margin: string;
  };
}

export interface RideResponse {
  ride_id: string;
  status: string;
  rider_id?: string;
  driver_id?: string | null;
  pickup_lat?: string;
  pickup_lng?: string;
  destination_lat?: string;
  destination_lng?: string;
  pickup_address?: string;
  dropoff_address?: string;
  ride_type?: string;
  assigned_at?: string | null;
  driver_arrived_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  requested_at?: string | null;
}

export interface RideTracking {
  ride_id: string;
  ride_status: string;
  driver_lat: string | null;
  driver_lng: string | null;
  pickup_lat: string;
  pickup_lng: string;
  destination_lat: string;
  destination_lng: string;
  eta_minutes: string | null;
  route_polyline: string | null;
}

export interface RideHistoryItem {
  ride_id: string;
  ride_request_id: string;
  status: string;
  pickup_label: string;
  destination_label: string;
  created_at: string;
  assigned_at: string | null;
  completed_at: string | null;
  fare: string | null;
  driver_name: string | null;
  vehicle_name: string | null;
  vehicle_plate: string | null;
}

export interface DriverProfile {
  id: string;
  rating_avg: string;
  total_completed_rides: number;
  is_online: boolean;
  is_available: boolean;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  color: string;
  plate_number: string;
  seat_capacity: number;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  status?: string;
  sent_at?: string | null;
  created_at?: string;
}

export interface RouteLocation {
  label: string;
  latitude: number;
  longitude: number;
}

export interface RouteData {
  pickup: RouteLocation;
  destination: RouteLocation;
  geometry: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
}

export interface CurrentLocation {
  label: string;
  latitude: number;
  longitude: number;
}

export interface RideOption {
  id: string;
  productName: string;
  descriptor: string;
  etaMinutes: number;
  price: string;
  capacity: number;
  luggage: string;
  unavailable?: boolean;
}

export interface AdminRegion {
  id: string;
  code: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  is_active?: boolean;
}

export interface AdminRegionPayload {
  code: string;
  name: string;
  city: string;
  state: string;
  country: string;
  is_active: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "OPS_ADMIN" | "ONBOARDING_ADMIN" | "REGIONAL_ADMIN";
  regions: AdminRegion[];
}

export interface AdminAuthResponse {
  access_token: string;
  token_type: "bearer";
  admin: AdminUser;
}

export interface RegionMetric {
  region_id: string;
  region_name: string;
  count: number;
}

export interface DashboardSummary {
  active_rides_now: number;
  rides_matching_now: number;
  rides_in_progress_now: number;
  drivers_online: number;
  pending_onboarding_approvals: number;
  active_rides_by_region: RegionMetric[];
  active_drivers_by_region: RegionMetric[];
}

export interface AdminLiveRide {
  ride_id: string;
  rider_name: string;
  driver_name: string | null;
  region: string;
  ride_status: string;
  pickup_lat: string;
  pickup_lng: string;
  destination_lat: string;
  destination_lng: string;
  requested_at: string;
  assigned_at: string | null;
  started_at: string | null;
  eta: number | null;
}

export interface AdminLiveMapRide {
  ride_id: string;
  region: string;
  status: string;
  pickup_lat: string;
  pickup_lng: string;
  destination_lat: string;
  destination_lng: string;
  driver_lat: string | null;
  driver_lng: string | null;
}

export interface AdminDriver {
  driver_id: string;
  name: string;
  email: string;
  region: string;
  online_status: string;
  onboarding_status: string;
  rating: string;
}

export interface DriverDocument {
  id: string;
  document_type: string;
  file_url: string;
  verification_status: string;
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

export interface AdminDriverDetail {
  driver_id: string;
  driver_name: string;
  driver_email: string;
  region: string;
  onboarding_status: string;
  review_notes: string | null;
  documents: DriverDocument[];
}

export interface AdminAuditLog {
  id: string;
  admin_email: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  details_json: Record<string, unknown>;
  created_at: string;
}

export interface AdminRegionMetrics {
  region_id: string;
  region_name: string;
  active_rides: number;
  drivers_online: number;
  pending_approvals: number;
  matching_load: number;
}

export interface AdminAlert {
  level: "green" | "amber" | "red";
  title: string;
  description: string;
}

export interface DriverOfferSummary {
  ride_id: string;
  status: string;
  offered_at: string | null;
  expires_at: string | null;
  rider_id: string;
  pickup_lat: string;
  pickup_lng: string;
  destination_lat: string;
  destination_lng: string;
  assigned_at: string | null;
  driver_arrived_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  estimated_distance_miles: string | null;
  estimated_duration_minutes: string | null;
  driver_estimated_payout: string | null;
  eta_minutes: string | null;
}

export interface DriverWorkspace {
  driver_id: string;
  driver_status: string;
  queue_count: number;
  pending_offer: DriverOfferSummary | null;
  current_ride: DriverOfferSummary | null;
}
