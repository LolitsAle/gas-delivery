import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { ProductTag } from "@prisma/client";

export const GET = withAuth(["ADMIN"], async (req) => {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId");
  const tagsParam = searchParams.get("tags");
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 20);

  const tags: ProductTag[] = tagsParam
    ? (tagsParam.split(",") as ProductTag[])
    : [];

  const where: any = {
    productName: {
      contains: search,
      mode: "insensitive",
    },
    ...(categoryId ? { categoryId } : {}),
    ...(tags.length
      ? {
          tags: {
            hasSome: tags,
          },
        }
      : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        [sort]: order,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

export const POST = withAuth(["ADMIN"], async (req) => {
  try {
    const body = await req.json();

    const {
      productName,
      currentPrice,
      pointValue = 0,
      categoryId,
      description = "",
      previewImageUrl = null,
      tags = [],
    } = body;

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
        description,
        previewImageUrl,
        tags,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
});
