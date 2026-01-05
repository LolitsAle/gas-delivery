// app/api/auth/logout-all/route.ts
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth/jwt-node";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ message: "Thiếu access token" }, { status: 401 });
    }

    const accessToken = authHeader.split(" ")[1];

    let payload: any;
    try {
      payload = verifyJwt(accessToken);
    } catch {
      return Response.json(
        { message: "Access token không hợp lệ hoặc hết hạn" },
        { status: 401 }
      );
    }

    if (!payload?.sub) {
      return Response.json(
        { message: "Access token không hợp lệ" },
        { status: 401 }
      );
    }

    // 1️⃣ Tăng sessionVersion → invalidate tất cả access token hiện tại
    await prisma.user.update({
      where: { id: payload.sub },
      data: {
        sessionVersion: { increment: 1 },
      },
    });

    // 2️⃣ Revoke tất cả refresh token của user
    await prisma.refreshToken.updateMany({
      where: {
        userId: payload.sub,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });

    // 3️⃣ Client sẽ tự clear localStorage, server không dùng cookie nữa

    return new Response(
      JSON.stringify({
        message: "Đã đăng xuất khỏi tất cả thiết bị",
        ok: true,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout-all error:", error);

    return Response.json(
      { message: "Có lỗi xảy ra khi logout all" },
      { status: 500 }
    );
  }
}
