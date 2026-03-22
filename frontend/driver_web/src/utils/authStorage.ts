import type { AuthUser } from "@shared/types/auth";

const ACCESS_TOKEN_KEY = "rc_driver_token";
const USER_KEY = "rc_driver_user";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const serialized = localStorage.getItem(USER_KEY);
  if (!serialized) {
    return null;
  }

  try {
    return JSON.parse(serialized) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function clearAuthStorage(): void {
  clearAccessToken();
  clearStoredUser();
}
