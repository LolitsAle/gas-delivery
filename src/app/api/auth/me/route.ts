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
    const baseUser = await tx.user.findUnique({
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
        tags: true,
      },
    });

    if (!baseUser) return null;

    // 1️⃣ Đảm bảo có ít nhất 1 stove
    let stoves = await tx.stove.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    if (stoves.length === 0) {
      const created = await tx.stove.create({
        data: {
          userId,
          name: "Nhà chính",
          address: baseUser.address || "",
          note: baseUser.addressNote || "",
          defaultProductQuantity: 1,
        },
      });

      stoves = [created];
    }

    // 2️⃣ Đảm bảo mỗi stove có 1 cart
    for (const stove of stoves) {
      const existingCart = await tx.cart.findUnique({
        where: { stoveId: stove.id },
      });

      if (!existingCart) {
        await tx.cart.create({
          data: {
            stoveId: stove.id,
          },
        });
      }
    }

    // 3️⃣ Trả full user + stoves + cart trong stove
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
        tags: true,
        stoves: {
          orderBy: { createdAt: "asc" },
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
            cart: {
              select: {
                id: true,
                items: {
                  orderBy: { createdAt: "asc" },
                  select: {
                    id: true,
                    productId: true,
                    quantity: true,
                    type: true,
                    payByPoints: true,
                    earnPoints: true,
                    parentItemId: true,
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
