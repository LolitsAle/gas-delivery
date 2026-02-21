import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";

type Params = {
  params: { id: string };
};

export const GET = withAuth(["ADMIN"], async (req, { user, params }) => {
  try {
    const { id } = params as Params["params"];

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        shipper: true,
        stove: {
          include: {
            product: true,
            promoProduct: true,
          },
        },
        stoveSnapshot: true,
        items: {
          include: {
            product: true,
            children: true,
          },
        },
        serviceItems: {
          include: {
            service: true,
            stove: true,
          },
        },
        promotions: {
          include: {
            promotion: true,
          },
        },
      },
    });

    if (!order)
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json(order);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to load order detail" },
      { status: 500 },
    );
  }
});
