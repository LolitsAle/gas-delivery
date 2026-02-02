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

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { message: "Người dùng chưa đăng nhập" },
      { status: 401 },
    );
  }

  let payload: AccessTokenPayload;

  try {
    payload = verifyJwt<AccessTokenPayload>(
      authHeader.replace("Bearer ", "").trim(),
    );
  } catch {
    return NextResponse.json(
      { message: "Token không hợp lệ hoặc đã hết hạn" },
      { status: 401 },
    );
  }

  const userId = payload.userId;

  const user = await prisma.$transaction(async (tx) => {
    // 1️⃣ đảm bảo cart tồn tại
    const existingCart = await tx.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!existingCart) {
      await tx.cart.create({
        data: { userId },
      });
    }

    // 2️⃣ đảm bảo user có ít nhất 1 stove
    const stoveCount = await tx.stove.count({
      where: { userId },
    });

    if (stoveCount === 0) {
      await tx.stove.create({
        data: {
          userId,
          name: "Nhà chính",
          address: user?.address || "",
          note: user?.addressNote || "",
          defaultProductQuantity: 1,
        },
      });
    }

    // 3️⃣ trả user full data
    return tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phoneNumber: true,
        name: true,
        nickname: true,
        role: true,
        points: true,
        address: true,
        addressNote: true,
        stoves: {
          select: {
            id: true,
            name: true,
            address: true,
            note: true,
            defaultProductQuantity: true,
            defaultPromoChoice: true,
            defaultPromoProductId: true,
            houseImage: true,
            houseImageCount: true,
            productId: true,
            promoProduct: {
              select: {
                id: true,
                productName: true,
                currentPrice: true,
                pointValue: true,
                previewImageUrl: true,
                tags: true,
              },
            },
            product: {
              select: {
                id: true,
                productName: true,
                currentPrice: true,
                pointValue: true,
                previewImageUrl: true,
                tags: true,
              },
            },
          },
        },
        cart: {
          select: {
            id: true,
            stoveId: true,
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
              },
            },
          },
        },
      },
    });
  });

  if (!user) {
    return NextResponse.json(
      { message: "Người dùng không tồn tại" },
      { status: 404 },
    );
  }

  return NextResponse.json({ user }, { status: 200 });
}
