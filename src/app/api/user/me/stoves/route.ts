import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { NextResponse } from "next/server";
import { PromoChoiceType } from "@prisma/client";

/* ======================
   GET: list stoves
====================== */
export const GET = withAuth(
  ["USER", "STAFF", "ADMIN"],
  async (req, { user }) => {
    try {
      const stoves = await prisma.stove.findMany({
        where: { userId: user.id },
        include: {
          product: {
            select: {
              id: true,
              productName: true,
              currentPrice: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(stoves);
    } catch (error) {
      return NextResponse.json({ status: 404 });
    }
  },
);

/* ======================
   POST: create stove
====================== */
export const POST = withAuth(
  ["USER", "STAFF", "ADMIN"],
  async (req, { user }) => {
    try {
      const body = await req.json();
      const {
        name,
        productId,
        address,
        note,
        houseImage,
        defaultProductQuantity,
        defaultPromoChoice,
        defaultPromoProductId,
      } = body || {};

      if (!name?.trim() || !productId || !address?.trim()) {
        return NextResponse.json(
          { message: "name, productId and address are required" },
          { status: 400 },
        );
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, tags: true },
      });

      if (!product || !product.tags.includes("BINDABLE")) {
        return NextResponse.json(
          { message: "Invalid product" },
          { status: 400 },
        );
      }

      const stove = await prisma.stove.create({
        data: {
          name: name.trim(),
          address: address.trim(),
          note: note ?? "",
          userId: user.id,
          productId,
          houseImage: houseImage ?? [],
          houseImageCount: (houseImage ?? []).length,
          defaultProductQuantity: defaultProductQuantity ?? 1,
          defaultPromoChoice: defaultPromoChoice || PromoChoiceType.BONUS_POINT,
          defaultPromoProductId: defaultPromoProductId || null,
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

      return NextResponse.json(stove, { status: 201 });
    } catch (error) {
      console.error("CREATE STOVE ERROR:", error);
      return NextResponse.json(
        { message: "Failed to create stove" },
        { status: 500 },
      );
    }
  },
);
