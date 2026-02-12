import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { CartItemType, CartType } from "@prisma/client";

type UpdateCartPayload = {
  stoveId?: string | null;
  cartType?: CartType;
  isStoveActive?: boolean;
  items?: {
    productId: string;
    quantity: number;
    payByPoints: boolean;
    earnPoints?: boolean;
    type: CartItemType;
    parentItemId?: string | null;
    promo?: {
      productId: string;
      type: CartItemType;
    };
  }[];
};

export const PATCH = withAuth(["USER", "ADMIN", "STAFF"], async (req, ctx) => {
  try {
    const body = (await req.json()) as UpdateCartPayload;
    const user = ctx.user;

    if (!body.stoveId) {
      throw new Error("stoveId is required");
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Verify stove belongs to user
      const stove = await tx.stove.findFirst({
        where: {
          id: body.stoveId!,
          userId: user.id,
        },
      });

      if (!stove) {
        throw new Error("Stove not found or not owned by user");
      }

      // 2️⃣ Get or create cart
      let cart = await tx.cart.findUnique({
        where: { stoveId: stove.id },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: {
            stoveId: stove.id,
            type: body.cartType ?? CartType.NORMAL,
            isStoveActive: body.isStoveActive ?? false,
          },
        });
      } else {
        const updateData: any = {};

        if (body.cartType) {
          updateData.type = body.cartType;
        }

        if (typeof body.isStoveActive === "boolean") {
          updateData.isStoveActive = body.isStoveActive;
        }

        if (Object.keys(updateData).length > 0) {
          cart = await tx.cart.update({
            where: { id: cart.id },
            data: updateData,
          });
        }
      }

      // 3️⃣ Update cart items
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
              parentItemId: item.parentItemId ?? null,
            },
          });

          // 🧹 Remove item if quantity <= 0
          if (item.quantity <= 0) {
            if (existing) {
              await tx.cartItem.deleteMany({
                where: {
                  OR: [{ id: existing.id }, { parentItemId: existing.id }],
                },
              });
            }
            continue;
          }

          let parentItem;

          if (existing) {
            parentItem = await tx.cartItem.update({
              where: { id: existing.id },
              data: {
                quantity: item.quantity,
                earnPoints: item.earnPoints ?? true,
              },
            });
          } else {
            parentItem = await tx.cartItem.create({
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

          // 🎁 Handle promo gift
          if (
            item.promo &&
            item.promo.type === CartItemType.GIFT_PRODUCT &&
            item.promo.productId
          ) {
            const giftProduct = await tx.product.findUnique({
              where: { id: item.promo.productId },
              select: { id: true },
            });

            if (!giftProduct) throw new Error("Promo product not found");

            const existingGift = await tx.cartItem.findFirst({
              where: {
                cartId: cart.id,
                productId: item.promo.productId,
                type: CartItemType.GIFT_PRODUCT,
                parentItemId: parentItem.id,
              },
            });

            if (existingGift) {
              await tx.cartItem.update({
                where: { id: existingGift.id },
                data: { quantity: item.quantity },
              });
            } else {
              await tx.cartItem.create({
                data: {
                  cartId: cart.id,
                  productId: item.promo.productId,
                  quantity: item.quantity,
                  payByPoints: false,
                  earnPoints: false,
                  type: CartItemType.GIFT_PRODUCT,
                  parentItemId: parentItem.id,
                },
              });
            }
          }
        }
      }

      return tx.cart.findUnique({
        where: { stoveId: stove.id },
        include: {
          items: {
            include: { product: true },
          },
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
