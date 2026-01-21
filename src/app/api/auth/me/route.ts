// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth/jwt-node";

type AccessTokenPayload = {
  userId: string;
  role: "USER" | "ADMIN" | "STAFF";
  sessionVersion: number;
  iat: number;
  exp: number;
};

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { message: "Người dùng chưa đăng nhập" },
      { status: 401 },
    );
  }

  const accessToken = authHeader.replace("Bearer ", "").trim();

  let payload: AccessTokenPayload;

  try {
    payload = verifyJwt<AccessTokenPayload>(accessToken);
  } catch {
    return NextResponse.json(
      { message: "Token không hợp lệ hoặc đã hết hạn" },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      phoneNumber: true,
      name: true,
      nickname: true,
      role: true,
      points: true,
      createdAt: true,
      updatedAt: true,
      address: true,
      addressNote: true,
      stoves: {
        select: {
          id: true,
          name: true,
          address: true,
          productId: true,
          note: true,
          createdAt: true,
          updatedAt: true,
          product: {
            select: {
              id: true,
              productName: true,
              currentPrice: true,
            },
          },
        },
      },
      cart: {
        select: {
          id: true,
          items: {
            select: {
              id: true,
              productId: true,
              quantity: true,
              type: true,
              payByPoints: true,
              earnPoints: true,
              product: {
                select: {
                  id: true,
                  productName: true,
                  currentPrice: true,
                  pointValue: true,
                  tags: true,
                },
              },
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Người dùng không tồn tại" },
      { status: 404 },
    );
  }

  return NextResponse.json({ user }, { status: 200 });
}
