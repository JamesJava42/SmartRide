import type {
  DocumentType,
  DriverDocument,
  DriverReviewData,
  OnboardingDocument,
  OnboardingStatus,
  VerificationStatus,
} from '../types/onboarding';

export const REQUIRED_DOC_TYPES: DocumentType[] = [
  'GOVT_ID_FRONT',
  'GOVT_ID_BACK',
  'DRIVER_LICENSE',
  'VEHICLE_REGISTRATION',
  'INSURANCE',
  'PROFILE_PHOTO',
];

export const DOC_LABELS: Record<DocumentType, string> = {
  GOVT_ID_FRONT: 'Government ID Front',
  GOVT_ID_BACK: 'Government ID Back',
  DRIVER_LICENSE: 'Driver License',
  VEHICLE_REGISTRATION: 'Vehicle Registration',
  INSURANCE: 'Insurance',
  PROFILE_PHOTO: 'Profile Photo',
};

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export const fmtDate = formatDateTime;
export const fmtDateShort = formatDate;

export function toTitleLabel(value: string | null | undefined): string {
  if (!value) {
    return 'Unknown';
  }

  return value
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export function getDriverDisplayName(input: {
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  driver_name?: string | null;
  email?: string | null;
}): string {
  const explicit = input.full_name?.trim() || input.driver_name?.trim();
  if (explicit) {
    return explicit;
  }

  const combined = [input.first_name?.trim(), input.last_name?.trim()]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (combined) {
    return combined;
  }

  if (input.email?.includes('@')) {
    return input.email.split('@')[0];
  }

  return 'Unknown Driver';
}

export function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'RC';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function getDocumentsMap(
  documents: DriverDocument[]
): Record<DocumentType, DriverDocument | undefined> {
  const map = {} as Record<DocumentType, DriverDocument | undefined>;
  for (const type of REQUIRED_DOC_TYPES) {
    map[type] = undefined;
  }
  for (const document of documents) {
    map[document.document_type] = document;
  }
  return map;
}

export function documentCategory(type: DocumentType): OnboardingDocument['category'] {
  if (type === 'DRIVER_LICENSE') {
    return 'license';
  }
  if (type === 'VEHICLE_REGISTRATION') {
    return 'vehicle';
  }
  if (type === 'INSURANCE') {
    return 'insurance';
  }
  return 'identity';
}

export function verificationActionSummary(
  status: VerificationStatus,
  rejectionReason: string | null
): string {
  switch (status) {
    case 'APPROVED':
      return 'Approved for onboarding';
    case 'REJECTED':
      return rejectionReason || 'Rejected by admin';
    case 'UNDER_REVIEW':
      return 'Under compliance review';
    case 'SUBMITTED':
      return 'Awaiting review';
    case 'REUPLOAD_REQUESTED':
      return 'Reupload requested';
    case 'MISSING':
    default:
      return 'Missing from application';
  }
}

export function normalizeMetadata(
  metadata: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  return metadata && typeof metadata === 'object' ? metadata : {};
}

export function getExpiryDate(metadata: Record<string, unknown>, explicitExpiry?: string | null): string | null {
  if (explicitExpiry) {
    return explicitExpiry;
  }
  const keys = ['expiry_date', 'expires_at', 'expiration_date'];
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  return null;
}

export function buildTimelineStatus(
  onboardingStatus: OnboardingStatus,
  step: 'submitted' | 'review_started' | 'reviewed' | 'approved'
): 'complete' | 'current' | 'upcoming' | 'rejected' {
  const rank = {
    DRAFT: 0,
    SUBMITTED: 1,
    UNDER_REVIEW: 2,
    DOCS_PENDING: 2,
    NEEDS_INFO: 2,
    APPROVED: 4,
    REJECTED: 3,
  } as const;

  const stepRank = {
    submitted: 1,
    review_started: 2,
    reviewed: 3,
    approved: 4,
  } as const;

  if (step === 'approved' && onboardingStatus === 'REJECTED') {
    return 'rejected';
  }

  const current = rank[onboardingStatus] ?? 0;
  const target = stepRank[step];

  if (current > target) {
    return 'complete';
  }
  if (current === target) {
    return 'current';
  }
  return 'upcoming';
}

export function getApprovalReadiness(data: DriverReviewData): {
  canApprove: boolean;
  reason: string | null;
} {
  if (!data.onboarding) {
    return { canApprove: false, reason: 'No onboarding application found.' };
  }
  if (data.onboarding.status === 'APPROVED') {
    return { canApprove: false, reason: 'This driver is already approved.' };
  }
  if (data.missing_documents.length > 0) {
    return {
      canApprove: false,
      reason: `Missing required documents: ${data.missing_documents.join(', ')}.`,
    };
  }
  const pending = data.normalized_documents.filter(
    (document) => !document.is_missing && document.status !== 'APPROVED'
  );
  if (pending.length > 0) {
    return {
      canApprove: false,
      reason: 'Some submitted documents still need review.',
    };
  }
  if (!data.vehicle) {
    return { canApprove: false, reason: 'No active vehicle is attached to this application.' };
  }
  return { canApprove: true, reason: null };
}
