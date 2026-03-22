import type {
  AdminAlert,
  AdminAuditLog,
  AdminAuthResponse,
  AdminDriver,
  AdminDriverDetail,
  AdminLiveMapRide,
  AdminLiveRide,
  AdminRegion,
  AdminRegionMetrics,
  AdminRegionPayload,
  AuthResponse,
  DashboardSummary,
  DriverWorkspace,
  FareEstimate,
  Notification,
  RideHistoryItem,
  RideResponse,
  RideTracking,
  User,
} from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

type Envelope<T> = {
  success: boolean;
  message?: string | null;
  data: T;
};

let authToken: string | null = null;
let adminAuthToken: string | null = null;

function normalizeRole(role: string | undefined): User["role"] {
  const normalized = role?.toLowerCase();
  if (normalized === "driver" || normalized === "admin") {
    return normalized;
  }
  return "rider";
}

function splitFullName(fullName: string) {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: "Rider", lastName: null };
  }
  const [firstName, ...rest] = trimmed.split(/\s+/);
  return {
    firstName,
    lastName: rest.length ? rest.join(" ") : null,
  };
}

function deriveFullName(parts: { first_name?: string | null; last_name?: string | null; email?: string | null }) {
  const fullName = [parts.first_name, parts.last_name].filter(Boolean).join(" ").trim();
  if (fullName) {
    return fullName;
  }
  if (parts.email) {
    return parts.email.split("@")[0];
  }
  return "RideConnect User";
}

function toCurrencyString(value: unknown) {
  const numeric = Number(value ?? 0);
  return numeric.toFixed(2);
}

function normalizeUser(base: {
  user_id?: string;
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  role?: string;
}): User {
  return {
    id: base.user_id ?? base.id ?? "",
    user_id: base.user_id ?? base.id ?? "",
    full_name: deriveFullName(base),
    first_name: base.first_name ?? undefined,
    last_name: base.last_name ?? undefined,
    email: base.email ?? "",
    phone_number: base.phone_number ?? "",
    role: normalizeRole(base.role),
  };
}

function normalizeAuthResponse(data: any): AuthResponse {
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    token_type: "bearer",
    user: normalizeUser({
      user_id: data.user?.user_id,
      email: data.user?.email,
      phone_number: data.user?.phone_number,
      role: data.user?.role,
    }),
  };
}

async function request<T>(path: string, init?: RequestInit, tokenOverride?: string | null): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(tokenOverride ? { Authorization: `Bearer ${tokenOverride}` } : authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const responseText = await response.text();
  const responseBody = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    const message =
      responseBody?.message ??
      responseBody?.detail ??
      responseText ??
      `Request failed with ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (responseBody && typeof responseBody === "object" && "data" in responseBody) {
    return (responseBody as Envelope<T>).data;
  }

  return responseBody as T;
}

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, init, adminAuthToken);
}

async function reverseGeocode(lat: number, lng: number): Promise<{ label: string; latitude: number; longitude: number }> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );
  if (!response.ok) {
    throw new Error("Unable to reverse geocode point");
  }
  const data = (await response.json()) as { display_name?: string };
  return {
    label: data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    latitude: lat,
    longitude: lng,
  };
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function clearAuthToken() {
  authToken = null;
}

export function setAdminAuthToken(token: string | null) {
  adminAuthToken = token;
}

export function clearAdminAuthToken() {
  adminAuthToken = null;
}

export const api = {
  signUp: (payload: { email?: string; phone_number?: string; password: string; role: "rider" | "driver" }) =>
    request<{ user_id: string; role: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: payload.email || null,
        phone_number: payload.phone_number || null,
        password: payload.password,
        role: payload.role.toUpperCase(),
      }),
    }),

  signIn: async (payload: { email: string; password: string }) =>
    normalizeAuthResponse(
      await request<any>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email_or_phone: payload.email,
          password: payload.password,
        }),
      }),
    ),

  getAuthMe: async () =>
    normalizeUser(
      await request<any>("/auth/me"),
    ),

  getRiderProfile: () => request<any>("/riders/me"),
  updateRiderProfile: (payload: { first_name: string; last_name?: string | null }) =>
    request<any>("/riders/me", { method: "PATCH", body: JSON.stringify(payload) }),
  getDriverProfile: () => request<any>("/drivers/me"),

  getMe: async () => {
    const authMe = await request<any>("/auth/me");
    const role = normalizeRole(authMe.role);
    if (role === "rider") {
      try {
        const rider = await request<any>("/riders/me");
        return normalizeUser({
          user_id: authMe.user_id,
          email: authMe.email,
          phone_number: authMe.phone_number,
          role: authMe.role,
          first_name: rider.first_name,
          last_name: rider.last_name,
        });
      } catch {
        return normalizeUser(authMe);
      }
    }
    if (role === "driver") {
      try {
        const driver = await request<any>("/drivers/me");
        return normalizeUser({
          user_id: authMe.user_id,
          email: authMe.email,
          phone_number: driver.phone_number ?? authMe.phone_number,
          role: authMe.role,
          first_name: driver.first_name,
          last_name: driver.last_name,
        });
      } catch {
        return normalizeUser(authMe);
      }
    }
    return normalizeUser(authMe);
  },

  updateMe: async (payload: Record<string, unknown>) => {
    const authMe = await request<any>("/auth/me");
    if (normalizeRole(authMe.role) === "rider") {
      const { firstName, lastName } = splitFullName(String(payload.full_name ?? ""));
      await request<any>("/riders/me", {
        method: "PATCH",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
        }),
      });
    }
    return api.getMe();
  },

  getRides: async () => {
    const history = await request<any>("/rides/me/history");
    return (history.items ?? []).map(
      (item: any): RideHistoryItem => ({
        ride_id: item.ride_id,
        ride_request_id: item.ride_id,
        status: item.status,
        pickup_label: item.pickup_address,
        destination_label: item.dropoff_address,
        created_at: item.completed_at ?? new Date().toISOString(),
        assigned_at: null,
        completed_at: item.completed_at ?? null,
        fare: item.final_fare_amount ? String(item.final_fare_amount) : null,
        driver_name: null,
        vehicle_name: null,
        vehicle_plate: null,
      }),
    );
  },

  estimateFare: async (payload: Record<string, unknown>) => {
    const data = await request<any>("/rides/estimate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return {
      fare_estimate_id: data.estimate_id,
      market_code: "rideconnect",
      product_code: String(data.vehicle_type).toLowerCase(),
      estimated_distance_miles: Number(data.distance_miles),
      estimated_duration_minutes: Number(data.duration_minutes),
      currency_code: "USD",
      quote_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      breakdown: {
        trip_fare: toCurrencyString(Number(data.base_fare) + Number(data.distance_fare) + Number(data.time_fare)),
        booking_fee: toCurrencyString(data.booking_fee),
        third_party_fees: "0.00",
        toll_estimate: "0.00",
        reserve_fee: "0.00",
        discount: "0.00",
        rider_total: toCurrencyString(data.total_estimated_fare),
        driver_estimated_payout: toCurrencyString(data.driver_payout_estimate),
        platform_estimated_margin: "0.00",
      },
    } satisfies FareEstimate;
  },

  createRideRequest: async (payload: Record<string, unknown>) => {
    const data = await request<any>("/rides/request", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return {
      ride_id: data.ride_id,
      status: data.status,
      requested_at: data.requested_at,
      driver_id: null,
    } satisfies RideResponse;
  },

  getRide: async (rideId: string) => {
    const data = await request<any>(`/rides/${rideId}`);
    return {
      ride_id: data.id,
      status: data.status,
      driver_id: data.driver?.id ?? null,
      pickup_address: data.pickup_address,
      dropoff_address: data.dropoff_address,
      ride_type: data.ride_type,
    } satisfies RideResponse;
  },

  getRideTracking: async (rideId: string) => {
    const data = await request<any>(`/tracking/rides/${rideId}/live`);
    return {
      ride_id: data.ride_id,
      ride_status: data.status,
      driver_lat: data.driver_location?.latitude ? String(data.driver_location.latitude) : null,
      driver_lng: data.driver_location?.longitude ? String(data.driver_location.longitude) : null,
      pickup_lat: String(data.pickup_location.latitude),
      pickup_lng: String(data.pickup_location.longitude),
      destination_lat: String(data.dropoff_location.latitude),
      destination_lng: String(data.dropoff_location.longitude),
      eta_minutes: data.eta_minutes == null ? null : String(data.eta_minutes),
      route_polyline: null,
    } satisfies RideTracking;
  },

  cancelRide: (rideId: string, cancelReason = "Cancelled from rider app") =>
    request<RideResponse>(`/rides/${rideId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ cancel_reason: cancelReason }),
    }),

  getNotifications: async (): Promise<Notification[]> => [],
  reverseGeocode,

  adminSignIn: (payload: Record<string, unknown>) =>
    adminRequest<AdminAuthResponse>("/admin/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getAdminMe: () => adminRequest<AdminAuthResponse["admin"]>("/admin/auth/me"),
  getAdminDashboardSummary: () => adminRequest<DashboardSummary>("/admin/dashboard/summary"),
  getAdminRegionSummary: (regionId: string) => adminRequest<DashboardSummary>(`/admin/dashboard/regions/${regionId}`),
  getAdminActiveRides: (query = "") => adminRequest<AdminLiveRide[]>(`/admin/rides/active${query}`),
  getAdminRideDetail: (rideId: string) => adminRequest<AdminLiveRide>(`/admin/rides/${rideId}`),
  getAdminLiveMap: (query = "") => adminRequest<AdminLiveMapRide[]>(`/admin/rides/live-map${query}`),
  getAdminDrivers: (query = "") => adminRequest<AdminDriver[]>(`/admin/drivers${query}`),
  getAdminDriverDetail: (driverId: string) => adminRequest<AdminDriverDetail>(`/admin/drivers/${driverId}`),
  activateAdminDriver: (driverId: string, payload: Record<string, unknown> = {}) =>
    adminRequest<AdminDriverDetail>(`/admin/drivers/${driverId}/activate`, { method: "POST", body: JSON.stringify(payload) }),
  suspendAdminDriver: (driverId: string, payload: Record<string, unknown> = {}) =>
    adminRequest<AdminDriverDetail>(`/admin/drivers/${driverId}/suspend`, { method: "POST", body: JSON.stringify(payload) }),
  getAdminOnboardingQueue: (query = "") => adminRequest<AdminDriverDetail[]>(`/admin/onboarding/queue${query}`),
  getAdminOnboardingDetail: (driverId: string) => adminRequest<AdminDriverDetail>(`/admin/onboarding/${driverId}`),
  approveAdminOnboarding: (driverId: string, payload: Record<string, unknown> = {}) =>
    adminRequest<AdminDriverDetail>(`/admin/onboarding/${driverId}/approve`, { method: "POST", body: JSON.stringify(payload) }),
  rejectAdminOnboarding: (driverId: string, payload: Record<string, unknown> = {}) =>
    adminRequest<AdminDriverDetail>(`/admin/onboarding/${driverId}/reject`, { method: "POST", body: JSON.stringify(payload) }),
  requestAdminOnboardingInfo: (driverId: string, payload: Record<string, unknown>) =>
    adminRequest<AdminDriverDetail>(`/admin/onboarding/${driverId}/request-info`, { method: "POST", body: JSON.stringify(payload) }),
  getAdminRegions: () => adminRequest<AdminRegion[]>("/admin/regions"),
  createAdminRegion: (payload: AdminRegionPayload) => adminRequest<AdminRegion>("/admin/regions", { method: "POST", body: JSON.stringify(payload) }),
  updateAdminRegion: (regionId: string, payload: AdminRegionPayload) =>
    adminRequest<AdminRegion>(`/admin/regions/${regionId}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteAdminRegion: (regionId: string) => adminRequest<void>(`/admin/regions/${regionId}`, { method: "DELETE" }),
  getAdminRegionMetrics: (regionId: string) => adminRequest<AdminRegionMetrics>(`/admin/regions/${regionId}/metrics`),
  getAdminAuditLogs: () => adminRequest<AdminAuditLog[]>("/admin/audit-logs"),
  getAdminAlerts: () => adminRequest<AdminAlert[]>("/admin/alerts"),

  getDriverWorkspace: () => request<DriverWorkspace>("/driver/rides/workspace"),
  acceptDriverRide: (rideId: string, payload: Record<string, unknown> = {}) =>
    request<RideResponse>(`/driver/rides/${rideId}/accept`, { method: "POST", body: JSON.stringify(payload) }),
  declineDriverRide: (rideId: string) => request<{ status: string }>(`/driver/rides/${rideId}/decline`, { method: "POST" }),
  markDriverEnRoute: (rideId: string) => request<RideResponse>(`/driver/rides/${rideId}/en-route`, { method: "POST" }),
  markDriverArrived: (rideId: string) => request<RideResponse>(`/driver/rides/${rideId}/arrived`, { method: "POST" }),
  startDriverRide: (rideId: string) => request<RideResponse>(`/driver/rides/${rideId}/start`, { method: "POST" }),
  completeDriverRide: (rideId: string) => request<RideResponse>(`/driver/rides/${rideId}/complete`, { method: "POST" }),
  updateDriverLocation: (payload: { ride_id?: string | null; lat: number; lng: number; heading?: number | null; speed?: number | null }) =>
    request<{ driver_id: string; recorded_at: string }>("/driver/location", { method: "POST", body: JSON.stringify(payload) }),
};
