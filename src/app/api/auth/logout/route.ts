// app/api/auth/logout/route.ts
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/auth/helpers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const refreshToken = body?.refresh_token;

    if (!refreshToken) {
      return NextResponse.json(
        { ok: true, message: "Đã đăng xuất" },
        { status: 200 }
      );
    }

    const refreshTokenHash = hashToken(refreshToken);

    await prisma.refreshToken.updateMany({
      where: {
        tokenHash: refreshTokenHash,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });

    return NextResponse.json(
      { ok: true, message: "Đã đăng xuất thành công" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      { message: "Có lỗi xảy ra khi đăng xuất" },
      { status: 500 }
    );
  }
}
