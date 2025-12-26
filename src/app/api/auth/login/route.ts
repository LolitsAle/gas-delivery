import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { signJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { phoneNumber, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { phoneNumber },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Số điện thoại và mật khẩu không đúng" },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(password, user.password);

  if (!valid) {
    return NextResponse.json(
      { message: "Số điện thoại và mật khẩu không đúng" },
      { status: 401 }
    );
  }

  if (!user.isVerified) {
    return NextResponse.json(
      { message: "Số điện thoại chưa được xác minh" },
      { status: 403 }
    );
  }

  const token = signJwt({
    userId: user.id,
    role: user.role,
  });

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      nickname: user.nickname,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
  });
}
