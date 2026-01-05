import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { signJwt } from "@/lib/auth/jwt-node";
import { buildAuthCookie } from "@/lib/auth/cookies";
import {
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
} from "@/lib/auth/authConfig";
import { generateRefreshToken, hashToken } from "@/lib/auth/helpers";

export async function POST(req: Request) {
  const { phoneNumber, password } = await req.json();

  if (!phoneNumber || !password) {
    return Response.json(
      { message: "Thiếu số điện thoại hoặc mật khẩu" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { phoneNumber },
  });

  if (!user) {
    return Response.json(
      {
        message: "Số điện thoại chưa đăng ký. Vui lòng đăng ký tài khoản.",
        code: "USER_NOT_FOUND",
      },
      { status: 404 }
    );
  }

  const valid = await verifyPassword(password, user.password);

  if (!valid) {
    return Response.json({ message: "Mật khẩu không đúng" }, { status: 401 });
  }

  if (!user.isVerified) {
    return Response.json(
      { message: "Số điện thoại chưa được xác minh" },
      { status: 403 }
    );
  }

  const accessToken = signJwt(
    {
      userId: user.id,
      role: user.role,
      sessionVersion: user.sessionVersion,
    },
    ACCESS_TOKEN_EXPIRES
  );

  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashToken(refreshToken);

  const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES * 1000);

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshTokenHash,
      userId: user.id,
      expiresAt: refreshExpiresAt,
    },
  });

  const headers = buildAuthCookie(
    accessToken,
    ACCESS_TOKEN_EXPIRES,
    refreshToken,
    REFRESH_TOKEN_EXPIRES
  );

  return new Response(
    JSON.stringify({
      user: {
        id: user.id,
        nickname: user.nickname,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    }),
    {
      status: 200,
      headers,
    }
  );
}
