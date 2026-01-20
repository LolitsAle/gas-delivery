import { PrismaClient, ProductTag } from "@prisma/client";

export async function seedCategories(prisma: PrismaClient) {
  const gas = await prisma.category.upsert({
    where: { name: "Gas 12KG" },
    update: {},
    create: {
      name: "Gas 12KG",
      tags: [
        ProductTag.BINDABLE,
        ProductTag.POINT_EARNABLE,
        ProductTag.PROMO_ELIGIBLE,
      ],
    },
  });

  const accessory = await prisma.category.upsert({
    where: { name: "Phụ tùng bếp" },
    update: {},
    create: { name: "Phụ tùng bếp" },
  });

  console.log("📦 Categories seeded");
  return { gas, accessory };
}
