import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { OrderStatus } from "@prisma/client";

type Params = {
  params: { id: string };
};

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["READY", "CANCELLED"],
  READY: ["DELIVERING", "CANCELLED"],
  DELIVERING: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const PATCH = withAuth(["ADMIN"], async (req, { params }) => {
  try {
    const { id } = params as Params["params"];
    const { status, cancelledReason, shipperId } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "Order id is required" },
        { status: 400 },
      );
    }

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      if (!allowedTransitions[order.status].includes(status)) {
        throw new Error(
          `Cannot change status from ${order.status} to ${status}`,
        );
      }

      if (order.status === OrderStatus.COMPLETED) {
        throw new Error("Completed order cannot be modified");
      }

      const updateData: any = { status };

      if (status === OrderStatus.CONFIRMED) {
        updateData.confirmedAt = new Date();
      }

      if (status === OrderStatus.COMPLETED) {
        updateData.deliveredAt = new Date();
      }

      if (status === OrderStatus.CANCELLED) {
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
      if (status === OrderStatus.COMPLETED && !order.pointsSettled) {
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
      if (status === OrderStatus.CANCELLED && !order.pointsSettled) {
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

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("PATCH /admin/orders/:id error:", error);

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 400 },
    );
  }
});
