import { getCookie, buildClearAuthCookies } from "@/lib/auth/cookies";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/auth/helpers";

export async function POST() {
  try {
    // 1️⃣ Lấy refresh token từ cookie
    const refreshToken = await getCookie("refreshToken");

    if (refreshToken) {
      const refreshTokenHash = hashToken(refreshToken);

      // 2️⃣ Revoke refresh token trong DB (nếu tồn tại)
      await prisma.refreshToken.updateMany({
        where: {
          tokenHash: refreshTokenHash,
          revoked: false,
        },
        data: {
          revoked: true,
        },
      });
    }

    // 3️⃣ Clear cookie (idempotent)
    const headers = buildClearAuthCookies();

    return new Response(
      JSON.stringify({ message: "Đã đăng xuất thành công", ok: true }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Logout error:", error);

    return Response.json(
      { message: "Có lỗi xảy ra khi đăng xuất" },
      { status: 500 }
    );
  }
}
