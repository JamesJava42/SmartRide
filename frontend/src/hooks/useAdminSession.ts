import { useEffect, useState } from "react";

import { api, clearAdminAuthToken, setAdminAuthToken } from "../services/api";
import type { AdminAuthResponse, AdminUser } from "../types/api";

const TOKEN_KEY = "rideconnect_admin_access_token";
const USER_KEY = "rideconnect_admin_user";

export function useAdminSession() {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
    const storedUser = window.localStorage.getItem(USER_KEY);

    if (!storedToken || !storedUser) {
      clearAdminAuthToken();
      setIsLoading(false);
      return;
    }

    setAdminAuthToken(storedToken);
    setToken(storedToken);
    setAdmin(JSON.parse(storedUser) as AdminUser);
    setIsLoading(false);
  }, []);

  function persistSession(auth: AdminAuthResponse) {
    window.localStorage.setItem(TOKEN_KEY, auth.access_token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(auth.admin));
    setAdminAuthToken(auth.access_token);
    setToken(auth.access_token);
    setAdmin(auth.admin);
  }

  async function signIn(payload: { email: string; password: string }) {
    const auth = await api.adminSignIn(payload);
    persistSession(auth);
  }

  function signOut() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    clearAdminAuthToken();
    setToken(null);
    setAdmin(null);
  }

  return {
    isLoading,
    token,
    admin,
    isSignedIn: Boolean(token && admin),
    signIn,
    signOut,
  };
}
