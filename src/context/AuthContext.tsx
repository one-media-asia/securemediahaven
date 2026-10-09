import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getManagedUserByEmail, isUserAllowed } from '@/lib/userControl';

type User = {
  email: string;
  name: string;
  membershipActive: boolean;
  membershipPlan?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authLoading: false,
  login: async () => {},
  logout: () => {},
  refresh: async () => {},
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setAuthLoading(true);
    try {
      const managedUser = getManagedUserByEmail(email);
      const localAllowed = managedUser ? isUserAllowed(email) : false;

      if (localAllowed && password.trim()) {
        const normalizedUser = {
          email: managedUser!.email,
          name: managedUser!.name,
          membershipActive: true,
          membershipPlan: managedUser!.plan,
        };

        setUser(normalizedUser);
        localStorage.setItem('sessionToken', 'managed-user');
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setUser(data.user);
      if (data.sessionToken) {
        localStorage.setItem('sessionToken', data.sessionToken);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sessionToken');
  }, []);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('sessionToken');
    if (!token) {
      setUser(null);
      setAuthLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('sessionToken');
        setUser(null);
      }
    } catch {
      localStorage.removeItem('sessionToken');
      setUser(null);
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading: authLoading, authLoading, login, logout, refresh, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
