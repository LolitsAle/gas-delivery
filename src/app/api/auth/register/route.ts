import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { phoneNumber, password, nickname } = await req.json();

  if (!phoneNumber || !password || !nickname) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { phoneNumber },
  });

  if (existingUser) {
    return NextResponse.json(
      { message: "Phone already registered" },
      { status: 409 }
    );
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.create({
    data: {
      phoneNumber,
      password: hashedPassword,
      nickname,
      isVerified: false,
    },
  });

  // TODO: Send OTP SMS

  return NextResponse.json({
    message: "Registered successfully. Please verify phone number.",
  });
}
