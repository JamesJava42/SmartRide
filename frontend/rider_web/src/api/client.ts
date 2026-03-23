const DEFAULT_LOCAL_BASE_URL = "http://localhost:8000";

type Envelope<T> = {
  success: boolean;
  message?: string | null;
  data: T;
};

let authToken: string | null = null;

function trimBaseUrl(value?: string): string | null {
  const next = value?.trim();
  return next ? next.replace(/\/+$/, "") : null;
}

function isLocalHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isNgrokHost(hostname: string): boolean {
  return hostname.endsWith(".ngrok-free.app") || hostname.endsWith(".ngrok.app");
}

function isNgrokUrl(url: string): boolean {
  try {
    return isNgrokHost(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function getBaseUrl(): string {
  const explicitBaseUrl = trimBaseUrl(import.meta.env.VITE_API_BASE_URL);
  const publicBaseUrl = trimBaseUrl(import.meta.env.VITE_PUBLIC_API_BASE_URL);

  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (isLocalHost(hostname)) {
      return explicitBaseUrl ?? DEFAULT_LOCAL_BASE_URL;
    }
    if (isNgrokHost(hostname) && publicBaseUrl) {
      return publicBaseUrl;
    }
  }

  return explicitBaseUrl ?? DEFAULT_LOCAL_BASE_URL;
}

const API_BASE_URL = `${getBaseUrl()}/api/v1`;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function clearAuthToken() {
  authToken = null;
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }
  if (isNgrokUrl(getBaseUrl())) {
    headers.set("ngrok-skip-browser-warning", "true");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const responseText = await response.text();
  const responseBody = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    const message = responseBody?.message ?? responseBody?.detail ?? responseText ?? `Request failed with ${response.status}`;
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
