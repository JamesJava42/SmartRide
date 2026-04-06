import type {
  DriverLoginPayload,
  DriverLoginResponse,
  DriverRegisterPayload,
  DriverRegisterResponse,
} from "../types/driverAuth";
import { DriverAuthApiError } from "../types/driverAuth";
import type { RegistrationRegion } from "../types/auth";

const TOKEN_KEY = "rc_driver_token";

function getBaseUrl() {
  const value = import.meta.env.VITE_API_BASE_URL?.trim();
  return value ? value.replace(/\/+$/, "") : "http://localhost:8000";
}

async function handleJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message =
      (payload &&
        typeof payload === "object" &&
        ((typeof payload.message === "string" && payload.message) ||
          (typeof payload.detail === "string" && payload.detail))) ||
      `Request failed with status ${response.status}`;
    throw new DriverAuthApiError(response.status, message);
  }

  if (payload && typeof payload === "object" && "data" in payload && payload.data) {
    return payload.data as T;
  }

  return payload as T;
}

function buildAuthHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function loginDriver(payload: DriverLoginPayload): Promise<DriverLoginResponse> {
  const response = await fetch(`${getBaseUrl()}/api/v1/auth/login`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      email_or_phone: payload.email,
      password: payload.password,
    }),
  });

  const auth = await handleJsonResponse<{
    access_token: string;
    token_type: string;
    user?: { user_id?: string; role?: string };
  }>(response);

  const token = auth.access_token;

  let driverId = auth.user?.user_id ?? "";
  let fullName = "";
  let email = payload.email;

  try {
    const profileResponse = await fetch(`${getBaseUrl()}/api/v1/drivers/me`, {
      method: "GET",
      headers: buildAuthHeaders(token),
    });
    const profile = await handleJsonResponse<Record<string, unknown>>(profileResponse);
    // API returns { id, first_name, last_name, full_name, ... } — use "id" as the marketplace driver id
    driverId = String(profile.id ?? profile.driver_id ?? profile.driverId ?? auth.user?.user_id ?? "");
    // full_name is now returned by the backend; fall back to joining first/last
    const rawFullName = profile.full_name ?? profile.fullName;
    if (typeof rawFullName === "string" && rawFullName.trim()) {
      fullName = rawFullName.trim();
    } else {
      const first = typeof profile.first_name === "string" ? profile.first_name : "";
      const last = typeof profile.last_name === "string" ? profile.last_name : "";
      fullName = [first, last].filter(Boolean).join(" ");
    }
    email = typeof profile.email === "string" ? profile.email : email;
  } catch {
    driverId = auth.user?.user_id ?? "";
  }

  return {
    access_token: token,
    token_type: auth.token_type ?? "bearer",
    driver_id: driverId,
    full_name: fullName,
    email,
  };
}

export async function registerDriver(payload: DriverRegisterPayload): Promise<DriverRegisterResponse> {
  const response = await fetch(`${getBaseUrl()}/api/v1/onboarding/driver-register`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      name: payload.full_name,
      email: payload.email,
      phone: payload.phone_number,
      password: payload.password,
      region_id: payload.region_id,
    }),
  });

  const data = await handleJsonResponse<Record<string, unknown>>(response);
  return {
    id: String(data.driver_id ?? data.id ?? ""),
    full_name: payload.full_name,
    email: payload.email,
    phone_number: payload.phone_number,
    role: String(data.role ?? payload.role),
    created_at: typeof data.submitted_at === "string" ? data.submitted_at : new Date().toISOString(),
  };
}

export async function loginDriverWithGoogle(idToken: string): Promise<DriverLoginResponse> {
  const response = await fetch(`${getBaseUrl()}/api/v1/auth/google`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({ id_token: idToken, role: "DRIVER" }),
  });

  const auth = await handleJsonResponse<{
    access_token: string;
    token_type: string;
    user?: { user_id?: string; role?: string };
  }>(response);

  const token = auth.access_token;
  let driverId = auth.user?.user_id ?? "";
  let fullName = "";
  let email = "";

  try {
    const profileResponse = await fetch(`${getBaseUrl()}/api/v1/drivers/me`, {
      method: "GET",
      headers: buildAuthHeaders(token),
    });
    const profile = await handleJsonResponse<Record<string, unknown>>(profileResponse);
    driverId = String(profile.driver_id ?? profile.driverId ?? auth.user?.user_id ?? "");
    fullName = typeof profile.full_name === "string" ? profile.full_name : "";
    email = typeof profile.email === "string" ? profile.email : "";
  } catch {
    driverId = auth.user?.user_id ?? "";
  }

  return {
    access_token: token,
    token_type: auth.token_type ?? "bearer",
    driver_id: driverId,
    full_name: fullName,
    email,
  };
}

export async function getDriverRegistrationRegions(): Promise<RegistrationRegion[]> {
  const response = await fetch(`${getBaseUrl()}/api/v1/onboarding/regions`, {
    method: "GET",
    headers: buildAuthHeaders(),
  });

  const data = await handleJsonResponse<Array<Record<string, unknown>>>(response);
  return (data ?? []).map((item) => ({
    id: String(item.id ?? ""),
    name: String(item.name ?? "Unknown region"),
    city: typeof item.city === "string" ? item.city : null,
    state: typeof item.state === "string" ? item.state : null,
  }));
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, middle] = token.split(".");
    if (!middle) {
      return null;
    }
    const normalized = middle.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getDriverInitials(): string {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return "D";
  }

  const payload = decodeJwtPayload(token);
  const fullName = typeof payload?.full_name === "string" ? payload.full_name.trim() : "";
  if (!fullName) {
    return "D";
  }

  return fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "D";
}

export function isDriverTokenValid(): boolean {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return false;
  }

  const payload = decodeJwtPayload(token);
  const exp = typeof payload?.exp === "number" ? payload.exp : null;
  if (!exp) {
    return false;
  }

  return exp > Date.now() / 1000;
}
