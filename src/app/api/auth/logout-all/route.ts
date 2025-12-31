import { prisma } from "@/lib/prisma";
import { buildClearAuthCookies } from "@/lib/auth/cookies";
import { verifyJwt } from "@/lib/auth/jwt-node";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ message: "Thiếu access token" }, { status: 401 });
    }

    const accessToken = authHeader.split(" ")[1];
    const payload: any = verifyJwt(accessToken);

    if (!payload?.sub) {
      return Response.json(
        { message: "Access token không hợp lệ" },
        { status: 401 }
      );
    }

    // 1️⃣ Tăng sessionVersion
    await prisma.user.update({
      where: { id: payload.sub },
      data: {
        sessionVersion: { increment: 1 },
      },
    });

    // 2️⃣ Revoke tất cả refresh token
    await prisma.refreshToken.updateMany({
      where: {
        userId: payload.sub,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });

    // 3️⃣ Clear cookie thiết bị hiện tại
    const headers = buildClearAuthCookies();

    return new Response(
      JSON.stringify({ message: "Đã đăng xuất khỏi tất cả thiết bị" }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Logout-all error:", error);

    return Response.json(
      { message: "Có lỗi xảy ra khi logout all" },
      { status: 500 }
    );
  }
}
