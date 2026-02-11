import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";

type Params = {
  params: { id: string };
};

export const GET = withAuth(["ADMIN"], async (req, { user, params }) => {
  const { id } = params as Params["params"];

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
});

export const PUT = withAuth(["ADMIN"], async (req, { user, params }) => {
  try {
    const { id } = params as Params["params"];
    const body = await req.json();

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    const {
      productName,
      currentPrice,
      pointValue,
      categoryId,
      description,
      previewImageUrl,
      tags,
    } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(productName !== undefined && { productName }),
        ...(currentPrice !== undefined && { currentPrice }),
        ...(pointValue !== undefined && { pointValue }),
        ...(categoryId !== undefined && { categoryId }),
        ...(description !== undefined && { description }),
        ...(previewImageUrl !== undefined && { previewImageUrl }),
        ...(tags && {
          tags: {
            set: tags,
          },
        }),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
});

export const DELETE = withAuth(["ADMIN"], async (req, { user, params }) => {
  try {
    const { id } = params as Params["params"];

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
});
