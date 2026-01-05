import { signJwt } from "@/lib/auth/jwt-node";
import { prisma } from "@/lib/prisma";
import { generateRefreshToken, hashToken } from "@/lib/auth/helpers";
import {
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
} from "@/lib/auth/authConfig";

export async function POST(req: Request) {
  try {
    const { refresh_token } = await req.json();

    if (!refresh_token) {
      return Response.json(
        { message: "Không tìm thấy refresh token" },
        { status: 401 }
      );
    }

    const refreshTokenHash = hashToken(refresh_token);

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

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    const access_token = signJwt(
      {
        userId: user.id,
        role: user.role,
        sessionVersion: user.sessionVersion,
      },
      ACCESS_TOKEN_EXPIRES
    );

    const refresh_token_new = generateRefreshToken();
    const refreshTokenHashNew = hashToken(refresh_token_new);

    await prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHashNew,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES * 1000),
      },
    });

    return Response.json(
      {
        access_token,
        refresh_token: refresh_token_new,
        expires_in: ACCESS_TOKEN_EXPIRES,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Refresh token error:", error);

    return Response.json(
      { message: "Có lỗi xảy ra khi làm mới phiên đăng nhập" },
      { status: 500 }
    );
  }
}
