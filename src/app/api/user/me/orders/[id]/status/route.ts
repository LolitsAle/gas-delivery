import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { emitOrderSocketEvent } from "@/lib/socket/orderEvents";

const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  DELIVERING: "DELIVERING",
  UNPAID: "UNPAID",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
type TxClient = typeof prisma;

type Params = {
  params: { id: string };
};

export const PATCH = withAuth(["USER", "ADMIN"], async (req, ctx) => {
  try {
    const { id } = ctx.params as Params["params"];
    const { status, cancelledReason } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "Order id is required" }, { status: 400 });
    }

    if (status !== ORDER_STATUS.CANCELLED) {
      return NextResponse.json(
        { message: "Customers can only cancel orders" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx: TxClient) => {
      const order = await tx.order.findUnique({ where: { id } });

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.userId !== ctx.user.id) {
        throw new Error("Bạn không có quyền thao tác đơn này");
      }

      if (order.status !== ORDER_STATUS.PENDING) {
        throw new Error("Chỉ có thể hủy đơn ở trạng thái chờ");
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: ORDER_STATUS.CANCELLED,
          cancelledReason: cancelledReason || "Cancelled by customer",
        },
      });

      if (!order.pointsSettled && order.pointsUsed > 0) {
        await tx.user.update({
          where: { id: order.userId },
          data: {
            points: {
              increment: order.pointsUsed,
            },
          },
        });
      }

      if (!order.pointsSettled) {
        await tx.order.update({
          where: { id },
          data: {
            pointsSettled: true,
          },
        });
      }

      return updatedOrder;
    });

    emitOrderSocketEvent({
      type: "ORDER_UPDATED",
      orderId: result.id,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("PATCH /api/user/me/orders/:id/status error:", error);

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 400 },
    );
  }
});
