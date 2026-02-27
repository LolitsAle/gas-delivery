import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import {
  DiscountSource,
  OrderStatus,
  CartType,
  PromotionActionType,
} from "@prisma/client";
import { emitOrderSocketEvent } from "@/lib/socket/orderEvents";
import {
  BUSINESS_BINDABLE_DISCOUNT_AMOUNT,
  PROMO_BONUS_POINT_AMOUNT,
  PROMO_DISCOUNT_CASH_AMOUNT,
} from "@/constants/promotion";
import { calculateDiscountedProductPrice } from "@/lib/pricing/productPrice";
import {
  calculatePromotionBonusPoints,
  calculatePromotionDiscountPerUnit,
  getMatchedPromotions,
} from "@/lib/pricing/promotionEngine";

export const GET = withAuth(["USER", "ADMIN"], async (req, ctx) => {
  try {
    const user = ctx.user;
    const params = req.nextUrl.searchParams;

    const page = Number(params.get("page") || 1);
    const limit = Number(params.get("limit") || 10);
    const stoveId = params.get("stoveId") || undefined;
    const status = params.get("status") || undefined;
    const timeRange = params.get("timeRange") || "ALL";
    const sort = params.get("sort") === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    // ---- time filter ----
    const now = new Date();
    let createdAt: any;

    if (timeRange === "TODAY") {
      const start = new Date(now.setHours(0, 0, 0, 0));
      createdAt = { gte: start };
    }

    if (timeRange === "WEEK") {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      createdAt = { gte: start };
    }

    if (timeRange === "MONTH") {
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      createdAt = { gte: start };
    }

    const where: any = {
      stove: { userId: user.id },
      ...(stoveId && { stoveId }),
      ...(status && { status }),
      ...(createdAt && { createdAt }),
    };

    const [totalCount, orders] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: sort },
        include: {
          stoveSnapshot: true,

          items: {
            include: {
              product: {
                select: {
                  id: true,
                  productName: true,
                },
              },
            },
          },

          serviceItems: true,
        },
      }),
    ]);

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    });
  } catch (err: any) {
    console.error("GET /user/me/orders error:", err);
    return NextResponse.json(
      { message: err.message || "Không thể tải đơn hàng" },
      { status: 500 },
    );
  }
});

export const POST = withAuth(["USER", "ADMIN"], async (req, ctx) => {
  try {
    const user = ctx.user;
    const { stoveId } = await req.json();

    if (!stoveId) {
      throw new Error("stoveId is required");
    }

    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1️⃣ Verify stove
      const stove = await tx.stove.findFirst({
        where: {
          id: stoveId,
          userId: user.id,
        },
        include: {
          product: true,
          promoProduct: true,
        },
      });

      if (!stove) {
        throw new Error("Bếp không tồn tại hoặc không thuộc user");
      }

      // 2️⃣ Get cart
      const cart = await tx.cart.findUnique({
        where: { stoveId },
        include: {
          items: { include: { product: true } },
          serviceItems: { include: { service: true } },
        },
      });

      if (!cart) throw new Error("Cart không tồn tại");

      if (
        !cart.items.length &&
        !cart.serviceItems.length &&
        !cart.isStoveActive
      ) {
        throw new Error("Cart đang trống");
      }

      const isBusinessUser = user.tags.includes("BUSINESS");
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

      let subtotal = 0;
      let totalPointsUse = 0;
      let totalPointsEarn = 0;
      let discountAmount = 0;

      const orderItemSnapshots: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
        unitPointPrice: number;
        type: any;
        payByPoints: boolean;
        earnPoints: boolean;
        productTagsSnapshot: any[];
        discountPerUnitSnapshot: number;
        appliedDiscountSources: DiscountSource[];
      }> = [];

      // ===== 1️⃣ Cart items =====
      for (const item of cart.items) {
        if (!item.product || item.parentItemId) continue;

        const price = item.product.currentPrice ?? 0;
        const pointPrice = item.product.pointValue ?? 0;
        const qty = item.quantity;
        const bindable = item.product.tags?.includes("BINDABLE");

        const productTagsSnapshot = item.product.tags ?? [];

        if (item.payByPoints) {
          totalPointsUse += pointPrice * qty;
          orderItemSnapshots.push({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product?.currentPrice ?? 0,
            unitPointPrice: item.product?.pointValue ?? 0,
            type: item.type,
            payByPoints: item.payByPoints,
            earnPoints: item.earnPoints,
            productTagsSnapshot,
            discountPerUnitSnapshot: 0,
            appliedDiscountSources: [],
          });
          continue;
        }

        const appliedDiscountSources: DiscountSource[] = [];
        if (bindable && isBusinessUser) {
          appliedDiscountSources.push(DiscountSource.BUSINESS_BINDABLE);
        }

        const { discountPerUnit: promotionDiscountPerUnit } =
          calculatePromotionDiscountPerUnit({
            promotions: activePromotions,
            unitPrice: price,
            context: {
              productTags: item.product.tags,
              categoryId: item.product.categoryId,
              orderType: cart.type,
            },
          });

        if (promotionDiscountPerUnit > 0) {
          appliedDiscountSources.push(DiscountSource.PROMOTION_RULE);
        }

        const itemPricing = calculateDiscountedProductPrice({
          unitPrice: price,
          quantity: qty,
          isBusinessUser,
          isBindableProduct: bindable,
          promotionDiscountPerUnit,
        });

        subtotal += itemPricing.originalTotalPrice;
        discountAmount += itemPricing.totalDiscount;

        orderItemSnapshots.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product?.currentPrice ?? 0,
          unitPointPrice: item.product?.pointValue ?? 0,
          type: item.type,
          payByPoints: item.payByPoints,
          earnPoints: item.earnPoints,
          productTagsSnapshot,
          discountPerUnitSnapshot: itemPricing.discountPerUnit,
          appliedDiscountSources,
        });
      }

      // ===== 2️⃣ Stove gas =====
      let stoveUnitPrice: number | null = null;
      let stoveQuantity: number | null = null;
      let stoveProductTagsSnapshot: any[] = [];
      let stoveDiscountPerUnitSnapshot = 0;
      let stoveAppliedDiscountSources: DiscountSource[] = [];

      if (cart.isStoveActive && stove.product && stove.defaultProductQuantity) {
        const qty = stove.defaultProductQuantity;
        const price = stove.product.currentPrice ?? 0;
        const bindable = stove.product.tags?.includes("BINDABLE");
        stoveProductTagsSnapshot = stove.product.tags ?? [];

        stoveAppliedDiscountSources = [];
        if (bindable && isBusinessUser) {
          stoveAppliedDiscountSources.push(DiscountSource.BUSINESS_BINDABLE);
        }
        if (stove.defaultPromoChoice === "DISCOUNT_CASH") {
          stoveAppliedDiscountSources.push(DiscountSource.STOVE_PROMO_DISCOUNT);
        }

        const { discountPerUnit: stovePromotionDiscountPerUnit } =
          calculatePromotionDiscountPerUnit({
            promotions: activePromotions,
            unitPrice: price,
            context: {
              productTags: stove.product.tags,
              categoryId: stove.product.categoryId,
              orderType: cart.type,
            },
          });

        if (stovePromotionDiscountPerUnit > 0) {
          stoveAppliedDiscountSources.push(DiscountSource.PROMOTION_RULE);
        }

        const stovePricing = calculateDiscountedProductPrice({
          unitPrice: price,
          quantity: qty,
          isBusinessUser,
          isBindableProduct: bindable,
          promotionDiscountPerUnit: stovePromotionDiscountPerUnit,
          stovePromoDiscountPerUnit:
            stove.defaultPromoChoice === "DISCOUNT_CASH"
              ? PROMO_DISCOUNT_CASH_AMOUNT
              : 0,
        });

        subtotal += stovePricing.originalTotalPrice;
        discountAmount += stovePricing.totalDiscount;

        stoveUnitPrice = price;
        stoveQuantity = qty;
        stoveDiscountPerUnitSnapshot = stovePricing.discountPerUnit;

        if (stove.defaultPromoChoice === "BONUS_POINT") {
          totalPointsEarn += PROMO_BONUS_POINT_AMOUNT * qty;
        }
      }

      // ===== 3️⃣ Service items =====
      for (const service of cart.serviceItems) {
        subtotal += service.price * service.quantity;
      }

      const matchedOrderPromotions = getMatchedPromotions(activePromotions, {
        subtotal,
        orderType: cart.type,
        now,
      });

      const promotionBonusPoints = calculatePromotionBonusPoints({
        promotions: activePromotions,
        context: {
          subtotal,
          orderType: cart.type,
          now,
        },
      });

      totalPointsEarn += promotionBonusPoints;

      const shipFee = 0;
      const totalPrice = Math.max(subtotal - discountAmount, 0);

      // ======================================================
      // 🔥 4️⃣ CHECK & DEDUCT POINTS (ANTI-RACE CONDITION)
      // ======================================================
      if (totalPointsUse > 0) {
        const updateResult = await tx.user.updateMany({
          where: {
            id: user.id,
            points: {
              gte: totalPointsUse, // đủ điểm mới trừ
            },
          },
          data: {
            points: {
              decrement: totalPointsUse,
            },
          },
        });

        if (updateResult.count === 0) {
          throw new Error("Không đủ điểm để tạo đơn");
        }
      }

      // ===== 5️⃣ Create order =====
      const order = await tx.order.create({
        data: {
          userId: user.id,
          stoveId,
          type: cart.type,
          subtotal,
          discountAmount,
          shipFee,
          totalPrice,
          status: OrderStatus.PENDING,
          pointsUsed: totalPointsUse,
          pointsEarned: totalPointsEarn,
          pointsSettled: false, // sẽ settle khi complete hoặc cancel
          userTagsSnapshot: user.tags,
          items: {
            create: orderItemSnapshots,
          },
          serviceItems: {
            create: cart.serviceItems.map((item) => ({
              serviceId: item.serviceId,
              stoveId,
              serviceName: item.service.name,
              unitPrice: item.price,
              quantity: item.quantity,
              note: item.note,
            })),
          },
          promotions: {
            create: matchedOrderPromotions.map((promotion) => ({
              promotionId: promotion.id,
              discountAmount: promotion.actions
                .filter((action) => action.type === PromotionActionType.DISCOUNT_AMOUNT)
                .reduce((sum, action) => sum + (action.value ?? 0), 0),
              bonusPoint: promotion.actions
                .filter((action) => action.type === PromotionActionType.BONUS_POINT)
                .reduce((sum, action) => sum + (action.value ?? 0), 0),
              freeShip: promotion.actions.some(
                (action) => action.type === PromotionActionType.FREE_SHIP,
              ),
            })),
          },
        },
      });

      // ===== 6️⃣ Snapshot stove + promo =====
      await tx.orderStoveSnapshot.create({
        data: {
          orderId: order.id,
          stoveName: stove.name,
          address: stove.address,
          note: stove.note,

          productId: stove.product?.id ?? null,
          productName: stove.product?.productName ?? null,
          unitPrice: stoveUnitPrice,
          quantity: stoveQuantity,
          productTagsSnapshot: stoveProductTagsSnapshot,
          discountPerUnitSnapshot: stoveDiscountPerUnitSnapshot,
          appliedDiscountSources: stoveAppliedDiscountSources,

          promoChoice: stove.defaultPromoChoice,
          promoProductId: stove.defaultPromoProductId ?? null,
          promoProductName: stove.promoProduct?.productName ?? null,
          promoProductQuantity: stove.defaultProductQuantity ?? null,
          promoProductUnitPrice: 0,
        },
      });

      // ===== 7️⃣ Clear cart =====
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      await tx.cartServiceItem.deleteMany({
        where: { cartId: cart.id },
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: {
          type: CartType.NORMAL,
          isStoveActive: false,
        },
      });

      return order;
    });

    emitOrderSocketEvent({
      type: "ORDER_CREATED",
      orderId: createdOrder.id,
    });

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (err: any) {
    console.error("POST /user/orders error:", err);
    return NextResponse.json(
      { message: err.message || "Tạo đơn thất bại" },
      { status: 500 },
    );
  }
});
