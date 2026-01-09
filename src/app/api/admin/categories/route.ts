// app/api/admin/categories/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";

/* ======================================================
   GET CATEGORIES (LIST)
====================================================== */
export const GET = withAuth(["ADMIN"], async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        products: {
          select: { id: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(null, { status: 500 });
  }
});

/* ======================================================
   CREATE CATEGORY
====================================================== */
export const POST = withAuth(["ADMIN"], async (req, ctx) => {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: body.name.trim(),
        freeShip: body.freeShip ?? false,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.log("Error:", error);
    return NextResponse.json(null, { status: 500 });
  }
});

/* ======================================================
   UPDATE CATEGORY
====================================================== */
export const PUT = withAuth(["ADMIN"], async (req) => {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { message: "Category id is required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id: body.id },
      data: {
        name: body.name,
        freeShip: body.freeShip,
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.log("Error:", error);
    return NextResponse.json(null, { status: 500 });
  }
});

/* ======================================================
   DELETE CATEGORY
====================================================== */
export const DELETE = withAuth(["ADMIN"], async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Category id is required" },
        { status: 400 }
      );
    }

    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { message: "Cannot delete category with products" },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Error:", error);
    return NextResponse.json(null, { status: 500 });
  }
});
