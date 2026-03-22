const TOKEN_KEY = "access_token";

export function useAuth() {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  return { token };
}
