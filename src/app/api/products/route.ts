import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ProductTag } from "@prisma/client";
import { isProductTag } from "@/lib/types/promotion";
import { calculatePromotionDiscountPerUnit } from "@/lib/pricing/promotionEngine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const name = searchParams.get("name");
    const tagParams = searchParams.get("tags");
    const bindable = searchParams.get("bindable");
    const excludeBindable = searchParams.get("excludeBindable");
    const categories = searchParams.get("categories")?.split(",");

    if (bindable === "true" && excludeBindable === "true") {
      return NextResponse.json(
        { message: "Invalid filter combination" },
        { status: 400 },
      );
    }

    const where: any = {};
    const andConditions: any[] = [];

    /* 🔎 NAME */
    if (name) {
      andConditions.push({
        productName: { contains: name, mode: "insensitive" },
      });
    }

    /* 📂 CATEGORY ID */
    if (categories?.length) {
      andConditions.push({
        categoryId: { in: categories },
      });
    }

    /* 🏷 TAG FILTER */
    let finalTags: ProductTag[] = [];

    if (tagParams) {
      finalTags.push(...tagParams.split(",").filter(isProductTag));
    }

    if (bindable === "true") {
      finalTags.push("BINDABLE");
    }

    if (finalTags.length > 0) {
      andConditions.push({
        OR: [
          { tags: { hasSome: finalTags } },
          { category: { tags: { hasSome: finalTags } } },
        ],
      });
    }

    if (excludeBindable === "true") {
      andConditions.push({
        AND: [
          {
            NOT: {
              tags: { has: "BINDABLE" },
            },
          },
          {
            NOT: {
              category: {
                tags: { has: "BINDABLE" },
              },
            },
          },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        productName: true,
        currentPrice: true,
        previewImageUrl: true,
        pointValue: true,
        tags: true,
        categoryId: true,
        description: true,
        category: {
          select: {
            id: true,
            name: true,
            tags: true,
          },
        },
      },
    });

    const now = new Date();
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startAt: { lte: now },
        endAt: { gte: now },
      },
      include: {
        conditions: true,
        actions: true,
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    const productsWithPromotion = products.map((product) => {
      const { discountPerUnit } = calculatePromotionDiscountPerUnit({
        promotions,
        unitPrice: product.currentPrice,
        context: {
          productTags: product.tags,
          categoryId: product.category?.id,
          categoryName: product.category?.name,
        },
      });

      return {
        ...product,
        promotionDiscountPerUnit: discountPerUnit,
      };
    });

    return NextResponse.json(productsWithPromotion);
  } catch (error) {
    console.error("GET PRODUCTS ERROR", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
