import { prisma } from "@/lib/prisma";
import { signJwt } from "@/lib/auth/jwt-node";
import {
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
  SECRET_OTP_CODE,
} from "@/lib/auth/authConfig";
import { generateRefreshToken, hashToken } from "@/lib/auth/helpers";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  const {
    phone,
    otp,
    name,
    password,
  }: {
    phone: string;
    otp: string;
    name?: string;
    password: string;
  } = await req.json();

  if (!phone || !otp || !name || !password) {
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
    return Response.json({ message: "Số điện thoại đã tồn tại" }, { status: 409 });
  }

  if (otp !== SECRET_OTP_CODE) {
    const record = await prisma.phoneOtp.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return Response.json({ message: "OTP không tìm thấy" }, { status: 400 });
    }

    if (record.expiresAt < new Date()) {
      return Response.json({ message: "OTP đã hết hạn" }, { status: 400 });
    }

    if (record.code !== otp) {
      return Response.json({ message: "OTP không hợp lệ" }, { status: 400 });
    }
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      phoneNumber: phone,
      passwordHash,
      name,
      nickname: `User${phone.slice(-4)}`,
      isVerified: true,
      points: process.env.FIRST_CREATED_USER_BONUS_POINTS
        ? parseInt(process.env.FIRST_CREATED_USER_BONUS_POINTS)
        : 0,
    },
  });

  await prisma.phoneOtp.deleteMany({ where: { phone } });

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
