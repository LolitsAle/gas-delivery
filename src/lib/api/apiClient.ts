// apiClient.ts

export type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: HeadersInit;
};

/* ======================================================
   1️⃣ PUBLIC API CLIENT
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
    credentials: "include",
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
   2️⃣ AUTH API CLIENT (AUTO REFRESH + LOCK)
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
  const res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  if (res.ok) {
    return data as T;
  }

  // 🔄 Access token hết hạn
  if (res.status === 401) {
    // 🔒 Nếu chưa có refresh đang chạy → tạo
    if (!refreshPromise) {
      refreshPromise = refreshToken().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;

    if (refreshed) {
      // retry request ban đầu
      return requestWithRefresh<T>(url, options);
    }

    // ❌ Refresh thất bại → logout
    await logoutClient();
    throw new Error("Phiên đăng nhập đã hết hạn");
  }

  throw new Error(data?.message || "Request failed");
}

/* ======================================================
   Helpers
====================================================== */

async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function logoutClient() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {}
}
