export type RideMode = "ride" | "reserve" | "courier" | "hourly";
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
  estimated_distance_miles: number;
  estimated_duration_minutes: number;
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
  driver?: {
    id: string;
    first_name: string;
    last_name?: string | null;
    rating_avg?: string | number | null;
  } | null;
  vehicle?: {
    make: string;
    model: string;
    plate_number: string;
    vehicle_type?: string;
    color?: string | null;
  } | null;
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
  estimated_distance_miles?: number | null;
  estimated_duration_minutes?: number | null;
  actual_distance_miles?: number | null;
  actual_duration_minutes?: number | null;
  final_fare_amount?: string | null;
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
  route_geometry: Array<{ latitude: number; longitude: number }>;
  route_distance_meters: number | null;
  route_duration_seconds: number | null;
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
