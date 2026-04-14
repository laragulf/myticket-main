import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type MockUser = {
  email: string;
  name: string;
};

const STORAGE_KEY = 'myticket_mock_auth';

function readUser(): MockUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as MockUser;
    if (u?.email && u?.name) return u;
    return null;
  } catch {
    return null;
  }
}

function writeUser(u: MockUser | null) {
  if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  else localStorage.removeItem(STORAGE_KEY);
}

export function getStoredUser(): MockUser | null {
  return readUser();
}

type AuthContextValue = {
  user: MockUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(() => readUser());

  const signIn = useCallback(async (email: string, _password: string) => {
    const part = email.split('@')[0] ?? 'guest';
    const name = part.charAt(0).toUpperCase() + part.slice(1);
    const u = { email, name };
    writeUser(u);
    setUser(u);
  }, []);

  const signInGoogle = useCallback(async () => {
    const u = { email: 'google.user@example.com', name: 'Google User' };
    writeUser(u);
    setUser(u);
  }, []);

  const signUp = useCallback(async (name: string, email: string, _password: string) => {
    const u = {
      email,
      name: name.trim() || (email.split('@')[0] ?? 'User'),
    };
    writeUser(u);
    setUser(u);
  }, []);

  const signOut = useCallback(() => {
    writeUser(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, signIn, signInGoogle, signUp, signOut }),
    [user, signIn, signInGoogle, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
