import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
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
