import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendOtpService } from "@/lib/sendOtp";

export async function POST(req: Request) {
  const { phone } = await req.json();

  if (!phone) {
    return NextResponse.json(
      { message: "Thiếu số điện thoại" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { phoneNumber: phone },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Số điện thoại chưa đăng ký" },
      { status: 404 }
    );
  }

  try {
    await sendOtpService(phone);
  } catch (error: any) {
    console.error("Send OTP error:", error.message);
    return NextResponse.json({ message: "Không thể gửi OTP" }, { status: 500 });
  }

  return NextResponse.json({
    message: "OTP đã được gửi",
  });
}
