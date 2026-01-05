// lib/auth/cookies.ts
import { cookies } from "next/headers";

/**
 * Kiểm tra môi trường production
 * → prod: thêm Secure
 * → dev: không thêm Secure (localhost)
 */
const isProd = process.env.NODE_ENV === "production";

/**
 * Build 1 cookie HttpOnly chuẩn cho auth
 */
export function buildHttpOnlyCookie(
  name: string,
  value: string,
  maxAge: number
) {
  console.log(
    "Build cookie:",
    `${name}=${value}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${
      isProd ? "; Secure" : ""
    }`
  );
  return `${name}=${value}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${
    isProd ? "; Secure" : ""
  }`;
}

/**
 * Build headers set access + refresh token
 */
export function buildAuthCookie(
  accessToken: string,
  accessMaxAge: number,
  refreshToken: string,
  refreshMaxAge: number
) {
  const headers = new Headers();

  headers.append(
    "Set-Cookie",
    buildHttpOnlyCookie("access_token", accessToken, accessMaxAge)
  );

  headers.append(
    "Set-Cookie",
    buildHttpOnlyCookie("refresh_token", refreshToken, refreshMaxAge)
  );

  return headers;
}

/**
 * Clear auth cookies (logout)
 */
export function buildClearAuthCookies() {
  const headers = new Headers();

  headers.append("Set-Cookie", buildHttpOnlyCookie("access_token", "", 0));

  headers.append("Set-Cookie", buildHttpOnlyCookie("refresh_token", "", 0));

  return headers;
}

/**
 * Get cookie value (server only)
 */
export async function getCookie(name: string) {
  const store = await cookies();
  return store.get(name)?.value;
}
