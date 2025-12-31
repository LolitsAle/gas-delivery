import { prisma } from "@/lib/prisma";
import { signJwt } from "@/lib/auth/jwt-node";
import {
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
} from "@/lib/auth/authConfig";
import { buildAuthCookie } from "@/lib/auth/cookies";
import { generateRefreshToken, hashToken } from "@/lib/auth/helpers";

export async function POST(req: Request) {
  const {
    phone,
    otp,
    nickname,
    type,
  }: {
    phone: string;
    otp: string;
    nickname?: string;
    type: "REGISTER" | "LOGIN" | "VERIFY_OTP_ONLY";
  } = await req.json();

  if (!phone || !otp || !type) {
    return Response.json({ message: "Thiếu thông tin" }, { status: 400 });
  }

  const record = await prisma.phoneOtp.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });

  if (!record)
    return Response.json({ message: "OTP không tìm thấy" }, { status: 400 });

  if (record.expiresAt < new Date())
    return Response.json({ message: "OTP đã hết hạn" }, { status: 400 });

  if (record.code !== otp)
    return Response.json({ message: "OTP không hợp lệ" }, { status: 400 });

  let user = await prisma.user.findUnique({
    where: { phoneNumber: phone },
  });

  if (type === "REGISTER") {
    if (user) {
      return Response.json(
        { message: "Số điện thoại đã tồn tại" },
        { status: 409 }
      );
    }

    user = await prisma.user.create({
      data: {
        phoneNumber: phone,
        password: "",
        nickname: nickname || `User${phone.slice(-4)}`,
      },
    });
  }

  if (type === "LOGIN" && !user) {
    return Response.json(
      { message: "Tài khoản không tồn tại" },
      { status: 404 }
    );
  }

  await prisma.phoneOtp.deleteMany({ where: { phone } });

  if (type === "VERIFY_OTP_ONLY") {
    return Response.json({ message: "Xác minh OTP thành công" });
  }

  // 🔐 Access token (JWT)
  const accessToken = signJwt(
    {
      userId: user!.id,
      role: user!.role,
      sessionVersion: user!.sessionVersion,
    },
    ACCESS_TOKEN_EXPIRES
  );

  // 🔐 Refresh token (random string)
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      userId: user!.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES * 1000),
    },
  });

  const headers = buildAuthCookie(
    accessToken,
    ACCESS_TOKEN_EXPIRES,
    refreshToken,
    REFRESH_TOKEN_EXPIRES
  );

  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers,
  });
}
