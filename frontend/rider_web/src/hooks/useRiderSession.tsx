import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { authApi, clearAuthToken, setAuthToken } from "../api";
import type { AuthResponse, AuthUser } from "../types/api";

const TOKEN_KEY = "rc_rider_token";
const LEGACY_TOKEN_KEY = "rideconnect_access_token";
const USER_KEY = "rideconnect_auth_user";

function isTokenExpired(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalized));
    if (!decoded?.exp) return false;
    return decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

type SessionContextValue = {
  isLoading: boolean;
  token: string | null;
  user: AuthUser | null;
  isSignedIn: boolean;
  signIn: (payload: { email: string; password: string }) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signUp: (payload: { full_name: string; email: string; phone_number: string; password: string }) => Promise<void>;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function RiderSessionProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY) ?? window.localStorage.getItem(LEGACY_TOKEN_KEY);
    const storedUser = window.localStorage.getItem(USER_KEY);

    if (!storedToken || !storedUser || isTokenExpired(storedToken)) {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(LEGACY_TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
      clearAuthToken();
      setIsLoading(false);
      return;
    }

    setAuthToken(storedToken);
    setTokenState(storedToken);
    setUser(JSON.parse(storedUser) as AuthUser);
    setIsLoading(false);
  }, []);

  function persistSession(auth: AuthResponse) {
    window.localStorage.setItem(TOKEN_KEY, auth.access_token);
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    setAuthToken(auth.access_token);
    setTokenState(auth.access_token);
    setUser(auth.user);
  }

  async function signIn(payload: { email: string; password: string }) {
    const auth = await authApi.signIn(payload);
    setAuthToken(auth.access_token);
    await authApi.bootstrapRider();
    const hydratedUser = await authApi.getMe().catch(() => auth.user);
    persistSession({ ...auth, user: hydratedUser });
  }

  async function signInWithGoogle(idToken: string) {
    const auth = await authApi.signInWithGoogle(idToken);
    setAuthToken(auth.access_token);
    await authApi.bootstrapRider().catch(() => {});
    const hydratedUser = await authApi.getMe().catch(() => auth.user);
    persistSession({ ...auth, user: hydratedUser });
  }

  async function signUp(payload: { full_name: string; email: string; phone_number: string; password: string }) {
    await authApi.signUp(payload);
    await signIn({
      email: payload.email || payload.phone_number,
      password: payload.password,
    });
    if (payload.full_name.trim()) {
      const updatedUser = await authApi.updateMe({ full_name: payload.full_name });
      setUser(updatedUser);
      window.localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
  }

  function signOut() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    clearAuthToken();
    setTokenState(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      isLoading,
      token,
      user,
      isSignedIn: Boolean(token && user),
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
    }),
    [isLoading, token, user, signIn, signInWithGoogle, signUp],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useRiderSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useRiderSession must be used inside RiderSessionProvider");
  }
  return context;
}
