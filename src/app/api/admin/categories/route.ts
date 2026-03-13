// app/api/admin/categories/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";
import { parseListQuery } from "@/lib/api/admin/contracts";

/* ======================================================
   GET CATEGORIES (LIST)
====================================================== */
export const GET = withAuth(["ADMIN", "STAFF"], async (req) => {
  try {
    const { page, pageSize, search } = parseListQuery(req.url, { pageSize: 50, sort: "name:asc" });
    const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};
    const [categories, totalItems] = await Promise.all([prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      include: { products: { select: { id: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }), prisma.category.count({ where })]);

    return NextResponse.json({
      items: categories,
      categories,
      page,
      pageSize,
      totalItems,
      totalPages: Math.max(Math.ceil(totalItems / pageSize), 1),
    });
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
        { status: 400 },
      );
    }

    const category = await prisma.category.create({
      data: {
        name: body.name.trim(),
        tags: body.tags ? body.tags : [],
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
        { status: 400 },
      );
    }

    const category = await prisma.category.update({
      where: { id: body.id },
      data: {
        name: body.name,
        tags: body.tags ? body.tags : [],
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
        { status: 400 },
      );
    }

    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { message: "Cannot delete category with products" },
        { status: 400 },
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
