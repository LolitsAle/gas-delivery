// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth/jwt-node";
import {
  calculateOrderLevelPromotionDiscount,
  calculatePromotionDiscountPerUnit,
  getMatchedPromotions,
} from "@/lib/pricing/promotionEngine";
import { calculateDiscountedProductPrice } from "@/lib/pricing/productPrice";
import {
  PROMO_BONUS_POINT_AMOUNT,
  PROMO_DISCOUNT_CASH_AMOUNT,
} from "@/constants/promotion";

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
    const now = new Date();
    const activePromotions = await tx.promotion.findMany({
      where: {
        isActive: true,
        startAt: { lte: now },
        endAt: { gte: now },
      },
      include: {
        conditions: true,
        actions: true,
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

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

    const fullUser = await tx.user.findUnique({
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
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
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
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            cart: {
              select: {
                id: true,
                type: true,
                isStoveActive: true,
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
                        previewImageUrl: true,
                        tags: true,
                        category: {
                          select: {
                            id: true,
                            name: true,
                          },
                        },
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

    if (!fullUser) return null;

    const mapPromotionPrice = <T,>(product: T | null) => {
      if (!product) return null;
      const { discountPerUnit } = calculatePromotionDiscountPerUnit({
        promotions: activePromotions,
        unitPrice: product.currentPrice,
        context: {
          productTags: product.tags,
          categoryId: product.category?.id,
          categoryName: product.category?.name,
        },
      });

      return {
        ...product,
        promotionDiscountPerUnit: discountPerUnit,
      };
    };

    return {
      ...fullUser,
      stoves: fullUser.stoves.map((stove) => {
        const mappedCart = stove.cart
          ? (() => {
              const isBusinessUser = fullUser.tags.includes("BUSINESS");
              let subtotal = 0;
              let itemDiscountTotal = 0;

              const pricedItems = stove.cart.items.map((item) => {
                const product = mapPromotionPrice(item.product) as any;

                if (item.payByPoints || item.parentItemId || !product) {
                  return { ...item, product };
                }

                const pricing = calculateDiscountedProductPrice({
                  unitPrice: product.currentPrice ?? 0,
                  quantity: item.quantity,
                  isBusinessUser,
                  isBindableProduct: product.tags?.includes("BINDABLE"),
                  promotionDiscountPerUnit: product.promotionDiscountPerUnit ?? 0,
                });

                subtotal += pricing.originalTotalPrice;
                itemDiscountTotal += pricing.totalDiscount;

                return { ...item, product };
              });

              if (stove.cart.isStoveActive && stove.product && stove.defaultProductQuantity) {
                const pricedStoveProduct = mapPromotionPrice(stove.product) as any;
                const stovePricing = calculateDiscountedProductPrice({
                  unitPrice: pricedStoveProduct.currentPrice ?? 0,
                  quantity: stove.defaultProductQuantity,
                  isBusinessUser,
                  isBindableProduct: pricedStoveProduct.tags?.includes("BINDABLE"),
                  promotionDiscountPerUnit:
                    pricedStoveProduct.promotionDiscountPerUnit ?? 0,
                  stovePromoDiscountPerUnit:
                    stove.defaultPromoChoice === "DISCOUNT_CASH"
                      ? PROMO_DISCOUNT_CASH_AMOUNT
                      : 0,
                });

                subtotal += stovePricing.originalTotalPrice;
                itemDiscountTotal += stovePricing.totalDiscount;
              }

              const subtotalAfterItemDiscount = Math.max(subtotal - itemDiscountTotal, 0);

              const matchedOrderPromotions = getMatchedPromotions(activePromotions, {
                subtotal,
                orderType: stove.cart.type,
                now,
              });

              const { totalDiscount: orderDiscountTotal } =
                calculateOrderLevelPromotionDiscount({
                  promotions: matchedOrderPromotions,
                  baseAmount: subtotalAfterItemDiscount,
                });

              const discountAmount = Math.min(
                itemDiscountTotal + orderDiscountTotal,
                subtotal,
              );

              return {
                ...stove.cart,
                items: pricedItems,
                pricing: {
                  subtotal,
                  itemDiscountTotal,
                  orderDiscountTotal,
                  discountAmount,
                  totalPrice: Math.max(subtotal - discountAmount, 0),
                  bonusPoint:
                    stove.defaultPromoChoice === "BONUS_POINT"
                      ? PROMO_BONUS_POINT_AMOUNT * stove.defaultProductQuantity
                      : 0,
                },
              };
            })()
          : null;

        return {
          ...stove,
          product: mapPromotionPrice(stove.product),
          promoProduct: mapPromotionPrice(stove.promoProduct),
          cart: mappedCart,
        };
      }),
    };
  });

  if (!user) {
    return NextResponse.json(
      { message: "Người dùng không tồn tại" },
      { status: 404 },
    );
  }

  return NextResponse.json({ user }, { status: 200 });
}
