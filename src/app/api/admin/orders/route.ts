import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { OrderStatus } from "@prisma/client";

interface CreateOrderRequest {
  userId: string;
  stove: {
    stoveId?: string;
    address?: string;
    note?: string;
  };
  items: {
    productId: string;
    quantity: number;
  }[];
  note?: string;
}

export const GET = withAuth(["ADMIN", "STAFF"], async (req) => {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);

  const skip = (page - 1) * limit;

  const where: any = {
    ...(status ? { status } : {}),
    ...(search && {
      OR: [
        { id: { contains: search, mode: "insensitive" } },
        {
          user: {
            phoneNumber: { contains: search },
          },
        },
        {
          user: {
            nickname: { contains: search },
          },
        },
      ],
    }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            phoneNumber: true,
            nickname: true,
          },
        },
        stove: {
          select: {
            id: true,
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
              },
            },
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const POST = withAuth(["ADMIN", "STAFF"], async (req, ctx) => {
  try {
    const body = (await req.json()) as CreateOrderRequest;

    if (!body.userId) {
      return NextResponse.json({ message: "Thiếu userId" }, { status: 400 });
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { message: "Đơn hàng phải có ít nhất 1 sản phẩm" },
        { status: 400 },
      );
    }

    /* =====================
       LOAD USER
    ====================== */
    const user = await prisma.user.findUnique({
      where: { id: body.userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Khách hàng không tồn tại" },
        { status: 404 },
      );
    }

    /* =====================
       TRANSACTION
    ====================== */
    const order = await prisma.$transaction(async (tx) => {
      /* ---------- LOAD PRODUCTS + CATEGORY ---------- */
      const productIds = body.items.map((i) => i.productId);

      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        include: {
          category: true,
        },
      });

      if (products.length !== productIds.length) {
        throw new Error("Có sản phẩm không tồn tại");
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      /* ---------- FIND BINDABLE PRODUCT ---------- */
      // const bindableProduct = products.find((p) => p.category.bindable);

      /* ---------- STOVE ---------- */
      let stoveId: string;

      if (body.stove?.stoveId) {
        const stove = await tx.stove.findFirst({
          where: {
            id: body.stove.stoveId,
            userId: user.id,
          },
        });

        if (!stove) {
          throw new Error("Bếp không hợp lệ");
        }

        stoveId = stove.id;
      } else {
        // 🔥 AUTO CREATE STOVE → REQUIRE BINDABLE PRODUCT
        // if (!bindableProduct) {
        //   throw new Error(
        //     "Đơn hàng phải có ít nhất 1 sản phẩm thuộc nhóm có thể gắn với bếp"
        //   );
        // }

        const newStove = await tx.stove.create({
          data: {
            userId: user.id,
            // productId: bindableProduct.id,
            address: body.stove?.address || user.address || "Chưa có địa chỉ",
            note: body.stove?.note,
          },
        });

        stoveId = newStove.id;
      }

      /* ---------- CALCULATE ORDER ITEMS ---------- */
      let totalPrice = 0;

      const orderItemsData = body.items.map((i) => {
        const product = productMap.get(i.productId)!;

        const quantity = Math.max(1, i.quantity);
        const unitPrice = product.currentPrice;

        totalPrice += unitPrice * quantity;

        return {
          productId: product.id,
          quantity,
          unitPrice,
          isFree: false,
        };
      });

      /* ---------- CREATE ORDER ---------- */
      // const order = await tx.order.create({
      //   data: {
      //     userId: user.id,
      //     stoveId,
      //     status: OrderStatus.CONFIRMED, // ✅ admin/staff luôn confirmed
      //     totalPrice,
      //     // note: body.note,
      //     // items: {
      //     //   createMany: {
      //     //     data: orderItemsData,
      //     //   },
      //     // },
      //   },
      //   include: {
      //     items: {
      //       include: {
      //         product: true,
      //       },
      //     },
      //     user: true,
      //     stove: true,
      //   },
      // });

      // return order;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err: any) {
    console.error("[CREATE_ORDER]", err);

    return NextResponse.json(
      {
        message: err.message || "Không thể tạo đơn hàng",
      },
      { status: 500 },
    );
  }
});
