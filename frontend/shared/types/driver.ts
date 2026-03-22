export type DriverUser = {
  id: string;
  email: string;
  phone_number: string;
  role: "DRIVER";
  is_active: boolean;
  is_verified: boolean;
};

export type DriverProfile = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string | null;
  phone_number: string;
  region_id: string | null;
  status: "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED" | "INACTIVE";
  is_approved: boolean;
  is_online: boolean;
  is_available: boolean;
  rating_avg: number | null;
  total_rides_completed: number;
};

export type DriverVehicle = {
  id: string;
  driver_id: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  plate_number: string;
  vehicle_type: "ECONOMY" | "COMFORT" | "PREMIUM" | "XL";
  seat_capacity: number;
  fuel_type: string | null;
  mileage_city: number | null;
  mileage_highway: number | null;
  is_active: boolean;
};

export type OnboardingProfile = {
  driver_id: string;
  region_id: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "DOCS_PENDING" | "APPROVED" | "REJECTED";
  submitted_at: string | null;
  review_started_at: string | null;
  reviewed_at: string | null;
  reviewed_by_admin_id: string | null;
  review_notes: string | null;
  rejection_reason: string | null;
};

export type DriverDocument = {
  id: string;
  driver_id: string;
  document_type: "GOVT_ID_FRONT" | "GOVT_ID_BACK" | "DRIVER_LICENSE" | "VEHICLE_REGISTRATION" | "INSURANCE" | "PROFILE_PHOTO";
  file_url: string;
  verification_status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by_admin_id: string | null;
  rejection_reason: string | null;
  metadata_json: Record<string, unknown> | null;
};

export type DriverProfileData = {
  user: DriverUser;
  profile: DriverProfile;
  vehicle: DriverVehicle | null;
  onboarding: OnboardingProfile | null;
  documents: DriverDocument[];
};

export type ViewMode = "rider" | "driver" | "admin";
