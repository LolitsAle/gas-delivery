import { getCookie, buildAuthCookie } from "@/lib/auth/cookies";
import { signJwt } from "@/lib/auth/jwt-node";
import { prisma } from "@/lib/prisma";
import { generateRefreshToken, hashToken } from "@/lib/auth/helpers";
import {
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
} from "@/lib/auth/authConfig";

export async function POST() {
  try {
    // 1️⃣ Lấy refresh token từ cookie
    const refreshToken = await getCookie("refresh_token");

    if (!refreshToken) {
      return Response.json(
        { message: "Không tìm thấy refresh token" },
        { status: 401 }
      );
    }

    const refreshTokenHash = hashToken(refreshToken);

    // 2️⃣ Tìm refresh token trong DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash: refreshTokenHash },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            isVerified: true,
            sessionVersion: true,
          },
        },
      },
    });

    if (!storedToken) {
      return Response.json(
        { message: "Refresh token không hợp lệ" },
        { status: 401 }
      );
    }

    // 3️⃣ Kiểm tra trạng thái token
    if (storedToken.revoked) {
      return Response.json(
        { message: "Refresh token đã bị thu hồi" },
        { status: 401 }
      );
    }

    if (storedToken.expiresAt < new Date()) {
      return Response.json(
        { message: "Refresh token đã hết hạn" },
        { status: 401 }
      );
    }

    const user = storedToken.user;

    if (!user) {
      return Response.json(
        { message: "Tài khoản không hợp lệ" },
        { status: 401 }
      );
    }

    // 4️⃣ Revoke refresh token cũ (ROTATION)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // 5️⃣ Tạo access token mới
    const newAccessToken = signJwt(
      {
        userId: user.id,
        role: user.role,
        sessionVersion: user.sessionVersion,
      },
      ACCESS_TOKEN_EXPIRES
    );

    // 6️⃣ Tạo refresh token mới
    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenHash = hashToken(newRefreshToken);

    const newRefreshExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRES * 1000
    );

    await prisma.refreshToken.create({
      data: {
        tokenHash: newRefreshTokenHash,
        userId: user.id,
        expiresAt: newRefreshExpiresAt,
      },
    });

    // 7️⃣ Set cookie
    const headers = buildAuthCookie(
      newAccessToken,
      ACCESS_TOKEN_EXPIRES,
      newRefreshToken,
      REFRESH_TOKEN_EXPIRES
    );

    return new Response(
      JSON.stringify({ message: "Làm mới phiên đăng nhập thành công" }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Refresh token error:", error);

    return Response.json(
      { message: "Có lỗi xảy ra khi làm mới phiên đăng nhập" },
      { status: 500 }
    );
  }
}
