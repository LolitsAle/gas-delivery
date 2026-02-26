import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { OrderStatus, CartType } from "@prisma/client";
import { emitOrderSocketEvent } from "@/lib/socket/orderEvents";
import {
  BUSINESS_BINDABLE_DISCOUNT_AMOUNT,
  PROMO_BONUS_POINT_AMOUNT,
  PROMO_DISCOUNT_CASH_AMOUNT,
} from "@/constants/promotion";

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

      let subtotal = 0;
      let totalPointsUse = 0;
      let totalPointsEarn = 0;
      let discountAmount = 0;

      // ===== 1️⃣ Cart items =====
      for (const item of cart.items) {
        if (!item.product || item.parentItemId) continue;

        const price = item.product.currentPrice ?? 0;
        const pointPrice = item.product.pointValue ?? 0;
        const qty = item.quantity;
        const bindable = item.product.tags?.includes("BINDABLE");

        if (item.payByPoints) {
          totalPointsUse += pointPrice * qty;
          continue;
        }

        subtotal += price * qty;

        if (bindable && isBusinessUser) {
          discountAmount += BUSINESS_BINDABLE_DISCOUNT_AMOUNT * qty;
        }
      }

      // ===== 2️⃣ Stove gas =====
      let stoveUnitPrice: number | null = null;
      let stoveQuantity: number | null = null;

      if (cart.isStoveActive && stove.product && stove.defaultProductQuantity) {
        const qty = stove.defaultProductQuantity;
        const price = stove.product.currentPrice ?? 0;
        const bindable = stove.product.tags?.includes("BINDABLE");

        subtotal += price * qty;

        stoveUnitPrice = price;
        stoveQuantity = qty;

        if (bindable && isBusinessUser) {
          discountAmount += BUSINESS_BINDABLE_DISCOUNT_AMOUNT * qty;
        }

        if (stove.defaultPromoChoice === "DISCOUNT_CASH") {
          discountAmount += PROMO_DISCOUNT_CASH_AMOUNT * qty;
        }

        if (stove.defaultPromoChoice === "BONUS_POINT") {
          totalPointsEarn += PROMO_BONUS_POINT_AMOUNT * qty;
        }
      }

      // ===== 3️⃣ Service items =====
      for (const service of cart.serviceItems) {
        subtotal += service.price * service.quantity;
      }

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
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product?.currentPrice ?? 0,
              unitPointPrice: item.product?.pointValue ?? 0,
              type: item.type,
              payByPoints: item.payByPoints,
              earnPoints: item.earnPoints,
            })),
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
