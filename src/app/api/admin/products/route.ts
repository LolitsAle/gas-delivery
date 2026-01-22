import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";

export const GET = withAuth(["ADMIN"], async (req) => {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId");
  const sort = searchParams.get("sort") || "productName";
  const order = searchParams.get("order") === "desc" ? "desc" : "asc";

  const products = await prisma.product.findMany({
    where: {
      productName: {
        contains: search,
        mode: "insensitive",
      },
      ...(categoryId ? { categoryId } : {}),
    },
    include: {
      category: true,
    },
    orderBy: {
      [sort]: order,
    },
  });

  return NextResponse.json({ products });
});

export const POST = withAuth(["ADMIN"], async (req) => {
  const body = await req.json();

  const { productName, currentPrice, pointValue = 0, categoryId } = body;

  if (!productName || !currentPrice || !categoryId) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 },
    );
  }

  const product = await prisma.product.create({
    data: {
      productName: productName.trim(),
      currentPrice,
      pointValue,
      categoryId,
      tags: [],
      // priceHistory: {
      //   create: {
      //     price: currentPrice,
      //   },
      // },
    },
    include: {
      category: true,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
});

export const PUT = withAuth(["ADMIN"], async (req) => {
  try {
    const body = await req.json();

    const { id, productName, currentPrice, pointValue, categoryId } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Product id is required" },
        { status: 400 },
      );
    }

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    const finalPointValue =
      typeof pointValue === "number" ? pointValue : existing.pointValue;

    const priceChanged =
      typeof currentPrice === "number" &&
      currentPrice !== existing.currentPrice;

    const product = await prisma.product.update({
      where: { id },
      data: {
        productName,
        currentPrice,
        pointValue,
        categoryId,
        tags: [],
      },
      include: {
        category: true, // ✅ IMPORTANT
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(null, { status: 500 });
  }
});

export const DELETE = withAuth(["ADMIN"], async (req) => {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { message: "Product id is required" },
        { status: 400 },
      );
    }

    await prisma.product.delete({
      where: { id: body.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(null, { status: 500 });
  }
});
