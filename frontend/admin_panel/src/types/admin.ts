export type DriverStatus = 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'INACTIVE';
export type OnboardingStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'DOCS_PENDING' | 'APPROVED' | 'REJECTED';
export type RideStatus =
  | 'REQUESTED'
  | 'MATCHING'
  | 'NO_DRIVERS_FOUND'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_EN_ROUTE'
  | 'DRIVER_ARRIVED'
  | 'RIDE_STARTED'
  | 'RIDE_COMPLETED'
  | 'CANCELLED';

export interface Region {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  country: string;
  is_active: boolean;
  driver_count?: number;
  active_ride_count?: number;
}

export interface Driver {
  driver_id: string;
  user_id: string;
  first_name: string;
  last_name: string | null;
  phone_number: string | null;
  email?: string | null;
  region_id: string | null;
  region_name?: string | null;
  status: DriverStatus;
  is_approved: boolean;
  is_online: boolean;
  is_available: boolean;
  rating: number | null;
  total_rides_completed: number;
  created_at: string;
  avatar_url?: string | null;
  vehicle?: Vehicle | null;
  lat?: number | null;
  lng?: number | null;
}

export interface Vehicle {
  id: string;
  driver_id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plate_number: string;
  vehicle_type: string;
  seat_capacity: number;
  is_active: boolean;
}

export interface ActiveRide {
  ride_id: string;
  rider_name: string;
  rider_avatar?: string | null;
  driver_name: string;
  driver_avatar?: string | null;
  driver_lat?: number | null;
  driver_lng?: number | null;
  region: string;
  region_id: string;
  status: RideStatus;
  eta_minutes: number | null;
  requested_at: string;
  fare: number | null;
  product_type?: string | null;
  pickup_address?: string | null;
  dropoff_address?: string | null;
  dispatch_retry_count?: number | null;
}

export interface DashboardSummary {
  active_rides: number;
  online_drivers: number;
  matching_rides: number;
  pending_onboarding_reviews: number;
}

export interface AuditLog {
  id: string;
  created_at: string;
  admin_name?: string | null;
  admin_avatar?: string | null;
  action_type: string;
  entity_type: string;
  entity_id: string;
  details_json: Record<string, unknown> | null;
  region?: string | null;
}

export interface OnboardingQueueItem {
  driver_id: string;
  first_name: string;
  last_name: string | null;
  region_name: string | null;
  region_id: string | null;
  onboarding_status: OnboardingStatus;
  docs_uploaded: number;
  docs_total: number;
  submitted_at: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}
