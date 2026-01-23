// app/api/admin/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { OrderStatus } from "@prisma/client";

export const PUT = withAuth(["ADMIN", "STAFF"], async (req, ctx) => {
  try {
    const orderId = ctx.params.id as string;
    const body = (await req.json()) as {
      stove?: { stoveId?: string | null };
      status?: OrderStatus;
      note?: string;
      items?: { productId: string; quantity: number }[];
    };

    if (!orderId) {
      throw new Error("không tìm thấy đơn hàng");
    }

    /* =====================
       LOAD ORDER
    ====================== */
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Đơn hàng không tồn tại" },
        { status: 404 },
      );
    }

    /* =====================
       TRANSACTION
    ====================== */
    const updatedOrder = await prisma.$transaction(async (tx) => {
      let stoveId = order.stoveId;

      /* ---------- STOVE ---------- */
      if (body.stove) {
        if (body.stove.stoveId === null) {
          stoveId = "";
        } else if (body.stove.stoveId) {
          const stove = await tx.stove.findFirst({
            where: {
              id: body.stove.stoveId,
              userId: order.userId,
            },
          });

          if (!stove) {
            throw new Error("Bếp không hợp lệ");
          }

          stoveId = stove.id;
        }
      }

      /* ---------- ITEMS ---------- */
      let totalPrice = order.totalPrice;

      if (body.items) {
        if (body.items.length === 0) {
          throw new Error("Đơn hàng phải có ít nhất 1 sản phẩm");
        }

        const productIds = body.items.map((i) => i.productId);

        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
        });

        if (products.length !== productIds.length) {
          throw new Error("Có sản phẩm không tồn tại");
        }

        const productMap = new Map(products.map((p) => [p.id, p]));

        totalPrice = 0;

        const newItems = body.items.map((i) => {
          const product = productMap.get(i.productId)!;
          const quantity = Math.max(1, i.quantity);

          totalPrice += product.currentPrice * quantity;

          return {
            productId: product.id,
            quantity,
            unitPrice: product.currentPrice,
            isFree: false,
          };
        });

        // delete old items
        await tx.orderItem.deleteMany({
          where: { orderId: order.id },
        });

        // create new items
        // await tx.orderItem.createMany({
        //   data: newItems.map((i) => ({
        //     ...i,
        //     orderId: order.id,
        //   })),
        // });
      }

      /* ---------- UPDATE ORDER ---------- */
      return await tx.order.update({
        where: { id: order.id },
        data: {
          stoveId,
          status: body.status ?? order.status,
          note: body.note ?? order.note,
          totalPrice,
        },
        include: {
          items: {
            include: { product: true },
          },
          user: true,
          stove: true,
        },
      });
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (err: any) {
    console.error("[UPDATE_ORDER]", err);

    return NextResponse.json(
      { message: err.message || "Không thể cập nhật đơn hàng" },
      { status: 500 },
    );
  }
});

export const DELETE = withAuth(["ADMIN"], async (_req, ctx) => {
  try {
    const orderId = ctx.params.id as string;

    if (!orderId) {
      return NextResponse.json({ message: "Thiếu orderId" }, { status: 400 });
    }

    /* =====================
       LOAD ORDER
    ====================== */
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Đơn hàng không tồn tại" },
        { status: 404 },
      );
    }

    /* =====================
       BUSINESS RULE
    ====================== */
    if (["DELIVERING", "COMPLETED"].includes(order.status)) {
      return NextResponse.json(
        { message: "Không thể xóa đơn hàng đang giao hoặc đã hoàn thành" },
        { status: 400 },
      );
    }

    /* =====================
       TRANSACTION DELETE
    ====================== */
    await prisma.$transaction(async (tx) => {
      // delete order items first (FK safe)
      await tx.orderItem.deleteMany({
        where: { orderId },
      });

      // delete order
      await tx.order.delete({
        where: { id: orderId },
      });
    });

    return NextResponse.json(
      { message: "Đã xóa đơn hàng thành công" },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("[DELETE_ORDER]", err);

    return NextResponse.json(
      { message: err.message || "Không thể xóa đơn hàng" },
      { status: 500 },
    );
  }
});
