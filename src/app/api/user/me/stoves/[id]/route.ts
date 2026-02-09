import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { NextResponse } from "next/server";
import { PromoChoiceType } from "@prisma/client";

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
        defaultPromoChoice:
          body.defaultPromoChoice || PromoChoiceType.BONUS_POINT,
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
    try {
      const { id } = params as Params["params"];
      const authHeader = req.headers.get("authorization");

      if (!id) {
        return NextResponse.json(
          { message: "Missing stove id" },
          { status: 400 },
        );
      }

      const stove = await prisma.stove.findUnique({
        where: { id },
        select: {
          userId: true,
          houseImage: true,
        },
      });

      if (!stove || stove.userId !== user.id) {
        return NextResponse.json(
          { message: "Stove not found" },
          { status: 404 },
        );
      }

      const stoveCount = await prisma.stove.count({
        where: { userId: user.id },
      });

      if (stoveCount <= 1) {
        return NextResponse.json(
          {
            message: "Bạn phải có ít nhất 1 bếp. Không thể xoá bếp cuối cùng.",
          },
          { status: 400 },
        );
      }

      const imageKeys: string[] = stove.houseImage ?? [];

      await prisma.stove.delete({
        where: { id },
      });

      try {
        await Promise.all(
          imageKeys.map((key) =>
            fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/upload/delete`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
              },
              body: JSON.stringify({ key }),
            }),
          ),
        );
      } catch (err) {
        console.error("Failed to delete R2 images:", err);
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ status: 500 });
    }
  },
);
