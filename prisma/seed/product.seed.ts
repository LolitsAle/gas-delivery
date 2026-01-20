import { PrismaClient, ProductTag } from "@prisma/client";

export async function seedProducts(
  prisma: PrismaClient,
  categories: { gas: { id: string } },
) {
  await prisma.product.upsert({
    where: { id: "Gas H" },
    update: {},
    create: {
      id: "Gas H",
      productName: "Gas H",
      currentPrice: 345_000,
      pointValue: 1000,
      categoryId: categories.gas.id,
      tags: [
        ProductTag.BINDABLE,
        ProductTag.POINT_EARNABLE,
        ProductTag.PROMO_ELIGIBLE,
      ],
    },
  });

  await prisma.product.upsert({
    where: { id: "Gas SP" },
    update: {},
    create: {
      id: "Gas SP",
      productName: "Gas SP",
      currentPrice: 365_000,
      pointValue: 1000,
      categoryId: categories.gas.id,
      tags: [
        ProductTag.BINDABLE,
        ProductTag.POINT_EARNABLE,
        ProductTag.PROMO_ELIGIBLE,
      ],
    },
  });

  console.log("🛢 Products seeded");
}
