import { useDriverSession } from "./useDriverSession";
import type { AuthSessionResponse } from "@shared/types/auth";

export function useDriverAuth() {
  const session = useDriverSession();

  return {
    token: session.token,
    user: session.user,
    isAuthenticated: session.isSignedIn,
    isLoading: session.isLoading,
    login: (sessionResponse: AuthSessionResponse) => {
      session.applySession(sessionResponse);
    },
    setUser: session.setUser,
    logout: session.signOut,
  };
}
