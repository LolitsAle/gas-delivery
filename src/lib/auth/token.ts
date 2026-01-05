// src/lib/auth/token.ts
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

function isBrowser() {
  return typeof window !== "undefined";
}

export const tokenStorage = {
  getAccess(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(ACCESS_KEY);
  },

  getRefresh(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(REFRESH_KEY);
  },

  setTokens(access: string, refresh: string) {
    if (!isBrowser()) return;
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },

  setAccess(access: string) {
    if (!isBrowser()) return;
    localStorage.setItem(ACCESS_KEY, access);
  },

  clear() {
    if (!isBrowser()) return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
