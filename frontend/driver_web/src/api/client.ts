import { getAccessToken } from "../utils/authStorage";

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export class ApiRequestError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.payload = payload;
  }
}

const DEFAULT_LOCAL_BASE_URL = "http://localhost:8000";

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

function getBaseUrl(): string {
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

export function buildAuthenticatedApiUrl(path: string): string {
  const token = getAccessToken();
  const url = new URL(`${getBaseUrl()}${normalizePath(path)}`);
  if (token) {
    url.searchParams.set("access_token", token);
  }
  return url.toString();
}

function normalizePath(path: string): string {
  if (path.startsWith("/api/")) {
    return path;
  }
  return `/api/v1${path}`;
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);
  const isFormDataBody = options.body instanceof FormData;

  if (!headers.has("Content-Type") && options.body !== undefined && !isFormDataBody) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const baseUrl = getBaseUrl();
  if (isNgrokUrl(baseUrl)) {
    headers.set("ngrok-skip-browser-warning", "true");
  }

  const response = await fetch(`${baseUrl}${normalizePath(path)}`, {
    ...options,
    headers,
    body:
      options.body === undefined
        ? undefined
        : isFormDataBody
          ? options.body
          : JSON.stringify(options.body),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message =
      (payload !== null &&
        typeof payload === "object" &&
        (("message" in payload && typeof payload.message === "string" && payload.message) ||
          ("detail" in payload && typeof payload.detail === "string" && payload.detail))) ||
      `Request failed with status ${response.status}`;
    throw new ApiRequestError(response.status, message, payload);
  }

  return payload as T;
}
