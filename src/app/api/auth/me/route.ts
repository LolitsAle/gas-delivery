// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth/jwt-node";
import { getCookie } from "@/lib/auth/cookies";

type AccessTokenPayload = {
  userId: string;
  role: "USER" | "ADMIN" | "STAFF";
  sessionVersion: number;
  iat: number;
  exp: number;
};

export async function GET() {
  const accessToken = await getCookie("access_token");
  console.log("Access Token:", accessToken);

  // ❌ Chưa đăng nhập
  if (!accessToken) {
    return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
  }

  let payload: AccessTokenPayload;

  try {
    payload = verifyJwt<AccessTokenPayload>(accessToken);
  } catch {
    return NextResponse.json(
      { message: "Access token không hợp lệ hoặc đã hết hạn" },
      { status: 401 }
    );
  }

  console.log("Access Token Payload:", payload);

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        phoneNumber: true,
        nickname: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    console.error("Database error:", error);
  }

  if (!user) {
    return NextResponse.json(
      { message: "Người dùng không tồn tại" },
      { status: 404 }
    );
  }

  return NextResponse.json({ user }, { status: 200 });
}
