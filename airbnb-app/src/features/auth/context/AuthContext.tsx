import { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../../../lib/api';

interface LoginWithTokenParams {
  token:  string;
  userId: string;
  role:   'HOST' | 'GUEST' | 'ADMIN';
  email:  string;
  name?:  string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  userEmail:       string;
  userName:        string;
  userId:          string;
  token:           string;
  role:            'HOST' | 'GUEST' | 'ADMIN' | '';
  login:           (email: string, password: string) => Promise<void>;
  loginWithToken:  (params: LoginWithTokenParams) => void;
  logout:          () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persist(key: string, value: string) {
  if (value) localStorage.setItem(key, value);
  else localStorage.removeItem(key);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('airbnb-auth') === '1',
  );
  const [userEmail, setUserEmail] = useState(
    () => localStorage.getItem('airbnb-user-email') || '',
  );
  const [userName, setUserName] = useState(
    () => localStorage.getItem('airbnb-user-name') || '',
  );
  const [userId, setUserId] = useState(
    () => localStorage.getItem('airbnb-user-id') || '',
  );
  const [token, setToken] = useState(
    () => localStorage.getItem('token') || '',
  );
  const [role, setRole] = useState<'HOST' | 'GUEST' | 'ADMIN' | ''>(
    () => (localStorage.getItem('airbnb-role') as 'HOST' | 'GUEST' | 'ADMIN' | '') || '',
  );

  // ── Email/password login ──────────────────────────────────────────
  const login = async (email: string, password: string) => {
    type LoginResponse = {
      token: string;
      user: { id: string; email: string; name?: string; role?: 'HOST' | 'GUEST' | 'ADMIN' };
    };

    const res = await api.post<LoginResponse>('/auth/login', { email, password });
    _applySession(res.token, res.user.id, res.user.email, res.user.name ?? '', res.user.role ?? 'GUEST');
  };

  // ── OAuth / token-based login (Google callback) ───────────────────
  const loginWithToken = ({ token: t, userId: id, role: r, email, name }: LoginWithTokenParams) => {
    _applySession(t, id, email, name ?? '', r);
  };

  // ── Shared session setter ─────────────────────────────────────────
  const _applySession = (
    t: string, id: string, email: string, name: string, r: 'HOST' | 'GUEST' | 'ADMIN' | '',
  ) => {
    setIsAuthenticated(true);
    setToken(t);
    setUserId(id);
    setUserEmail(email);
    setUserName(name);
    setRole(r);

    persist('airbnb-auth',       '1');
    persist('token',             t);
    persist('airbnb-user-id',    id);
    persist('airbnb-user-email', email);
    persist('airbnb-user-name',  name);
    persist('airbnb-role',       r);
  };

  // ── Logout ────────────────────────────────────────────────────────
  const logout = () => {
    setIsAuthenticated(false);
    setToken('');
    setUserId('');
    setUserEmail('');
    setUserName('');
    setRole('');
    ['airbnb-auth','token','airbnb-user-id','airbnb-user-email','airbnb-user-name','airbnb-role']
      .forEach((k) => localStorage.removeItem(k));
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated, userEmail, userName, userId, token, role,
      login, loginWithToken, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
