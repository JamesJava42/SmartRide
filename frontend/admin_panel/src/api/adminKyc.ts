import { apiDataRequest } from "./client";
import type {
  AdminDriverKycDetail,
  AdminKycQueueItem,
  DriverKycStatusResponse,
  KycDocumentItem,
  KycDocumentStatus,
  KycDocumentType,
  KycOverallStatus,
  MoreInfoKycPayload,
  RejectKycPayload,
} from "@shared/types/kyc";

type UnknownRecord = Record<string, unknown>;

function toNullableString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function normalizeOverallStatus(value: unknown): KycOverallStatus {
  return (typeof value === "string" ? value : "draft") as KycOverallStatus;
}

function normalizeDocumentType(value: unknown): KycDocumentType {
  return (typeof value === "string" ? value : "government_id") as KycDocumentType;
}

function normalizeDocumentStatus(value: unknown): KycDocumentStatus {
  return (typeof value === "string" ? value : "missing") as KycDocumentStatus;
}

function mapDocumentItem(item: unknown): KycDocumentItem {
  const source = (item ?? {}) as UnknownRecord;
  return {
    documentType: normalizeDocumentType(source.documentType ?? source.document_type),
    documentStatus: normalizeDocumentStatus(source.documentStatus ?? source.document_status),
    fileName: toNullableString(source.fileName ?? source.file_name ?? source.original_filename),
    uploadedAt: toNullableString(source.uploadedAt ?? source.uploaded_at),
    reviewedAt: toNullableString(source.reviewedAt ?? source.reviewed_at),
    reviewedBy: toNullableString(source.reviewedBy ?? source.reviewed_by),
    expiryDate: toNullableString(source.expiryDate ?? source.expiry_date),
    rejectionReason: toNullableString(source.rejectionReason ?? source.rejection_reason),
    notes: toNullableString(source.notes),
  };
}

function mapDriverStatusResponse(payload: unknown): DriverKycStatusResponse {
  const source = (payload ?? {}) as UnknownRecord;
  const documentsSource = Array.isArray(source.documents) ? source.documents : [];
  const missingDocumentsSource = Array.isArray(source.missingDocuments ?? source.missing_documents)
    ? (source.missingDocuments ?? source.missing_documents)
    : [];

  return {
    overallStatus: normalizeOverallStatus(source.overallStatus ?? source.overall_status),
    submittedAt: toNullableString(source.submittedAt ?? source.submitted_at),
    lastReviewedAt: toNullableString(source.lastReviewedAt ?? source.last_reviewed_at),
    approvedAt: toNullableString(source.approvedAt ?? source.approved_at),
    rejectedAt: toNullableString(source.rejectedAt ?? source.rejected_at),
    rejectionReason: toNullableString(source.rejectionReason ?? source.rejection_reason),
    needsMoreInfoReason: toNullableString(source.needsMoreInfoReason ?? source.needs_more_info_reason),
    documents: documentsSource.map(mapDocumentItem),
    missingDocuments: missingDocumentsSource.map((item) => normalizeDocumentType(item)),
  };
}

function mapAdminKycQueueItem(item: unknown): AdminKycQueueItem {
  const source = (item ?? {}) as UnknownRecord;
  return {
    driverUserId: String(source.driverUserId ?? source.driver_user_id ?? ""),
    driverName: toNullableString(source.driverName ?? source.driver_name),
    driverEmail: toNullableString(source.driverEmail ?? source.driver_email),
    overallStatus: normalizeOverallStatus(source.overallStatus ?? source.overall_status),
    submittedAt: toNullableString(source.submittedAt ?? source.submitted_at),
    updatedAt: toNullableString(source.updatedAt ?? source.updated_at),
  };
}

function mapAdminDriverKycDetail(payload: unknown): AdminDriverKycDetail {
  const source = (payload ?? {}) as UnknownRecord;
  const status = mapDriverStatusResponse(payload);
  return {
    ...status,
    driverUserId: String(source.driverUserId ?? source.driver_user_id ?? ""),
    driverName: toNullableString(source.driverName ?? source.driver_name),
    driverEmail: toNullableString(source.driverEmail ?? source.driver_email),
  };
}

export async function getAdminKycQueue(): Promise<AdminKycQueueItem[]> {
  const response = await apiDataRequest<unknown>("/admin/kyc/drivers");
  if (Array.isArray(response)) {
    return response.map(mapAdminKycQueueItem);
  }

  const source = (response ?? {}) as UnknownRecord;
  const items = Array.isArray(source.items) ? source.items : [];
  return items.map(mapAdminKycQueueItem);
}

export async function getAdminDriverKycDetail(driverUserId: string): Promise<AdminDriverKycDetail> {
  const response = await apiDataRequest<unknown>(`/admin/kyc/drivers/${driverUserId}`);
  return mapAdminDriverKycDetail(response);
}

export async function approveDriverKyc(driverUserId: string): Promise<AdminDriverKycDetail> {
  const response = await apiDataRequest<unknown>(`/admin/kyc/drivers/${driverUserId}/approve`, {
    method: "POST",
  });
  return mapAdminDriverKycDetail(response);
}

export async function rejectDriverKyc(
  driverUserId: string,
  payload: RejectKycPayload,
): Promise<AdminDriverKycDetail> {
  const response = await apiDataRequest<unknown>(`/admin/kyc/drivers/${driverUserId}/reject`, {
    method: "POST",
    body: payload,
  });
  return mapAdminDriverKycDetail(response);
}

export async function requestMoreInfoDriverKyc(
  driverUserId: string,
  payload: MoreInfoKycPayload,
): Promise<AdminDriverKycDetail> {
  const response = await apiDataRequest<unknown>(
    `/admin/kyc/drivers/${driverUserId}/request-more-info`,
    {
      method: "POST",
      body: payload,
    },
  );
  return mapAdminDriverKycDetail(response);
}
