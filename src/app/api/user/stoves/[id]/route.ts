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
        name: body.name ?? undefined,
        address: body.address ?? undefined,
        note: body.note ?? undefined,
        productId: body.productId ?? undefined,
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
