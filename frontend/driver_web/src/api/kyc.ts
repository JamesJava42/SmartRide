import { apiRequest } from "./client";
import type {
  DriverKycStatusResponse,
  KycDocumentItem,
  KycDocumentType,
  UploadKycDocumentPayload,
} from "@shared/types/kyc";
type ApiEnvelope<T> = {
  success?: boolean;
  message?: string | null;
  data: T;
};

type KycDocumentApi = {
  document_type?: string | null;
  documentType?: string | null;
  document_status?: string | null;
  documentStatus?: string | null;
  file_name?: string | null;
  fileName?: string | null;
  uploaded_at?: string | null;
  uploadedAt?: string | null;
  reviewed_at?: string | null;
  reviewedAt?: string | null;
  reviewed_by?: string | null;
  reviewedBy?: string | null;
  expiry_date?: string | null;
  expiryDate?: string | null;
  rejection_reason?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
};

type DriverKycStatusApi = {
  overall_status?: string | null;
  overallStatus?: string | null;
  submitted_at?: string | null;
  submittedAt?: string | null;
  last_reviewed_at?: string | null;
  lastReviewedAt?: string | null;
  approved_at?: string | null;
  approvedAt?: string | null;
  rejected_at?: string | null;
  rejectedAt?: string | null;
  rejection_reason?: string | null;
  rejectionReason?: string | null;
  needs_more_info_reason?: string | null;
  needsMoreInfoReason?: string | null;
  documents?: KycDocumentApi[];
  missing_documents?: string[] | null;
  missingDocuments?: string[] | null;
};

function normalizeOverallStatus(value: string | null | undefined): DriverKycStatusResponse["overallStatus"] {
  switch ((value ?? "draft").toLowerCase()) {
    case "submitted":
    case "under_review":
    case "approved":
    case "rejected":
    case "needs_more_info":
    case "expired":
    case "suspended":
      return value.toLowerCase() as DriverKycStatusResponse["overallStatus"];
    default:
      return "draft";
  }
}

function normalizeDocumentType(value: string | null | undefined): KycDocumentType {
  switch ((value ?? "government_id").toLowerCase()) {
    case "driver_license":
    case "insurance":
    case "vehicle_registration":
      return value.toLowerCase() as KycDocumentType;
    default:
      return "government_id";
  }
}

function normalizeDocumentStatus(value: string | null | undefined): KycDocumentItem["documentStatus"] {
  switch ((value ?? "missing").toLowerCase()) {
    case "uploaded":
    case "under_review":
    case "approved":
    case "rejected":
    case "expired":
      return value.toLowerCase() as KycDocumentItem["documentStatus"];
    default:
      return "missing";
  }
}

function mapDocument(document: KycDocumentApi): KycDocumentItem {
  return {
    documentType: normalizeDocumentType(document.documentType ?? document.document_type),
    documentStatus: normalizeDocumentStatus(document.documentStatus ?? document.document_status),
    fileName: document.fileName ?? document.file_name ?? null,
    uploadedAt: document.uploadedAt ?? document.uploaded_at ?? null,
    reviewedAt: document.reviewedAt ?? document.reviewed_at ?? null,
    reviewedBy: document.reviewedBy ?? document.reviewed_by ?? null,
    expiryDate: document.expiryDate ?? document.expiry_date ?? null,
    rejectionReason: document.rejectionReason ?? document.rejection_reason ?? null,
    notes: document.notes ?? null,
  };
}

function mapStatusResponse(payload: DriverKycStatusApi): DriverKycStatusResponse {
  return {
    overallStatus: normalizeOverallStatus(payload.overallStatus ?? payload.overall_status),
    submittedAt: payload.submittedAt ?? payload.submitted_at ?? null,
    lastReviewedAt: payload.lastReviewedAt ?? payload.last_reviewed_at ?? null,
    approvedAt: payload.approvedAt ?? payload.approved_at ?? null,
    rejectedAt: payload.rejectedAt ?? payload.rejected_at ?? null,
    rejectionReason: payload.rejectionReason ?? payload.rejection_reason ?? null,
    needsMoreInfoReason: payload.needsMoreInfoReason ?? payload.needs_more_info_reason ?? null,
    documents: (payload.documents ?? []).map(mapDocument),
    missingDocuments: ((payload.missingDocuments ?? payload.missing_documents ?? []) as string[]).map(normalizeDocumentType),
  };
}

function mapProfileFallback(payload: Record<string, unknown>): DriverKycStatusResponse {
  const rawStatus = payload.kyc_status ?? payload.kycStatus;
  const isApproved = payload.is_approved === true || payload.isApproved === true;
  return {
    overallStatus: typeof rawStatus === "string" && rawStatus.trim()
      ? normalizeOverallStatus(rawStatus)
      : isApproved
        ? "approved"
        : "draft",
    submittedAt: null,
    lastReviewedAt: null,
    approvedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    needsMoreInfoReason: null,
    documents: [],
    missingDocuments: [],
  };
}

function buildFormData(payload: UploadKycDocumentPayload): FormData {
  const formData = new FormData();
  if (payload.file) {
    formData.append("file", payload.file);
  }
  if (payload.fileName) {
    formData.append("fileName", payload.fileName);
  }
  if (payload.fileKey) {
    formData.append("fileKey", payload.fileKey);
  }
  if (payload.mimeType) {
    formData.append("mimeType", payload.mimeType);
  }
  if (payload.notes) {
    formData.append("notes", payload.notes);
  }
  return formData;
}

export async function getDriverKycStatus(): Promise<DriverKycStatusResponse> {
  const profile = await apiRequest<ApiEnvelope<Record<string, unknown>>>("/drivers/me", {
    method: "GET",
  });
  console.log("DRIVER PROFILE:", profile.data);
  return mapProfileFallback(profile.data);
}

export async function uploadDriverKycDocument(
  documentType: KycDocumentType,
  payload: UploadKycDocumentPayload,
): Promise<DriverKycStatusResponse> {
  const response = await apiRequest<ApiEnvelope<DriverKycStatusApi>>(`/driver/kyc/documents/${documentType}`, {
    method: "POST",
    body: buildFormData(payload),
  });
  return mapStatusResponse(response.data);
}

export async function updateDriverKycDocument(
  documentType: KycDocumentType,
  payload: UploadKycDocumentPayload,
): Promise<DriverKycStatusResponse> {
  const response = await apiRequest<ApiEnvelope<DriverKycStatusApi>>(`/driver/kyc/documents/${documentType}`, {
    method: "PATCH",
    body: buildFormData(payload),
  });
  return mapStatusResponse(response.data);
}

export async function submitDriverKyc(): Promise<DriverKycStatusResponse> {
  const response = await apiRequest<ApiEnvelope<DriverKycStatusApi>>("/driver/kyc/submit", {
    method: "POST",
    body: {},
  });
  return mapStatusResponse(response.data);
}
