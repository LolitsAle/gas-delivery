import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { CartItemType, CartType } from "@prisma/client";

type UpdateCartPayload = {
  stoveId?: string | null;
  cartType?: CartType; // 👈 thêm
  items?: {
    productId: string;
    quantity: number;
    payByPoints: boolean;
    earnPoints?: boolean; // 👈 thêm
    type: CartItemType;
    parentItemId?: string | null;
  }[];
};

export const PATCH = withAuth(["USER", "ADMIN", "STAFF"], async (req, ctx) => {
  try {
    const body = (await req.json()) as UpdateCartPayload;
    const user = ctx.user;

    const result = await prisma.$transaction(async (tx) => {
      let cart = await tx.cart.findUnique({ where: { userId: user.id } });

      if (!cart) {
        cart = await tx.cart.create({
          data: {
            userId: user.id,
            stoveId: body.stoveId ?? null,
            type: body.cartType ?? CartType.NORMAL,
          },
        });
      }

      await tx.cart.update({
        where: { id: cart.id },
        data: {
          stoveId: body.stoveId ?? undefined,
          type: body.cartType ?? undefined,
        },
      });

      if (body.items?.length) {
        for (const item of body.items) {
          if (!item.productId || typeof item.quantity !== "number") {
            throw new Error("Invalid cart item");
          }

          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true },
          });
          if (!product) throw new Error("Product not found");

          const existing = await tx.cartItem.findFirst({
            where: {
              cartId: cart.id,
              productId: item.productId,
              payByPoints: item.payByPoints,
              type: item.type,
            },
          });

          if (item.quantity <= 0) {
            if (existing) {
              await tx.cartItem.delete({ where: { id: existing.id } });
            }
            continue;
          }

          if (existing) {
            await tx.cartItem.update({
              where: { id: existing.id },
              data: {
                quantity: item.quantity,
                parentItemId: item.parentItemId ?? null,
                earnPoints: item.earnPoints ?? true,
              },
            });
          } else {
            await tx.cartItem.create({
              data: {
                cartId: cart.id,
                productId: item.productId,
                quantity: item.quantity,
                payByPoints: item.payByPoints,
                earnPoints: item.earnPoints ?? true,
                type: item.type,
                parentItemId: item.parentItemId ?? null,
              },
            });
          }
        }
      }

      return tx.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: { include: { product: true } },
          stove: true,
        },
      });
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("PATCH /user/me/cart error:", err);
    return NextResponse.json(
      { message: err.message || "Internal server error" },
      { status: 500 },
    );
  }
});
