import { Navigate } from 'react-router-dom';

const TOKEN_KEY = 'access_token';

function isTokenValid(): boolean {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  if (!isTokenValid()) {
    localStorage.removeItem(TOKEN_KEY);
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
