// apiClient.ts

import { tokenStorage } from "@/lib/auth/token";

export type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: HeadersInit;
};

/* ======================================================
   1️⃣ PUBLIC API CLIENT (NO AUTH)
====================================================== */
export async function apiFetchPublic<T = any>(
  url: string,
  options: ApiOptions = {}
): Promise<T> {
  const res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(data?.message || "Public API error");
  }

  return data as T;
}

/* ======================================================
   2️⃣ AUTH API CLIENT (BEARER + AUTO REFRESH + LOCK)
====================================================== */
export async function apiFetchAuth<T = any>(
  url: string,
  options: ApiOptions = {}
): Promise<T> {
  return requestWithRefresh<T>(url, options);
}

/* ======================================================
   Internal refresh lock
====================================================== */

let refreshPromise: Promise<boolean> | null = null;

async function requestWithRefresh<T>(
  url: string,
  options: ApiOptions
): Promise<T> {
  const accessToken = tokenStorage.getAccess();
  const res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  if (res.ok) {
    return data as T;
  }

  if (res.status === 401) {
    // 🔒 Only one refresh request at a time
    if (!refreshPromise) {
      refreshPromise = refreshTokenAction().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;

    if (refreshed) {
      // 🔁 retry original request
      return requestWithRefresh<T>(url, options);
    }

    // ❌ Refresh failed → logout
    clearTokens();
    throw new Error("Phiên đăng nhập đã hết hạn");
  }

  throw new Error(data?.message || "Request failed");
}

/* ======================================================
   Helpers
====================================================== */

async function refreshTokenAction(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return false;

  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();

    if (!data?.access_token) return false;

    tokenStorage.setTokens(data.access_token, data.refresh_token);

    return true;
  } catch {
    return false;
  }
}

function clearTokens() {
  tokenStorage.clear();

  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export function apiLogoutClient() {
  const refreshToken = tokenStorage.getRefresh();

  if (refreshToken) {
    fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    }).catch(() => {});
  }

  tokenStorage.clear();
  localStorage.removeItem("user");

  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
