import type { AuthResponse, User } from "../types/api";
import type { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from "../types/auth";
import { AuthApiError } from "../types/auth";
import { getBaseUrl, request } from "./client";

const AUTH_BASE_URL = `${getBaseUrl()}/api/v1/auth`;

async function parseResponse(response: Response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function authRequest<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${AUTH_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await parseResponse(response);
  if (!response.ok) {
    const message = body?.message ?? body?.detail ?? `Request failed with ${response.status}`;
    throw new AuthApiError(response.status, message, body);
  }
  if (body && typeof body === "object" && "data" in body) {
    return body.data as T;
  }
  return body as T;
}

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

function normalizeUser(base: {
  user_id?: string;
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  role?: string;
  created_at?: string | null;
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
    created_at: base.created_at ?? undefined,
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

export async function loginRider(payload: LoginPayload): Promise<LoginResponse> {
  const data = await authRequest<any>("/login", {
    email_or_phone: payload.email,
    password: payload.password,
  });

  return {
    access_token: data.access_token,
    token_type: data.token_type ?? "bearer",
    rider_id: data.user?.user_id ?? data.user?.id ?? "",
    full_name: deriveFullName(data.user ?? {}),
    email: data.user?.email ?? payload.email,
  };
}

export async function registerRider(payload: RegisterPayload): Promise<RegisterResponse> {
  const data = await authRequest<any>("/signup", payload);
  return {
    id: data.id ?? data.user_id ?? "",
    full_name: data.full_name ?? payload.full_name,
    email: data.email ?? payload.email,
    phone_number: data.phone_number ?? payload.phone_number,
    role: data.role ?? payload.role,
    created_at: data.created_at ?? new Date().toISOString(),
  };
}

export const authApi = {
  signUp: (payload: { full_name: string; email?: string; phone_number?: string; password: string }) =>
    registerRider({
      full_name: payload.full_name,
      email: payload.email ?? "",
      phone_number: payload.phone_number ?? "",
      password: payload.password,
      role: "RIDER",
    }),

  signIn: async (payload: { email: string; password: string }) =>
    normalizeAuthResponse(
      await authRequest<any>("/login", {
        email_or_phone: payload.email,
        password: payload.password,
      }),
    ),

  getMe: async () => {
    const authMe = await request<any>("/auth/me");
    try {
      const rider = await request<any>("/riders/me");
      return normalizeUser({
        user_id: authMe.user_id,
        email: authMe.email,
        phone_number: authMe.phone_number,
        role: authMe.role,
        first_name: rider.first_name,
        last_name: rider.last_name,
        created_at: authMe.created_at,
      });
    } catch {
      return normalizeUser(authMe);
    }
  },

  signInWithGoogle: async (idToken: string) =>
    normalizeAuthResponse(
      await authRequest<any>("/google", { id_token: idToken, role: "RIDER" }),
    ),

  bootstrapRider: () => request<any>("/riders/me/bootstrap", { method: "POST" }),

  updateMe: async (payload: Record<string, unknown>) => {
    const { firstName, lastName } = splitFullName(String(payload.full_name ?? ""));
    await request<any>("/riders/me", {
      method: "PATCH",
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
      }),
    });
    return authApi.getMe();
  },
};
