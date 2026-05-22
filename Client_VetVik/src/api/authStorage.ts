import type { Role } from "./types";

const TOKEN_KEY = "vetvik:auth";
export const AUTH_STORAGE_CLEARED_EVENT = "vetvik:auth-cleared";

export interface StoredAuth {
  accessToken: string;
  expiresAtUtc: string;
  userId: string;
  email: string;
  roles: Role[];
}

export const authStorage = {
  get(): StoredAuth | null {
    try {
      const raw = localStorage.getItem(TOKEN_KEY);
      return raw ? (JSON.parse(raw) as StoredAuth) : null;
    } catch {
      return null;
    }
  },

  set(auth: StoredAuth): void {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(auth));
  },

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    globalThis.dispatchEvent(new Event(AUTH_STORAGE_CLEARED_EVENT));
  },

  /** Returns the token if present and not expired (with a 30-second skew). */
  getValidToken(): string | null {
    const a = authStorage.get();
    if (!a) return null;
    const expires = new Date(a.expiresAtUtc).getTime();
    if (Number.isNaN(expires)) return null;
    if (Date.now() > expires - 30_000) return null;
    return a.accessToken;
  },
};
