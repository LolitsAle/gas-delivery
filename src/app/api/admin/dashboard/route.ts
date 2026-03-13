import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { NextResponse } from "next/server";

const doneStatuses = ["COMPLETED", "CANCELLED"];

export const GET = withAuth(["ADMIN", "STAFF"], async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

  const [dayOrders, monthOrders, quarterOrders, pendingOrders, totalUsers, unverifiedUsers, recentOrders] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfQuarter } } }),
      prisma.order.count({ where: { status: { notIn: doneStatuses as any } } }),
      prisma.user.count(),
      prisma.user.count({ where: { isVerified: false } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true, totalPrice: true, createdAt: true, user: { select: { nickname: true, phoneNumber: true } } },
      }),
    ]);

  return NextResponse.json({
    stats: { dayOrders, monthOrders, quarterOrders, pendingOrders, totalUsers, unverifiedUsers },
    recentOrders,
  });
});
