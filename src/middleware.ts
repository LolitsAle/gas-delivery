import { NextRequest, NextResponse } from "next/server";
import { verifyJwtEdge } from "@/lib/auth/jwt-edge";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ ĐÚNG tên cookie
  const accessToken = req.cookies.get("access_token")?.value;
  console.log("accessToken", accessToken);

  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const payload = await verifyJwtEdge(accessToken);
    /**
     * payload chuẩn:
     * {
     *   sub: string
     *   role: "USER" | "ADMIN"
     *   sv: number
     *   exp: number
     * }
     */

    // 🔐 Protect admin routes
    if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    // ❌ Access token hết hạn / không hợp lệ
    // 👉 KHÔNG redirect thẳng login
    // 👉 Cho frontend gọi /api/auth/refresh
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"],
};
