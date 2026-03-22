import { apiRequest, apiDataRequest, buildAuthenticatedApiUrl } from './client';
import type {
  DriverDetail, DriverDocument, DriverVehicle, OnboardingProfile,
  RideHistoryItem, PayoutItem, AuditLogItem, DriverNote, ComplianceItem
} from '../types/driver';

// ─── Legacy exports (used by old code) ────────────────────────────────────────

export type DriverStats = {
  total_rides: number;
  total_completed_rides: number;
  total_miles: number;
  total_payout: number;
  today_payout: number;
  week_payout: number;
  month_payout: number;
  total_online_hours: number;
};

export type LegacyRideHistoryItem = {
  ride_id: string;
  pickup_address: string;
  dropoff_address: string;
  status: string;
  requested_at: string | null;
  completed_at: string | null;
  actual_distance_miles: number | null;
  actual_duration_minutes: number | null;
  driver_payout_amount: number | null;
};

export type RideHistoryResponse = {
  items: LegacyRideHistoryItem[];
  pagination: { page: number; page_size: number; total_items: number; total_pages: number };
};

export async function getDriverStats(driverId: string): Promise<DriverStats> {
  return apiDataRequest<DriverStats>(`/admin/drivers/${driverId}/stats`, { method: 'GET' });
}

export async function getDriverRides(
  driverId: string,
  page = 1,
  pageSize = 20
): Promise<RideHistoryResponse> {
  return apiDataRequest<RideHistoryResponse>(
    `/admin/drivers/${driverId}/rides?page=${page}&page_size=${pageSize}`,
    { method: 'GET' }
  );
}

// ─── New Driver Detail API ─────────────────────────────────────────────────────

export async function getDriverById(driverId: string): Promise<DriverDetail> {
  const res = await apiRequest<{ data: DriverDetail }>(`/admin/drivers/${driverId}`);
  return res.data;
}

export async function updateDriverProfile(driverId: string, payload: Partial<DriverDetail>): Promise<DriverDetail> {
  const res = await apiRequest<{ data: DriverDetail }>(`/admin/drivers/${driverId}`, { method: 'PATCH', body: payload });
  return res.data;
}

export async function approveDriver(driverId: string, payload: { review_notes: string }): Promise<void> {
  await apiRequest(`/admin/onboarding/${driverId}/approve`, { method: 'POST', body: payload });
}

export async function rejectDriver(driverId: string, payload: { rejection_reason: string }): Promise<void> {
  await apiRequest(`/admin/onboarding/${driverId}/reject`, { method: 'POST', body: payload });
}

export async function suspendDriver(driverId: string, payload: { reason: string }): Promise<void> {
  await apiRequest(`/admin/drivers/${driverId}/suspend`, { method: 'POST', body: payload });
}

export async function reactivateDriver(driverId: string): Promise<void> {
  await apiRequest(`/admin/drivers/${driverId}/reactivate`, { method: 'POST' });
}

export async function requestDriverInfo(driverId: string, payload: { message: string }): Promise<void> {
  await apiRequest(`/admin/drivers/${driverId}/request-info`, {
    method: 'POST',
    body: { message: payload.message },
  });
}

export async function getDriverDocuments(driverId: string): Promise<DriverDocument[]> {
  const res = await apiRequest<{ data: DriverDocument[] }>(`/admin/drivers/${driverId}/documents`);
  return (res.data ?? []).map((document) => ({
    ...document,
    file_url: document.file_url ?? (document.download_path ? buildAuthenticatedApiUrl(document.download_path) : null),
  }));
}

export async function approveDocument(documentId: string): Promise<void> {
  await apiRequest(`/admin/documents/${documentId}/approve`, { method: 'POST' });
}

export async function rejectDocument(documentId: string, payload: { reason: string }): Promise<void> {
  await apiRequest(`/admin/documents/${documentId}/reject`, {
    method: 'POST',
    body: { rejection_reason: payload.reason },
  });
}

export async function requestDocumentReupload(driverId: string, documentType: string, payload: { message: string }): Promise<void> {
  await apiRequest(`/admin/drivers/${driverId}/documents/${documentType}/request-reupload`, {
    method: 'POST',
    body: { message: payload.message },
  });
}

export async function getDriverVehicle(driverId: string): Promise<DriverVehicle> {
  const res = await apiRequest<{ data: DriverVehicle }>(`/admin/drivers/${driverId}/vehicle`);
  return res.data;
}

export async function createDriverVehicle(driverId: string, payload: Omit<DriverVehicle, 'id' | 'driver_id'>): Promise<DriverVehicle> {
  const res = await apiRequest<{ data: DriverVehicle }>(`/admin/drivers/${driverId}/vehicle`, { method: 'POST', body: payload });
  return res.data;
}

export async function updateDriverVehicle(driverId: string, payload: Partial<DriverVehicle>): Promise<DriverVehicle> {
  const res = await apiRequest<{ data: DriverVehicle }>(`/admin/drivers/${driverId}/vehicle`, { method: 'PATCH', body: payload });
  return res.data;
}

export async function adminUploadDocument(
  driverId: string,
  payload: {
    document_type: string;
    file: File;
    document_number?: string;
    expires_at?: string;
  }
): Promise<void> {
  const formData = new FormData();
  formData.append('document_type', payload.document_type);
  if (payload.document_number) {
    formData.append('document_number', payload.document_number);
  }
  if (payload.expires_at) {
    formData.append('expires_at', payload.expires_at);
  }
  formData.append('file', payload.file);
  await apiRequest(`/admin/drivers/${driverId}/documents`, { method: 'POST', body: formData });
}

export async function updateDriverRegion(driverId: string, regionId: string): Promise<void> {
  await apiRequest(`/admin/drivers/${driverId}/region`, { method: 'PATCH', body: { region_id: regionId } });
}

export async function deactivateDriverVehicle(driverId: string): Promise<void> {
  await apiRequest(`/admin/drivers/${driverId}/vehicle/deactivate`, { method: 'POST' });
}

export async function getDriverOnboarding(driverId: string): Promise<OnboardingProfile> {
  const res = await apiRequest<{ data: OnboardingProfile }>(`/admin/onboarding/${driverId}`);
  return res.data;
}

export async function getDriverRideHistory(driverId: string, page = 1): Promise<{ items: RideHistoryItem[]; total: number }> {
  const res = await apiRequest<{ data: { items: RideHistoryItem[]; pagination: { total_items: number } } }>(
    `/admin/drivers/${driverId}/rides?page=${page}&page_size=20`
  );
  return {
    items: (res.data?.items ?? []).map((item: any) => ({
      ride_id: item.ride_id,
      created_at: item.requested_at ?? item.completed_at ?? new Date().toISOString(),
      rider_name: item.rider_name ?? 'Rider',
      region: item.region ?? '—',
      pickup_address: item.pickup_address ?? '—',
      dropoff_address: item.dropoff_address ?? '—',
      final_fare_amount: item.final_fare_amount ?? item.driver_payout_amount ?? null,
      status: item.status,
    })),
    total: res.data?.pagination?.total_items ?? 0,
  };
}

export async function getDriverPayouts(driverId: string, page = 1): Promise<{ items: PayoutItem[]; total: number }> {
  const res = await apiRequest<{ data?: { items?: PayoutItem[]; total?: number } }>(
    `/admin/drivers/${driverId}/payouts?page=${page}&page_size=20`
  );
  return {
    items: res.data?.items ?? [],
    total: res.data?.total ?? 0,
  };
}

export async function getDriverAuditTrail(driverId: string): Promise<AuditLogItem[]> {
  const res = await apiRequest<{ data: { items?: AuditLogItem[] } }>(`/admin/audit-logs?entity_id=${driverId}&entity_type=driver`);
  return res.data?.items ?? [];
}

export async function getDriverNotes(driverId: string): Promise<DriverNote[]> {
  const res = await apiRequest<{ data?: DriverNote[] }>(`/admin/drivers/${driverId}/notes`);
  return res.data ?? [];
}

export async function saveDriverNote(driverId: string, payload: { note: string }): Promise<DriverNote> {
  const res = await apiRequest<{ data?: DriverNote }>(`/admin/drivers/${driverId}/notes`, {
    method: 'POST',
    body: payload,
  });
  if (!res.data) {
    throw new Error('Failed to save note');
  }
  return res.data;
}

export async function getDriverCompliance(driverId: string): Promise<ComplianceItem[]> {
  const res = await apiRequest<{ data?: ComplianceItem[] }>(`/admin/drivers/${driverId}/compliance`);
  return res.data ?? [];
}
