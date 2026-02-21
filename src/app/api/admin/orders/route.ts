import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";

export const GET = withAuth(["ADMIN"], async () => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
            phoneNumber: true,
            points: true,
            tags: true,
          },
        },
        shipper: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
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
        promotions: {
          include: {
            promotion: true,
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to load admin orders" },
      { status: 500 },
    );
  }
});
