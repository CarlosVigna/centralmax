import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthenticatedUser } from '../types/auth';
import { getCurrentUser, login as loginRequest } from '../services/authService';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_STORAGE_KEY = 'maxhub_token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    if (!token) return;
    getCurrentUser()
      .then(setUser)
      .catch(() => {
        setToken(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      });
  }, [token]);

  async function login(email: string, password: string) {
    const response = await loginRequest({ email, password });
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: Boolean(token), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext deve ser usado dentro de um AuthProvider');
  }
  return context;
}
