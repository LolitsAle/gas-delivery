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

const isOrderStatus = (value: unknown): value is OrderStatus =>
  typeof value === "string" && Object.values(ORDER_STATUS).includes(value as OrderStatus);

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["DELIVERING", "CANCELLED"],
  DELIVERING: ["UNPAID", "COMPLETED"],
  UNPAID: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const PATCH = withAuth(["ADMIN"], async (req, { params }) => {
  try {
    const { id } = params as Params["params"];
    const { status: rawStatus, cancelledReason, shipperId } = await req.json();
    const status: OrderStatus | null = isOrderStatus(rawStatus)
      ? (rawStatus as OrderStatus)
      : null;

    if (!id) {
      return NextResponse.json(
        { message: "Order id is required" },
        { status: 400 },
      );
    }

    if (!status) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: TxClient) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      const currentStatus: OrderStatus | null = isOrderStatus(order.status)
        ? (order.status as OrderStatus)
        : null;
      if (!currentStatus) {
        throw new Error("Invalid order status in database");
      }

      if (!allowedTransitions[currentStatus].includes(status)) {
        throw new Error(
          `Cannot change status from ${order.status} to ${status}`,
        );
      }

      if (order.status === ORDER_STATUS.COMPLETED) {
        throw new Error("Completed order cannot be modified");
      }

      if (
        order.status === ORDER_STATUS.CONFIRMED &&
        status === ORDER_STATUS.DELIVERING &&
        !shipperId &&
        !order.shipperId
      ) {
        throw new Error("Shipper is required when moving to DELIVERING");
      }

      const updateData: any = { status };

      if (status === ORDER_STATUS.CONFIRMED) {
        updateData.confirmedAt = new Date();
      }

      if (status === ORDER_STATUS.UNPAID || status === ORDER_STATUS.COMPLETED) {
        updateData.deliveredAt = new Date();
      }

      if (status === ORDER_STATUS.CANCELLED) {
        updateData.cancelledReason = cancelledReason || "Cancelled by admin";
      }

      if (shipperId) {
        updateData.shipperId = shipperId;
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: updateData,
      });

      /**
       * ===========================
       * 🎯 XỬ LÝ ĐIỂM (FLOW MỚI)
       * ===========================
       */

      // ✅ COMPLETE → chỉ cộng điểm thưởng
      if (status === ORDER_STATUS.COMPLETED && !order.pointsSettled) {
        const pointsEarned = order.pointsEarned ?? 0;

        if (pointsEarned > 0) {
          await tx.user.update({
            where: { id: order.userId },
            data: {
              points: {
                increment: pointsEarned,
              },
            },
          });
        }

        await tx.order.update({
          where: { id },
          data: {
            pointsSettled: true,
          },
        });
      }

      // 🔴 CANCEL → refund điểm đã trừ lúc tạo đơn
      if (status === ORDER_STATUS.CANCELLED && !order.pointsSettled) {
        const pointsUsed = order.pointsUsed ?? 0;

        if (pointsUsed > 0) {
          await tx.user.update({
            where: { id: order.userId },
            data: {
              points: {
                increment: pointsUsed,
              },
            },
          });
        }

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
    console.error("PATCH /admin/orders/:id error:", error);

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 400 },
    );
  }
});
