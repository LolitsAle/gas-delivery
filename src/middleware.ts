// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getCookie } from "./lib/auth/cookies";

export default async function middleware(req: NextRequest) {
  const refreshToken = await getCookie("refresh_token");
  console.log("Middleware - Refresh token:", refreshToken);

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
