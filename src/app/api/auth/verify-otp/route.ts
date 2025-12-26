// app/api/auth/verify-otp/route.ts
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { phone, otp } = await req.json();

  const record = await prisma.phoneOtp.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });

  if (!record)
    return Response.json({ error: "OTP not found" }, { status: 400 });

  if (record.expiresAt < new Date())
    return Response.json({ error: "OTP expired" }, { status: 400 });

  if (record.code !== otp)
    return Response.json({ error: "Invalid OTP" }, { status: 400 });

  // ✅ OTP đúng → tạo user nếu chưa có
  let user = await prisma.user.findUnique({
    where: { phoneNumber: phone },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phoneNumber: phone,
        password: "", // mật khẩu rỗng, user cần đặt lại sau
        nickname: `User${phone.slice(-4)}`,
      },
    });
  }

  // ❌ xoá OTP sau khi dùng
  await prisma.phoneOtp.deleteMany({ where: { phone } });

  // 🔐 tạo JWT
  const accessToken = jwt.sign(
    { sub: user.id },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "15m" }
  );

  return Response.json({
    user,
    accessToken,
  });
}
