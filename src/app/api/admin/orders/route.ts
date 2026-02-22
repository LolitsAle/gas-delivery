import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";

const BUSINESS_TAGS = ["BUSINESS", "BUSSINESS"];

export const GET = withAuth(["ADMIN"], async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10", 10), 1),
      100,
    );
    const includeCompleted = searchParams.get("includeCompleted") === "true";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const createdAtFilter: { gte?: Date; lte?: Date } = {};
    if (from) {
      const fromDate = new Date(from);
      if (!Number.isNaN(fromDate.getTime())) createdAtFilter.gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      if (!Number.isNaN(toDate.getTime())) createdAtFilter.lte = toDate;
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        ...(includeCompleted ? {} : { status: { not: "COMPLETED" } }),
        ...(Object.keys(createdAtFilter).length
          ? { createdAt: createdAtFilter }
          : {}),
      },
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

    const sortedOrders = [...orders].sort((a, b) => {
      const aBusiness = a.user?.tags?.some((tag) => BUSINESS_TAGS.includes(tag));
      const bBusiness = b.user?.tags?.some((tag) => BUSINESS_TAGS.includes(tag));

      if (aBusiness === bBusiness) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      return aBusiness ? -1 : 1;
    });

    const total = sortedOrders.length;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * limit;
    const pagedOrders = sortedOrders.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      orders: pagedOrders,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to load admin orders" },
      { status: 500 },
    );
  }
});
