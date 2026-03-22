export type DriverStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
export type OnboardingStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'DOCS_PENDING' | 'APPROVED' | 'REJECTED';
export type DocumentType = 'GOVT_ID_FRONT' | 'GOVT_ID_BACK' | 'DRIVER_LICENSE' | 'VEHICLE_REGISTRATION' | 'INSURANCE' | 'PROFILE_PHOTO';
export type DocumentVerificationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type VehicleType = 'ECONOMY' | 'COMFORT' | 'PREMIUM' | 'XL';

export interface DriverDetail {
  id: string;
  driver_id?: string;
  user_id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone_number: string;
  region_id: string | null;
  region_name: string | null;
  status: DriverStatus;
  is_approved: boolean;
  is_online: boolean;
  is_available: boolean;
  is_active: boolean;
  is_verified: boolean;
  rating_avg: number | null;
  total_rides_completed: number;
  created_at: string;
}

export interface DriverDocument {
  id: string;
  driver_id: string;
  document_type: DocumentType;
  file_url: string | null;
  file_path?: string | null;
  original_file_name?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  document_number?: string | null;
  issuing_state?: string | null;
  issuing_country?: string | null;
  issued_at?: string | null;
  expires_at?: string | null;
  download_path?: string | null;
  verification_status: DocumentVerificationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by_admin_id: string | null;
  notes?: string | null;
  rejection_reason: string | null;
  metadata_json: Record<string, unknown> | null;
}

export interface DriverVehicle {
  id: string;
  driver_id: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  plate_number: string;
  vehicle_type: VehicleType;
  seat_capacity: number;
  fuel_type: string | null;
  mileage_city: number | null;
  mileage_highway: number | null;
  is_active: boolean;
}

export interface OnboardingProfile {
  driver_id: string;
  region_id: string;
  status: OnboardingStatus;
  submitted_at: string | null;
  review_started_at: string | null;
  reviewed_at: string | null;
  reviewed_by_admin_id: string | null;
  review_notes: string | null;
  rejection_reason: string | null;
}

export interface RideHistoryItem {
  ride_id: string;
  created_at: string;
  rider_name: string;
  region: string;
  pickup_address: string;
  dropoff_address: string;
  final_fare_amount: number | null;
  status: string;
}

export interface PayoutItem {
  id: string;
  created_at: string;
  amount: number;
  method: string;
  status: string;
}

export interface AuditLogItem {
  id: string;
  created_at: string;
  admin_name: string | null;
  action_type: string;
  entity_type: string;
  details_json: Record<string, unknown> | null;
}

export interface DriverNote {
  id: string;
  created_at: string;
  admin_name: string;
  note: string;
}

export interface ComplianceItem {
  label: string;
  status: 'PASS' | 'FAIL' | 'PENDING' | 'EXPIRED' | 'NOT_CHECKED';
  detail: string | null;
  expires_at: string | null;
}
