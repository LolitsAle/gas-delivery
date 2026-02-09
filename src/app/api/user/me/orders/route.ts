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
      // 1️⃣ Verify stove thuộc user
      const stove = await tx.stove.findFirst({
        where: {
          id: stoveId,
          userId: user.id,
        },
      });

      if (!stove) {
        throw new Error("Bếp không tồn tại hoặc không thuộc user");
      }

      // 2️⃣ Lấy cart theo stoveId
      const cart = await tx.cart.findUnique({
        where: { stoveId },
        include: {
          items: { include: { product: true } },
          serviceItems: { include: { service: true } },
        },
      });

      if (!cart) {
        throw new Error("Cart không tồn tại");
      }

      if (!cart.items.length && !cart.serviceItems.length) {
        throw new Error("Cart đang trống");
      }

      // ===== TÍNH TIỀN =====
      let subtotal = 0;

      for (const item of cart.items) {
        if (!item.payByPoints) {
          subtotal += item.product.currentPrice * item.quantity;
        }
      }

      for (const service of cart.serviceItems) {
        subtotal += service.price * service.quantity;
      }

      const shipFee = 0;
      const discountAmount = 0;
      const totalPrice = subtotal - discountAmount + shipFee;

      // ===== TẠO ORDER =====
      const createdOrder = await tx.order.create({
        data: {
          userId: user.id, // có thể giữ tạm để tiện query
          stoveId,
          type: cart.type,
          subtotal,
          discountAmount,
          shipFee,
          totalPrice,
          status: OrderStatus.PENDING,
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

      // ===== CLEAR CART (KHÔNG unbind stove) =====
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
