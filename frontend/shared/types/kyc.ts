export type KycOverallStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "needs_more_info"
  | "expired"
  | "suspended";

export type KycDocumentType =
  | "government_id"
  | "driver_license"
  | "insurance"
  | "vehicle_registration";

export type KycDocumentStatus =
  | "missing"
  | "uploaded"
  | "under_review"
  | "approved"
  | "rejected"
  | "expired";

export type KycDocumentItem = {
  documentType: KycDocumentType;
  documentStatus: KycDocumentStatus;
  fileName?: string | null;
  uploadedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  expiryDate?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
};

export type DriverKycStatusResponse = {
  overallStatus: KycOverallStatus;
  submittedAt?: string | null;
  lastReviewedAt?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  needsMoreInfoReason?: string | null;
  documents: KycDocumentItem[];
  missingDocuments: KycDocumentType[];
};

export type UploadKycDocumentPayload = {
  file?: File;
  fileName?: string;
  fileKey?: string;
  mimeType?: string;
  notes?: string;
};

export type AdminKycQueueItem = {
  driverUserId: string;
  driverName?: string | null;
  driverEmail?: string | null;
  overallStatus: KycOverallStatus;
  submittedAt?: string | null;
  updatedAt?: string | null;
};

export type AdminDriverKycDetail = DriverKycStatusResponse & {
  driverUserId: string;
  driverName?: string | null;
  driverEmail?: string | null;
};

export type RejectKycPayload = {
  reason: string;
  notes?: string;
};

export type MoreInfoKycPayload = {
  reason: string;
  notes?: string;
};
