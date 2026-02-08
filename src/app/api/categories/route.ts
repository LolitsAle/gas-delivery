import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ProductTag } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const excludeBindable = searchParams.get("excludeBindable");

    const where: any = {};

    if (excludeBindable === "true") {
      where.NOT = {
        tags: {
          has: ProductTag.BINDABLE,
        },
      };
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const result = categories.map((c) => ({
      id: c.id,
      name: c.name,
      productCount: c._count.products,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET_CATEGORIES]", err);
    return NextResponse.json(
      { message: "Không thể tải danh mục" },
      { status: 500 },
    );
  }
}
