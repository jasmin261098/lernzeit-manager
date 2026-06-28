import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, saveToken, clearToken, decodeToken } from './api';

interface AuthContextType {
  user: { id: string; email: string } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadUserFromStorage(): { id: string; email: string } | null {
  const token = localStorage.getItem('auth_token');
  const email = localStorage.getItem('auth_email');
  if (!token || !email) return null;
  const payload = decodeToken(token);
  if (!payload) return null;
  return { id: String(payload.userId), email };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(loadUserFromStorage());
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { token } = await api.post<{ token: string }>('/auth/login', { email, password });
      saveToken(token);
      localStorage.setItem('auth_email', email);
      const payload = decodeToken(token);
      if (payload) setUser({ id: String(payload.userId), email });
      return {};
    } catch (err) {
      return { error: (err as Error).message };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await api.post('/auth/register', { email, password });
      return await signIn(email, password);
    } catch (err) {
      return { error: (err as Error).message };
    }
  };

  const signOut = async () => {
    clearToken();
    localStorage.removeItem('auth_email');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
