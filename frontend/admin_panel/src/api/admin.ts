import { apiDataRequest } from "./client";

export type DashboardSummary = {
  active_rides: number;
  online_drivers: number;
  pending_onboarding_reviews: number;
  active_regions: number;
};

export type DriverRecord = {
  driver_id: string;
  first_name: string;
  last_name?: string | null;
  status: string;
  is_online: boolean;
  is_available: boolean;
  is_approved: boolean;
  region_name?: string;
  rating?: number;
};

export type RegionRecord = {
  id: string;
  code?: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  cityState: string;
  activeDrivers: number;
  activeRides?: number;
  pendingApprovals?: number;
  matchingLoad?: number;
  is_active?: boolean;
};

export type RegionMetrics = {
  region_id: string;
  region_name: string;
  active_rides: number;
  drivers_online: number;
  pending_approvals: number;
  matching_load: number;
};

export type RegionPayload = {
  code: string;
  name: string;
  city: string;
  state: string;
  country: string;
  is_active: boolean;
};

export type AuditLogRecord = {
  id: string;
  admin_id?: string | null;
  action_type: string;
  entity_type: string;
  entity_id?: string | null;
  details_json?: Record<string, unknown> | null;
  created_at: string;
};

export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AdminAlertRecord = {
  id: string;
  alert_type: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  source_service?: string | null;
  region_id?: string | null;
  is_resolved: boolean;
  resolved_at?: string | null;
  created_at: string;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiDataRequest<DashboardSummary>("/admin/dashboard/summary", { method: "GET" });
}

export async function getDrivers(): Promise<DriverRecord[]> {
  const response = await apiDataRequest<{ items: DriverRecord[] }>("/admin/drivers", { method: "GET" });
  return response.items;
}

type BackendRegion = { id: string; code: string; name: string; city: string | null; state: string | null; country: string; is_active: boolean };

export async function getRegions(): Promise<RegionRecord[]> {
  const rows = await apiDataRequest<BackendRegion[]>("/admin/regions", { method: "GET" });
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    city: r.city ?? "",
    state: r.state ?? "",
    country: r.country,
    cityState: [r.city, r.state].filter(Boolean).join(", "),
    activeDrivers: 0,
    activeRides: 0,
    pendingApprovals: 0,
    matchingLoad: 0,
    is_active: r.is_active,
  }));
}

export async function createRegion(payload: RegionPayload): Promise<RegionRecord> {
  const row = await apiDataRequest<BackendRegion>("/admin/regions", { method: "POST", body: payload });
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    city: row.city ?? "",
    state: row.state ?? "",
    country: row.country,
    cityState: [row.city, row.state].filter(Boolean).join(", "),
    activeDrivers: 0,
    activeRides: 0,
    pendingApprovals: 0,
    matchingLoad: 0,
    is_active: row.is_active,
  };
}

export async function updateRegion(id: string, payload: RegionPayload): Promise<RegionRecord> {
  const row = await apiDataRequest<BackendRegion>(`/admin/regions/${id}`, { method: "PUT", body: payload });
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    city: row.city ?? "",
    state: row.state ?? "",
    country: row.country,
    cityState: [row.city, row.state].filter(Boolean).join(", "),
    activeDrivers: 0,
    activeRides: 0,
    pendingApprovals: 0,
    matchingLoad: 0,
    is_active: row.is_active,
  };
}

export async function toggleRegionActive(id: string): Promise<BackendRegion> {
  return apiDataRequest<BackendRegion>(`/admin/regions/${id}/toggle-active`, { method: "POST" });
}

export async function getRegionMetrics(id: string): Promise<RegionMetrics> {
  return apiDataRequest<RegionMetrics>(`/admin/regions/${id}/metrics`, { method: "GET" });
}

export async function getAuditLogs(): Promise<AuditLogRecord[]> {
  return apiDataRequest<AuditLogRecord[]>("/admin/audit-logs", { method: "GET" });
}

export async function getAdminAlerts(includeResolved = false): Promise<AdminAlertRecord[]> {
  const response = await apiDataRequest<{ items: AdminAlertRecord[] }>(`/admin/alerts?include_resolved=${includeResolved ? "true" : "false"}`, { method: "GET" });
  return response.items;
}
