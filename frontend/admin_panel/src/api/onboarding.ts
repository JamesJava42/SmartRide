import type { RegionRecord } from './admin';
import { apiDataRequest, buildAuthenticatedApiUrl } from './client';
import {
  buildTimelineStatus,
  documentCategory,
  DOC_LABELS,
  getDriverDisplayName,
  getExpiryDate,
  getInitials,
  normalizeMetadata,
  REQUIRED_DOC_TYPES,
  verificationActionSummary,
} from '../utils/onboarding';
import type {
  DocumentType,
  DriverDocument,
  DriverReviewData,
  DriverStatus,
  OnboardingActivityItem,
  OnboardingDocument,
  OnboardingNote,
  OnboardingQueueItem,
  OnboardingQueueParams,
  OnboardingStatus,
  QueueResponse,
  VerificationStatus,
} from '../types/onboarding';

export type CreateDriverPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  region_id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number | '';
  vehicle_color: string;
  vehicle_class: string;
  vehicle_license_plate: string;
  vehicle_mpg?: string;
};

type CreateDriverResponse = {
  driver_id: string;
  driver_name: string;
  region_name: string;
  status: string;
  driver_email?: string;
};

type BackendQueueItem = {
  driver_id: string;
  driver_name: string;
  phone_number: string;
  region_name: string;
  driver_status: string;
  is_approved: boolean;
  doc_submitted_count: number;
  doc_approved_count: number;
  status: string;
  submitted_at: string | null;
};

type BackendQueueResponse = {
  items: BackendQueueItem[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

type BackendVehicle = {
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

type BackendOnboarding = {
  driver_id: string;
  region_id: string | null;
  status: string;
  submitted_at: string | null;
  review_started_at: string | null;
  reviewed_at: string | null;
  reviewed_by_admin_id: string | null;
  review_notes: string | null;
  rejection_reason: string | null;
};

type BackendDocument = {
  id: string;
  driver_id: string;
  document_type: string;
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
  verification_status: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by_admin_id: string | null;
  notes?: string | null;
  rejection_reason: string | null;
  metadata_json: Record<string, unknown> | null;
};

type BackendDriverDetail = {
  driver_id: string;
  user_id?: string | null;
  first_name: string;
  last_name: string | null;
  phone_number: string;
  region_id: string | null;
  status: string;
  is_approved: boolean;
  is_online: boolean;
  is_available: boolean;
  rating_avg: number | null;
  total_rides_completed: number;
  created_at: string | null;
  vehicle: BackendVehicle | null;
  onboarding: BackendOnboarding | null;
  documents: BackendDocument[];
};

type BackendOnboardingDetail = {
  driver_id: string;
  driver_name: string;
  driver_email: string;
  region_name: string;
  status: string;
  review_notes: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
};

function normalizeStatus(value: string | null | undefined): OnboardingStatus {
  const normalized = (value ?? 'SUBMITTED').toUpperCase();
  if (normalized === 'DOCS_PENDING') return 'DOCS_PENDING';
  if (normalized === 'UNDER_REVIEW') return 'UNDER_REVIEW';
  if (normalized === 'APPROVED') return 'APPROVED';
  if (normalized === 'REJECTED') return 'REJECTED';
  if (normalized === 'NEEDS_INFO') return 'NEEDS_INFO';
  if (normalized === 'DRAFT') return 'DRAFT';
  return 'SUBMITTED';
}

function normalizeDriverStatus(value: string | null | undefined): DriverStatus {
  const normalized = (value ?? 'PENDING_APPROVAL').toUpperCase();
  if (normalized === 'ACTIVE') return 'ACTIVE';
  if (normalized === 'SUSPENDED') return 'SUSPENDED';
  if (normalized === 'INACTIVE') return 'INACTIVE';
  return 'PENDING_APPROVAL';
}

function normalizeVerificationStatus(value: string | null | undefined): VerificationStatus {
  const normalized = (value ?? 'SUBMITTED').toUpperCase();
  if (normalized === 'APPROVED') return 'APPROVED';
  if (normalized === 'REJECTED') return 'REJECTED';
  if (normalized === 'UNDER_REVIEW') return 'UNDER_REVIEW';
  if (normalized === 'REUPLOAD_REQUESTED') return 'REUPLOAD_REQUESTED';
  if (normalized === 'MISSING') return 'MISSING';
  return 'SUBMITTED';
}

function normalizeQueueItem(item: BackendQueueItem): OnboardingQueueItem {
  const driverName = getDriverDisplayName({ driver_name: item.driver_name });
  const [firstName, ...rest] = driverName.split(' ');

  return {
    driver_id: item.driver_id,
    driver_name: driverName,
    driver_initials: getInitials(driverName),
    first_name: firstName || driverName,
    last_name: rest.length > 0 ? rest.join(' ') : null,
    email: null,
    phone_number: item.phone_number ?? '',
    region_id: null,
    region_name: item.region_name || 'Unassigned Region',
    onboarding_status: normalizeStatus(item.status),
    driver_status: normalizeDriverStatus(item.driver_status),
    is_approved: item.is_approved ?? false,
    doc_submitted_count: item.doc_submitted_count ?? 0,
    doc_approved_count: item.doc_approved_count ?? 0,
    docs_total: REQUIRED_DOC_TYPES.length,
    submitted_at: item.submitted_at ?? null,
    status: normalizeStatus(item.status),
  };
}

function normalizeDocument(raw: BackendDocument, labelOverride?: string): OnboardingDocument {
  const metadata = normalizeMetadata(raw.metadata_json);
  const type = raw.document_type as DocumentType;
  const status = normalizeVerificationStatus(raw.verification_status);
  return {
    id: raw.id,
    driver_id: raw.driver_id,
    type,
    label: labelOverride ?? DOC_LABELS[type],
    category: documentCategory(type),
    status,
    file_url: raw.file_url || (raw.download_path ? buildAuthenticatedApiUrl(raw.download_path) : null),
    file_path: raw.file_path ?? null,
    original_file_name: raw.original_file_name ?? null,
    mime_type: raw.mime_type ?? null,
    file_size: raw.file_size ?? null,
    document_number: raw.document_number ?? null,
    issuing_state: raw.issuing_state ?? null,
    issuing_country: raw.issuing_country ?? null,
    issued_at: raw.issued_at ?? null,
    expires_at: raw.expires_at ?? null,
    download_path: raw.download_path ?? null,
    uploaded_at: raw.submitted_at,
    reviewed_at: raw.reviewed_at,
    reviewed_by_admin_id: raw.reviewed_by_admin_id,
    notes: raw.notes ?? null,
    rejection_reason: raw.rejection_reason,
    action_summary: verificationActionSummary(status, raw.rejection_reason),
    expiry_date: getExpiryDate(metadata, raw.expires_at ?? null),
    metadata,
    is_missing: false,
  };
}

function buildMissingDocument(driverId: string, type: DocumentType): OnboardingDocument {
  return {
    id: `missing-${type.toLowerCase()}`,
    driver_id: driverId,
    type,
    label: DOC_LABELS[type],
    category: documentCategory(type),
    status: 'MISSING',
    file_url: null,
    file_path: null,
    original_file_name: null,
    mime_type: null,
    file_size: null,
    document_number: null,
    issuing_state: null,
    issuing_country: null,
    issued_at: null,
    expires_at: null,
    download_path: null,
    uploaded_at: null,
    reviewed_at: null,
    reviewed_by_admin_id: null,
    notes: null,
    rejection_reason: null,
    action_summary: 'Missing from application',
    expiry_date: null,
    metadata: {},
    is_missing: true,
  };
}

function mergeDocuments(driverId: string, documents: BackendDocument[]): OnboardingDocument[] {
  const byType = new Map<DocumentType, BackendDocument>();
  for (const document of documents) {
    byType.set(document.document_type as DocumentType, document);
  }

  return REQUIRED_DOC_TYPES.map((type) => {
    const existing = byType.get(type);
    return existing ? normalizeDocument(existing, DOC_LABELS[type]) : buildMissingDocument(driverId, type);
  });
}

function buildActivity(detail: DriverReviewData): OnboardingActivityItem[] {
  const items: OnboardingActivityItem[] = [];

  items.push({
    id: 'account-created',
    type: 'status_change',
    title: 'Driver account created',
    description: 'Profile record was created in the operations system.',
    timestamp: detail.created_at,
  });

  if (detail.onboarding?.submitted_at) {
    items.push({
      id: 'application-submitted',
      type: 'status_change',
      title: 'Application submitted',
      description: 'Driver submitted onboarding application for admin review.',
      timestamp: detail.onboarding.submitted_at,
      tone: 'warning',
    });
  }

  if (detail.onboarding?.review_started_at) {
    items.push({
      id: 'review-started',
      type: 'review_action',
      title: 'Review started',
      description: 'Admin opened the application and began document review.',
      timestamp: detail.onboarding.review_started_at,
    });
  }

  for (const document of detail.normalized_documents.filter((entry) => !entry.is_missing)) {
    items.push({
      id: `document-${document.id}`,
      type: 'document_upload',
      title: `${document.label} uploaded`,
      description: document.action_summary,
      timestamp: document.uploaded_at,
      tone:
        document.status === 'APPROVED'
          ? 'success'
          : document.status === 'REJECTED'
            ? 'danger'
            : 'default',
    });
  }

  if (detail.review_notes) {
    items.push({
      id: 'review-note',
      type: 'note',
      title: 'Internal note added',
      description: detail.review_notes,
      timestamp: detail.onboarding?.reviewed_at ?? detail.onboarding?.review_started_at ?? detail.created_at,
    });
  }

  if (detail.onboarding?.reviewed_at) {
    items.push({
      id: 'review-complete',
      type: 'review_action',
      title:
        detail.onboarding.status === 'APPROVED'
          ? 'Application approved'
          : detail.onboarding.status === 'REJECTED'
            ? 'Application rejected'
            : detail.onboarding.status === 'NEEDS_INFO'
              ? 'More info requested'
              : 'Application reviewed',
      description:
        detail.onboarding.rejection_reason ||
        detail.onboarding.review_notes ||
        'Decision recorded on the onboarding application.',
      timestamp: detail.onboarding.reviewed_at,
      tone:
        detail.onboarding.status === 'APPROVED'
          ? 'success'
          : detail.onboarding.status === 'REJECTED'
            ? 'danger'
            : 'warning',
    });
  }

  return items
    .filter((item) => item.timestamp)
    .sort((left, right) => {
      const leftTime = left.timestamp ? new Date(left.timestamp).getTime() : 0;
      const rightTime = right.timestamp ? new Date(right.timestamp).getTime() : 0;
      return rightTime - leftTime;
    });
}

function buildRiskSignals(detail: DriverReviewData) {
  const identityDocs = detail.normalized_documents.filter((document) => document.category === 'identity');
  const licenseDoc = detail.normalized_documents.find((document) => document.type === 'DRIVER_LICENSE');
  const vehicleDoc = detail.normalized_documents.find((document) => document.type === 'VEHICLE_REGISTRATION');
  const insuranceDoc = detail.normalized_documents.find((document) => document.type === 'INSURANCE');

  const signals = [
    {
      id: 'background-check',
      label: 'Background check',
      status: detail.onboarding?.status === 'APPROVED' ? 'complete' : 'pending',
      detail: detail.onboarding?.status === 'APPROVED' ? 'Cleared during onboarding review' : 'Awaiting admin decision',
    },
    {
      id: 'identity',
      label: 'Identity verification',
      status: identityDocs.every((document) => document.status === 'APPROVED')
        ? 'complete'
        : identityDocs.some((document) => document.status === 'REJECTED' || document.status === 'MISSING')
          ? 'flagged'
          : 'pending',
      detail: `${identityDocs.filter((document) => document.status === 'APPROVED').length}/${identityDocs.length} identity docs approved`,
    },
    {
      id: 'license',
      label: 'License uploaded',
      status: !licenseDoc || licenseDoc.status === 'MISSING'
        ? 'missing'
        : licenseDoc.status === 'APPROVED'
          ? 'complete'
          : licenseDoc.status === 'REJECTED'
            ? 'flagged'
            : 'pending',
      detail: licenseDoc?.action_summary ?? 'License file missing',
    },
    {
      id: 'vehicle',
      label: 'Vehicle docs uploaded',
      status: !vehicleDoc || vehicleDoc.status === 'MISSING'
        ? 'missing'
        : vehicleDoc.status === 'APPROVED'
          ? 'complete'
          : vehicleDoc.status === 'REJECTED'
            ? 'flagged'
            : 'pending',
      detail: vehicleDoc?.action_summary ?? 'Vehicle registration missing',
    },
    {
      id: 'insurance',
      label: 'Insurance uploaded',
      status: !insuranceDoc || insuranceDoc.status === 'MISSING'
        ? 'missing'
        : insuranceDoc.status === 'APPROVED'
          ? 'complete'
          : insuranceDoc.status === 'REJECTED'
            ? 'flagged'
            : 'pending',
      detail: insuranceDoc?.action_summary ?? 'Insurance proof missing',
    },
  ] as DriverReviewData['risk_signals'];

  return signals;
}

function buildReviewDetail(
  driverId: string,
  driver: BackendDriverDetail,
  detail: BackendOnboardingDetail | null,
  regions: RegionRecord[] = []
): DriverReviewData {
  const fullName = getDriverDisplayName({
    full_name: detail?.driver_name ?? null,
    first_name: driver.first_name,
    last_name: driver.last_name,
    email: detail?.driver_email ?? null,
  });

  const regionName =
    detail?.region_name ||
    regions.find((region) => region.id === driver.region_id)?.name ||
    'Unassigned Region';

  const onboardingStatus = normalizeStatus(detail?.status ?? driver.onboarding?.status);
  const mergedOnboarding = {
    driver_id: driver.driver_id,
    region_id: driver.onboarding?.region_id ?? driver.region_id ?? null,
    status: onboardingStatus,
    submitted_at: detail?.submitted_at ?? driver.onboarding?.submitted_at ?? null,
    review_started_at: driver.onboarding?.review_started_at ?? null,
    reviewed_at: detail?.reviewed_at ?? driver.onboarding?.reviewed_at ?? null,
    reviewed_by_admin_id: driver.onboarding?.reviewed_by_admin_id ?? null,
    review_notes: detail?.review_notes ?? driver.onboarding?.review_notes ?? null,
    rejection_reason: detail?.rejection_reason ?? driver.onboarding?.rejection_reason ?? null,
  };

  const normalizedDocuments = mergeDocuments(driver.driver_id, driver.documents ?? []);
  const docsSubmittedCount = normalizedDocuments.filter((document) => !document.is_missing).length;
  const docsApprovedCount = normalizedDocuments.filter((document) => document.status === 'APPROVED').length;
  const missingDocuments = normalizedDocuments
    .filter((document) => document.is_missing)
    .map((document) => document.label);

  const reviewData: DriverReviewData = {
    driver_id: driver.driver_id,
    user_id: driver.user_id ?? null,
    first_name: driver.first_name,
    last_name: driver.last_name,
    full_name: fullName,
    email: detail?.driver_email ?? null,
    phone_number: driver.phone_number ?? '—',
    region_id: driver.region_id ?? null,
    region_name: regionName,
    status: normalizeDriverStatus(driver.status),
    is_approved: driver.is_approved ?? false,
    is_online: driver.is_online ?? false,
    is_available: driver.is_available ?? false,
    rating_avg: driver.rating_avg ?? null,
    total_rides_completed: driver.total_rides_completed ?? 0,
    created_at: driver.created_at ?? null,
    member_since: driver.created_at ?? null,
    avatar_initials: getInitials(fullName),
    vehicle: driver.vehicle
      ? {
          id: driver.vehicle.id,
          driver_id: driver.vehicle.driver_id,
          make: driver.vehicle.make,
          model: driver.vehicle.model,
          year: driver.vehicle.year,
          color: driver.vehicle.color ?? null,
          plate_number: driver.vehicle.plate_number,
          vehicle_type: driver.vehicle.vehicle_type,
          seat_capacity: driver.vehicle.seat_capacity,
          is_active: driver.vehicle.is_active,
        }
      : null,
    onboarding: mergedOnboarding,
    documents: (driver.documents ?? []).map((document) => ({
      id: document.id,
      driver_id: document.driver_id,
      document_type: document.document_type as DocumentType,
      file_url: document.file_url,
      file_path: document.file_path ?? null,
      original_file_name: document.original_file_name ?? null,
      mime_type: document.mime_type ?? null,
      file_size: document.file_size ?? null,
      document_number: document.document_number ?? null,
      issuing_state: document.issuing_state ?? null,
      issuing_country: document.issuing_country ?? null,
      issued_at: document.issued_at ?? null,
      expires_at: document.expires_at ?? null,
      download_path: document.download_path ?? null,
      verification_status: normalizeVerificationStatus(document.verification_status),
      submitted_at: document.submitted_at,
      reviewed_at: document.reviewed_at,
      reviewed_by_admin_id: document.reviewed_by_admin_id,
      notes: document.notes ?? null,
      rejection_reason: document.rejection_reason,
      metadata_json: document.metadata_json ?? null,
    })),
    normalized_documents: normalizedDocuments,
    timeline: [
      {
        id: 'submitted',
        label: 'Submitted',
        timestamp: mergedOnboarding.submitted_at,
        state: buildTimelineStatus(onboardingStatus, 'submitted'),
      },
      {
        id: 'review-started',
        label: 'Review Started',
        timestamp: mergedOnboarding.review_started_at,
        state: buildTimelineStatus(onboardingStatus, 'review_started'),
      },
      {
        id: 'reviewed',
        label: 'Reviewed',
        timestamp: mergedOnboarding.reviewed_at,
        state: buildTimelineStatus(onboardingStatus, 'reviewed'),
      },
      {
        id: 'approved',
        label: onboardingStatus === 'REJECTED' ? 'Decision' : 'Approved',
        timestamp: mergedOnboarding.reviewed_at,
        state: buildTimelineStatus(onboardingStatus, 'approved'),
      },
    ],
    activity: [],
    notes: mergedOnboarding.review_notes
      ? [
          {
            id: 'latest-note',
            body: mergedOnboarding.review_notes,
            created_at: mergedOnboarding.reviewed_at ?? mergedOnboarding.review_started_at,
            author_name: 'Admin',
          },
        ]
      : [],
    review_notes: mergedOnboarding.review_notes,
    missing_documents: missingDocuments,
    risk_signals: [],
    compliance_flags_count: 0,
    docs_submitted_count: docsSubmittedCount,
    docs_approved_count: docsApprovedCount,
    docs_total: REQUIRED_DOC_TYPES.length,
    emergency_contact:
      typeof normalizedDocuments.find((document) => document.metadata.emergency_contact)?.metadata
        ?.emergency_contact === 'string'
        ? (normalizedDocuments.find((document) => document.metadata.emergency_contact)?.metadata
            .emergency_contact as string)
        : null,
    address:
      typeof normalizedDocuments.find((document) => document.metadata.address)?.metadata.address === 'string'
        ? (normalizedDocuments.find((document) => document.metadata.address)?.metadata.address as string)
        : null,
    language:
      typeof normalizedDocuments.find((document) => document.metadata.language)?.metadata.language === 'string'
        ? (normalizedDocuments.find((document) => document.metadata.language)?.metadata.language as string)
        : null,
  };

  reviewData.activity = buildActivity(reviewData);
  reviewData.risk_signals = buildRiskSignals(reviewData);
  reviewData.compliance_flags_count = reviewData.risk_signals.filter(
    (signal) => signal.status === 'missing' || signal.status === 'flagged'
  ).length;

  return reviewData;
}

function matchesSearch(item: OnboardingQueueItem, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return [
    item.driver_name,
    item.email ?? '',
    item.phone_number,
    item.region_name,
    item.driver_id,
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalizedQuery);
}

export async function createDriver(
  payload: CreateDriverPayload
): Promise<{ driver_id: string; driver_name: string; region_name: string; status: string }> {
  const raw = await apiDataRequest<CreateDriverResponse>('/admin/drivers', {
    method: 'POST',
    body: payload,
  });
  return {
    driver_id: raw.driver_id,
    driver_name: raw.driver_name,
    region_name: raw.region_name,
    status: raw.status,
  };
}

export async function getOnboardingQueue(
  params: OnboardingQueueParams = {}
): Promise<QueueResponse> {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.page) query.set('page', String(params.page));
  if (params.page_size) query.set('page_size', String(params.page_size));

  const path = `/admin/onboarding/queue${query.toString() ? `?${query.toString()}` : ''}`;
  const raw = await apiDataRequest<BackendQueueResponse>(path, { method: 'GET' });

  let items = (raw.items ?? []).map(normalizeQueueItem);

  if (params.region) {
    items = items.filter((item) => item.region_id === params.region || item.region_name === params.region);
  }
  if (params.search) {
    items = items.filter((item) => matchesSearch(item, params.search ?? ''));
  }

  return {
    items,
    pagination: raw.pagination ?? {
      page: 1,
      page_size: 20,
      total_items: items.length,
      total_pages: 1,
    },
  };
}

export async function getOnboardingById(
  driverId: string,
  regions: RegionRecord[] = []
): Promise<DriverReviewData> {
  const [driver, onboardingDetail] = await Promise.all([
    apiDataRequest<BackendDriverDetail>(`/admin/drivers/${driverId}`, { method: 'GET' }),
    apiDataRequest<BackendOnboardingDetail>(`/admin/onboarding/${driverId}`, { method: 'GET' }).catch(
      () => null
    ),
  ]);

  return buildReviewDetail(driverId, driver, onboardingDetail, regions);
}

export async function getDriverReview(
  driverId: string,
  regions: RegionRecord[] = []
): Promise<DriverReviewData> {
  return getOnboardingById(driverId, regions);
}

export async function saveOnboardingNote(
  driverId: string,
  payload: { review_notes: string }
): Promise<void> {
  await apiDataRequest(`/admin/onboarding/${driverId}/notes`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function saveReviewNotes(driverId: string, notes: string): Promise<void> {
  await saveOnboardingNote(driverId, { review_notes: notes });
}

export async function approveDriverOnboarding(
  driverId: string,
  payload: { review_notes?: string | null }
): Promise<void> {
  await apiDataRequest(`/admin/onboarding/${driverId}/approve`, {
    method: 'POST',
    body: { review_notes: payload.review_notes ?? null },
  });
}

export async function approveOnboarding(
  driverId: string,
  notes: string | null
): Promise<void> {
  await approveDriverOnboarding(driverId, { review_notes: notes });
}

export async function rejectDriverOnboarding(
  driverId: string,
  payload: { rejection_reason: string }
): Promise<void> {
  await apiDataRequest(`/admin/onboarding/${driverId}/reject`, {
    method: 'POST',
    body: payload,
  });
}

export async function rejectOnboarding(driverId: string, reason: string): Promise<void> {
  await rejectDriverOnboarding(driverId, { rejection_reason: reason });
}

export async function requestDriverMoreInfo(
  driverId: string,
  payload: { notes: string }
): Promise<void> {
  await apiDataRequest(`/admin/onboarding/${driverId}/request-info`, {
    method: 'POST',
    body: payload,
  });
}

export async function requestMoreInfo(driverId: string, notes: string): Promise<void> {
  await requestDriverMoreInfo(driverId, { notes });
}

export async function approveOnboardingDocument(
  _driverId: string,
  documentId: string,
  _payload?: Record<string, never>
): Promise<void> {
  await apiDataRequest(`/admin/documents/${documentId}/approve`, { method: 'POST' });
}

export async function approveDocument(documentId: string): Promise<void> {
  await approveOnboardingDocument('', documentId);
}

export async function rejectOnboardingDocument(
  _driverId: string,
  documentId: string,
  payload: { rejection_reason: string }
): Promise<void> {
  await apiDataRequest(`/admin/documents/${documentId}/reject`, {
    method: 'POST',
    body: payload,
  });
}

export async function rejectDocument(documentId: string, reason: string): Promise<void> {
  await rejectOnboardingDocument('', documentId, { rejection_reason: reason });
}

export async function requestOnboardingDocumentReupload(
  _driverId: string,
  documentId: string,
  payload: { notes?: string }
): Promise<void> {
  await apiDataRequest(`/admin/documents/${documentId}/reject`, {
    method: 'POST',
    body: { rejection_reason: payload.notes || 'Reupload requested by admin' },
  });
}

export async function markDocumentUnderReview(_documentId: string): Promise<void> {
  return Promise.resolve();
}

export type { OnboardingQueueItem };
