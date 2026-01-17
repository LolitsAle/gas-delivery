import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bindableParam = searchParams.get("bindable");

    // Parse bindable param
    let bindableFilter: boolean | undefined = undefined;

    if (bindableParam === "true") bindableFilter = true;
    if (bindableParam === "false") bindableFilter = false;

    const products = await prisma.product.findMany({
      where:
        bindableFilter === undefined
          ? undefined
          : {
              category: {
                bindable: bindableFilter,
              },
            },
      select: {
        id: true,
        productName: true,
        currentPrice: true,
        pointValue: true,
        category: {
          select: {
            id: true,
            name: true,
            bindable: true,
          },
        },
      },
      orderBy: {
        productName: "asc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[GET_PRODUCTS]", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
