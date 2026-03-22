import { useEffect, useState } from "react";
import { api, clearAuthToken, setAuthToken } from "../services/api";
import type { AuthResponse, AuthUser } from "../types/api";

const TOKEN_KEY = "rideconnect_access_token";
const USER_KEY = "rideconnect_auth_user";

export function useAuthSession() {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
    const storedUser = window.localStorage.getItem(USER_KEY);

    if (!storedToken || !storedUser) {
      clearAuthToken();
      setIsLoading(false);
      return;
    }

    setAuthToken(storedToken);
    setToken(storedToken);
    setUser(JSON.parse(storedUser) as AuthUser);
    setIsLoading(false);
  }, []);

  function persistSession(auth: AuthResponse) {
    window.localStorage.setItem(TOKEN_KEY, auth.access_token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    setAuthToken(auth.access_token);
    setToken(auth.access_token);
    setUser(auth.user);
  }

  async function signIn(payload: { email: string; password: string }) {
    const auth = await api.signIn(payload);
    setAuthToken(auth.access_token);
    const hydratedUser = await api.getMe().catch(() => auth.user);
    persistSession({ ...auth, user: hydratedUser });
  }

  async function signUp(payload: {
    full_name: string;
    email: string;
    phone_number: string;
    password: string;
    role: "rider" | "driver";
  }) {
    await api.signUp(payload);
    await signIn({
      email: payload.email || payload.phone_number,
      password: payload.password,
    });
    if (payload.role === "rider" && payload.full_name.trim()) {
      const [firstName, ...rest] = payload.full_name.trim().split(/\s+/);
      await api.updateRiderProfile({
        first_name: firstName,
        last_name: rest.length ? rest.join(" ") : null,
      });
      const hydratedUser = await api.getMe();
      setUser(hydratedUser);
      window.localStorage.setItem(USER_KEY, JSON.stringify(hydratedUser));
    }
  }

  function signOut() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    clearAuthToken();
    setToken(null);
    setUser(null);
  }

  return {
    isLoading,
    token,
    user,
    isSignedIn: Boolean(token && user),
    signIn,
    signUp,
    signOut,
  };
}
