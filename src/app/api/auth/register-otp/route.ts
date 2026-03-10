import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendOtpService } from "@/lib/sendOtp";

export async function POST(req: Request) {
  const { phone } = await req.json();

  if (!phone) {
    return NextResponse.json({ message: "Thiếu thông tin" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { phoneNumber: phone },
  });

  if (existingUser) {
    return NextResponse.json(
      { message: "Số điện thoại đã đăng ký" },
      { status: 409 },
    );
  }

  try {
    await sendOtpService(phone);
  } catch (error: any) {
    console.error("Send OTP error:", error.message);

    return NextResponse.json(
      { message: "Failed to send OTP" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "OTP sent. Please verify phone number.",
  });
}
