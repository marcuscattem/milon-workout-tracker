/**
 * AuthContext.tsx
 *
 * Contexto global de autenticação. Envolve o app no _layout.tsx.
 * Expõe: session, isLoading, login(), logout()
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuthSession,
  getSession,
  login as authLogin,
  logout as authLogout,
} from './authStore';

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSession().then((s) => {
      setSession(s);
      setIsLoading(false);
    });
  }, []);

  const login = async (username: string, password: string) => {
    const result = await authLogin(username, password);
    if (result.success) {
      setSession(result.session);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = async () => {
    await authLogout();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
