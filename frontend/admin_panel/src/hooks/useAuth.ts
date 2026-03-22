import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const TOKEN_KEY = 'access_token';

export function useAuth() {
  const navigate = useNavigate();

  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), []);

  const isAuthenticated = useCallback((): boolean => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    navigate('/login');
  }, [navigate]);

  return { getToken, isAuthenticated, logout };
}
