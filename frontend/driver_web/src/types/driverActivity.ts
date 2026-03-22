export type DriverRideStatus = "RIDE_COMPLETED" | "CANCELLED" | "RIDE_STARTED";

export interface DriverRideHistory {
  ride_id: string;
  status: DriverRideStatus;
  pickup_address: string;
  dropoff_address: string;
  vehicle_type: string;
  plate_number: string;
  rider_name: string;
  fare_amount: number | null;
  tip_amount: number | null;
  bonus_amount: number | null;
  payout_amount: number | null;
  payment_method: string;
  duration_minutes: number | null;
  distance_km: number | null;
  rider_rating: number | null;
  rider_comment: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface DriverActivitySummary {
  total_rides: number;
  total_earned: number;
  average_rating: number;
  average_distance_km: number;
  currency: string;
}

export interface DriverActivityResponse {
  rides: DriverRideHistory[];
  summary: DriverActivitySummary;
  total_count: number;
}

export interface DriverEarnings {
  total_payout: number;
  ride_fares: number;
  tips: number;
  bonuses: number;
  platform_fee: number;
  ride_count: number;
  period_start: string;
  period_end: string;
  next_payout_date: string;
  daily_breakdown: { date: string; amount: number }[];
}

export interface DriverPerformance {
  average_rating: number;
  total_ratings: number;
  rating_breakdown: Record<"1" | "2" | "3" | "4" | "5", number>;
  acceptance_rate: number;
  completion_rate: number;
  cancellation_rate: number;
  average_response_time_seconds: number;
  online_hours_this_week: number;
}
