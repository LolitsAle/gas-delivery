import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { sendOtpService } from "@/lib/sendOtp";

export const POST = withAuth(["USER", "ADMIN"], async (_req, ctx) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        phoneNumber: true,
      },
    });

    if (!user?.phoneNumber) {
      return NextResponse.json(
        { message: "Chưa có số điện thoại để xác nhận" },
        { status: 400 },
      );
    }

    await sendOtpService(user.phoneNumber);

    return NextResponse.json({
      message: "OTP đã được gửi",
    });
  } catch (error: any) {
    console.error("POST /api/user/me/phone-verification error:", error);
    return NextResponse.json(
      { message: error?.message || "Không thể gửi OTP" },
      { status: 500 },
    );
  }
});

export const PATCH = withAuth(["USER", "ADMIN"], async (_req, ctx) => {
  try {
    await prisma.user.update({
      where: { id: ctx.user.id },
      data: {
        isVerified: true,
      },
    });

    return NextResponse.json({ message: "Số điện thoại đã được xác thực" });
  } catch (error: any) {
    console.error("PATCH /api/user/me/phone-verification error:", error);
    return NextResponse.json(
      { message: error?.message || "Không thể cập nhật trạng thái xác thực" },
      { status: 500 },
    );
  }
});
