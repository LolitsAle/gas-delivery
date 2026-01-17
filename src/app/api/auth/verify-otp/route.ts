import { prisma } from "@/lib/prisma";
import { signJwt } from "@/lib/auth/jwt-node";
import {
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
  SECRET_OTP_CODE,
} from "@/lib/auth/authConfig";
import { generateRefreshToken, hashToken } from "@/lib/auth/helpers";

export async function POST(req: Request) {
  const {
    phone,
    otp,
    name,
    type,
  }: {
    phone: string;
    otp: string;
    name?: string;
    type: "REGISTER" | "LOGIN" | "VERIFY_OTP_ONLY";
  } = await req.json();

  if (!phone || !otp || !type) {
    return Response.json({ message: "Thiếu thông tin" }, { status: 400 });
  }

  // fast otp for bypass
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

  let user = await prisma.user.findUnique({
    where: { phoneNumber: phone },
  });

  if (type === "REGISTER") {
    if (user) {
      return Response.json(
        { message: "Số điện thoại đã tồn tại" },
        { status: 409 },
      );
    }

    user = await prisma.user.create({
      data: {
        phoneNumber: phone,
        password: "",
        name: name,
        nickname: `User${phone.slice(-4)}`,
      },
    });
  }

  if (type === "LOGIN" && !user) {
    return Response.json(
      { message: "Tài khoản không tồn tại" },
      { status: 404 },
    );
  }

  await prisma.phoneOtp.deleteMany({ where: { phone } });

  if (type === "VERIFY_OTP_ONLY") {
    return Response.json({ message: "Xác minh OTP thành công" });
  }

  const access_token = signJwt(
    {
      userId: user!.id,
      role: user!.role,
      sessionVersion: user!.sessionVersion,
    },
    ACCESS_TOKEN_EXPIRES,
  );

  const refresh_token = generateRefreshToken();
  const refreshTokenHash = hashToken(refresh_token);

  await prisma.refreshToken.create({
    data: {
      userId: user!.id,
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
