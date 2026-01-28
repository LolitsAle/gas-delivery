import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { NextResponse } from "next/server";

type Params = {
  params: { id: string };
};

/* ======================
   PUT: update stove
====================== */
export const PUT = withAuth(
  ["USER", "STAFF", "ADMIN"],
  async (req, { user, params }) => {
    const { id } = params as Params["params"];

    if (!id) {
      return NextResponse.json(
        { message: "Missing stove id" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const stove = await prisma.stove.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!stove || stove.userId !== user.id) {
      return NextResponse.json({ message: "Stove not found" }, { status: 404 });
    }

    const updated = await prisma.stove.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.note !== undefined && { note: body.note }),
        ...(body.productId !== undefined && { productId: body.productId }),
        ...(body.houseImage !== undefined && {
          houseImage: body.houseImage,
          houseImageCount: body.houseImage.length,
        }),
        ...(body.defaultProductQuantity !== undefined && {
          defaultProductQuantity: body.defaultProductQuantity,
        }),
        ...(body.defaultPromoChoice !== undefined && {
          defaultPromoChoice: body.defaultPromoChoice,
        }),
        ...(body.defaultPromoProductId !== undefined && {
          defaultPromoProductId: body.defaultPromoProductId,
        }),
      },
      include: {
        product: {
          select: {
            id: true,
            productName: true,
            currentPrice: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  },
);

/* ======================
   DELETE: remove stove
====================== */
export const DELETE = withAuth(
  ["USER", "STAFF", "ADMIN"],
  async (req, { user, params }) => {
    const { id } = params as Params["params"];

    const stove = await prisma.stove.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!stove || stove.userId !== user.id) {
      return NextResponse.json({ message: "Stove not found" }, { status: 404 });
    }

    await prisma.stove.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  },
);
