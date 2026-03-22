import { ACCESS_TOKEN_KEY, apiDataRequest } from "./client";

export type LoginResponse = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user?: {
    user_id: string;
    role: string;
    is_active: boolean;
  };
};

export type CurrentUser = {
  user_id: string;
  email?: string | null;
  phone_number?: string | null;
  role?: string;
  is_active?: boolean;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiDataRequest<LoginResponse>("/admin/auth/login", {
    method: "POST",
    body: { email_or_phone: email, password },
  });

  localStorage.setItem(ACCESS_TOKEN_KEY, response.access_token);
  return response;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  return apiDataRequest<CurrentUser>("/auth/me", { method: "GET" });
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getStoredToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
