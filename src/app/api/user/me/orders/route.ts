import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { OrderStatus, CartType } from "@prisma/client";

export const GET = withAuth(["USER", "ADMIN"], async (req, ctx) => {
  try {
    const user = ctx.user;

    const orders = await prisma.order.findMany({
      where: {
        stove: {
          userId: user.id,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        stove: {
          select: {
            id: true,
            name: true,
            address: true,
            note: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                productName: true,
                previewImageUrl: true,
                currentPrice: true,
                pointValue: true,
              },
            },
          },
        },
        serviceItems: true,
      },
    });

    return NextResponse.json(orders);
  } catch (err: any) {
    console.error("GET /user/me/orders error:", err);
    return NextResponse.json(
      { message: err.message || "Không thể tải danh sách đơn hàng" },
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

    const order = await prisma.$transaction(async (tx) => {
      // 1️⃣ Verify stove
      const stove = await tx.stove.findFirst({
        where: {
          id: stoveId,
          userId: user.id,
        },
        include: { product: true },
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

      const EARN_POINT_CART_BINDABLE = 2000;
      const EARN_POINT_STOVE_BINDABLE = 1000;

      let subtotal = 0;
      let totalPointsUse = 0;
      let totalPointsEarn = 0;
      let discountAmount = 0;

      // ===== 1️⃣ Cart items =====
      for (const item of cart.items) {
        if (!item.product || item.parentItemId) continue;

        const price = item.product.currentPrice ?? 0;
        const exchangePoint = item.product.pointValue ?? 0;
        const qty = item.quantity;
        const bindable = item.product.tags?.includes("BINDABLE");

        if (item.payByPoints) {
          totalPointsUse += exchangePoint * qty;
          continue;
        }

        subtotal += price * qty;

        if (bindable) {
          totalPointsEarn += EARN_POINT_CART_BINDABLE * qty;
        }
      }

      // ===== 2️⃣ Stove gas =====
      if (cart.isStoveActive && stove.product && stove.defaultProductQuantity) {
        const qty = stove.defaultProductQuantity;
        const price = stove.product.currentPrice ?? 0;
        const bindable = stove.product.tags?.includes("BINDABLE");

        subtotal += price * qty;

        if (bindable) {
          totalPointsEarn += EARN_POINT_STOVE_BINDABLE * qty;
        }

        if (stove.defaultPromoChoice === "DISCOUNT_CASH") {
          discountAmount += 10000 * qty;
        }

        if (stove.defaultPromoChoice === "BONUS_POINT") {
          totalPointsEarn += 1000 * qty;
        }
      }

      // ===== 3️⃣ Service items =====
      for (const service of cart.serviceItems) {
        subtotal += service.price * service.quantity;
      }

      const shipFee = 0;
      const totalPrice = Math.max(subtotal - discountAmount, 0);

      // ===== 4️⃣ Check điểm (KHÔNG cộng điểm tương lai) =====
      if (totalPointsUse > user.points) {
        throw new Error("Không đủ điểm để tạo đơn");
      }

      // ===== 5️⃣ Create order =====
      const createdOrder = await tx.order.create({
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
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.currentPrice,
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

      // ===== 6️⃣ Clear cart & reset stove =====
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

      return createdOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    console.error("POST /user/orders error:", err);
    return NextResponse.json(
      { message: err.message || "Tạo đơn thất bại" },
      { status: 500 },
    );
  }
});
