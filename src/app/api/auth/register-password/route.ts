import { prisma } from "@/lib/prisma";
import { signJwt } from "@/lib/auth/jwt-node";
import {
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
} from "@/lib/auth/authConfig";
import { generateRefreshToken, hashToken } from "@/lib/auth/helpers";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  const {
    phone,
    password,
  }: {
    phone: string;
    password: string;
  } = await req.json();

  if (!phone || !password) {
    return Response.json({ message: "Thiếu thông tin" }, { status: 400 });
  }

  if (password.length < 6) {
    return Response.json(
      { message: "Mật khẩu tối thiểu 6 ký tự" },
      { status: 400 },
    );
  }

  const existedUser = await prisma.user.findUnique({
    where: { phoneNumber: phone },
  });

  if (existedUser) {
    return Response.json(
      { message: "Số điện thoại đã tồn tại" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      phoneNumber: phone,
      passwordHash,
      name: "Khách mới",
      nickname: `User${phone.slice(-4)}`,
      isVerified: true,
      points: process.env.FIRST_CREATED_USER_BONUS_POINTS
        ? parseInt(process.env.FIRST_CREATED_USER_BONUS_POINTS)
        : 0,
    },
  });

  const access_token = signJwt(
    {
      userId: user.id,
      role: user.role,
      sessionVersion: user.sessionVersion,
    },
    ACCESS_TOKEN_EXPIRES,
  );

  const refresh_token = generateRefreshToken();
  const refreshTokenHash = hashToken(refresh_token);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES * 1000),
    },
  });

  return Response.json(
    {
      user,
      access_token,
      refresh_token,
      expires_in: ACCESS_TOKEN_EXPIRES,
    },
    { status: 200 },
  );
}
