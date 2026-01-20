import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { NextResponse } from "next/server";

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
    const body = await req.json();
    const { name, productId, address, note } = body || {};

    if (!productId || !address) {
      return NextResponse.json(
        { message: "productId and address are required" },
        { status: 400 },
      );
    }

    // ensure product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    const stove = await prisma.stove.create({
      data: {
        name: name || "",
        address,
        note: note || null,
        productId,
        userId: user.id,
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
  },
);
