export type DriverStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
export type OnboardingStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'DOCS_PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_INFO';
export type DocumentType =
  | 'GOVT_ID_FRONT'
  | 'GOVT_ID_BACK'
  | 'DRIVER_LICENSE'
  | 'VEHICLE_REGISTRATION'
  | 'INSURANCE'
  | 'PROFILE_PHOTO';
export type VerificationStatus =
  | 'MISSING'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'REUPLOAD_REQUESTED';

export type Vehicle = {
  id: string;
  driver_id: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  plate_number: string;
  vehicle_type: string;
  seat_capacity: number;
  is_active: boolean;
};

export type DriverDocument = {
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
  verification_status: VerificationStatus;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by_admin_id: string | null;
  notes?: string | null;
  rejection_reason: string | null;
  metadata_json: Record<string, unknown> | null;
};

export type DriverOnboardingProfile = {
  driver_id: string;
  region_id: string | null;
  status: OnboardingStatus;
  submitted_at: string | null;
  review_started_at: string | null;
  reviewed_at: string | null;
  reviewed_by_admin_id: string | null;
  review_notes: string | null;
  rejection_reason: string | null;
};

export type OnboardingQueueItem = {
  driver_id: string;
  driver_name: string;
  driver_initials: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone_number: string;
  region_id: string | null;
  region_name: string;
  onboarding_status: OnboardingStatus;
  driver_status: DriverStatus;
  is_approved: boolean;
  doc_submitted_count: number;
  doc_approved_count: number;
  docs_total: number;
  submitted_at: string | null;
  status: OnboardingStatus;
};

export type OnboardingQueueParams = {
  status?: string;
  region?: string;
  search?: string;
  page?: number;
  page_size?: number;
};

export type QueueResponse = {
  items: OnboardingQueueItem[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

export type OnboardingTimelineItem = {
  id: string;
  label: string;
  timestamp: string | null;
  state: 'complete' | 'current' | 'upcoming' | 'rejected';
};

export type OnboardingDocument = {
  id: string;
  driver_id: string;
  type: DocumentType;
  label: string;
  category: 'identity' | 'license' | 'vehicle' | 'insurance';
  status: VerificationStatus;
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
  uploaded_at: string | null;
  reviewed_at: string | null;
  reviewed_by_admin_id: string | null;
  notes?: string | null;
  rejection_reason: string | null;
  action_summary: string;
  expiry_date: string | null;
  metadata: Record<string, unknown>;
  is_missing: boolean;
};

export type OnboardingNote = {
  id: string;
  body: string;
  created_at: string | null;
  author_name: string;
};

export type OnboardingActivityItem = {
  id: string;
  type: 'status_change' | 'document_upload' | 'review_action' | 'note';
  title: string;
  description: string;
  timestamp: string | null;
  tone?: 'default' | 'success' | 'warning' | 'danger';
};

export type OnboardingRiskSignal = {
  id: string;
  label: string;
  status: 'complete' | 'pending' | 'missing' | 'flagged';
  detail: string;
};

export type DriverReviewData = {
  driver_id: string;
  user_id?: string | null;
  first_name: string;
  last_name: string | null;
  full_name: string;
  email: string | null;
  phone_number: string;
  region_id: string | null;
  region_name: string;
  status: DriverStatus;
  is_approved: boolean;
  is_online: boolean;
  is_available: boolean;
  rating_avg: number | null;
  total_rides_completed: number;
  created_at: string | null;
  member_since: string | null;
  avatar_initials: string;
  vehicle: Vehicle | null;
  onboarding: DriverOnboardingProfile | null;
  documents: DriverDocument[];
  normalized_documents: OnboardingDocument[];
  timeline: OnboardingTimelineItem[];
  activity: OnboardingActivityItem[];
  notes: OnboardingNote[];
  review_notes: string | null;
  missing_documents: string[];
  risk_signals: OnboardingRiskSignal[];
  compliance_flags_count: number;
  docs_submitted_count: number;
  docs_approved_count: number;
  docs_total: number;
  emergency_contact: string | null;
  address: string | null;
  language: string | null;
};

export type OnboardingReviewDetail = DriverReviewData;
export type QueueItem = OnboardingQueueItem;
