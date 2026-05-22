import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../../api/endpoints';
import { AUTH_STORAGE_CLEARED_EVENT, authStorage } from '../../api/authStorage';
import {
  apiRoleToAppRole,
  type AppRole,
  type AppUser,
} from './roles';

const USER_KEY = 'vetvik:user';

interface RegisterClientInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthContextValue {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<AppRole>;
  registerClient: (input: RegisterClientInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredUser(): AppUser | null {
  try {
    if (!authStorage.getValidToken()) {
      localStorage.removeItem(USER_KEY);
      return null;
    }
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

function persistUser(user: AppUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}

function userFromAuthResponse(
  auth: { userId: string; email: string; roles: string[] },
  profile?: { firstName?: string | null; lastName?: string | null },
): AppUser {
  const primaryRole = auth.roles.map(apiRoleToAppRole).sort((a, b) => {
    const order: AppRole[] = ['superadmin', 'admin', 'doctor', 'client'];
    return order.indexOf(a) - order.indexOf(b);
  })[0];

  return {
    userId: auth.userId,
    email: auth.email,
    firstName: profile?.firstName ?? auth.email.split('@')[0],
    lastName: profile?.lastName ?? '',
    role: primaryRole ?? 'client',
    isProtected: primaryRole === 'superadmin',
  };
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<AppUser | null>(() => loadStoredUser());

  const applySession = useCallback((nextUser: AppUser, tokenPayload?: Parameters<typeof authStorage.set>[0]) => {
    if (tokenPayload) {
      authStorage.set(tokenPayload);
    }
    persistUser(nextUser);
    setUser(nextUser);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AppRole> => {
    const auth = await authApi.login({ email, password });
    let profile: { firstName?: string | null; lastName?: string | null } | undefined;
    try {
      const me = await authApi.me();
      profile = { firstName: me.firstName, lastName: me.lastName };
    } catch {
      // Profile fetch is optional during login.
    }
    const nextUser = userFromAuthResponse(auth, profile);
    applySession(nextUser, {
      accessToken: auth.accessToken,
      expiresAtUtc: auth.expiresAtUtc,
      userId: auth.userId,
      email: auth.email,
      roles: auth.roles,
    });
    return nextUser.role;
  }, [applySession]);

  const registerClient = useCallback(async (input: RegisterClientInput) => {
    const auth = await authApi.registerOwner({
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
    });
    const nextUser: AppUser = {
      userId: auth.userId,
      email: auth.email,
      firstName: input.firstName,
      lastName: input.lastName,
      role: 'client',
    };
    applySession(nextUser, {
      accessToken: auth.accessToken,
      expiresAtUtc: auth.expiresAtUtc,
      userId: auth.userId,
      email: auth.email,
      roles: auth.roles,
    });
  }, [applySession]);

  useEffect(() => {
    const clearSession = () => {
      clearStoredUser();
      setUser(null);
    };

    globalThis.addEventListener(AUTH_STORAGE_CLEARED_EVENT, clearSession);
    return () => globalThis.removeEventListener(AUTH_STORAGE_CLEARED_EVENT, clearSession);
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    clearStoredUser();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, registerClient, logout }),
    [user, login, registerClient, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
