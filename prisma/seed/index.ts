import { seedUsersAndStoves } from "./userAndStoves.seed";

import { seedCategoriesAndProducts } from "./productAndCategory.seed";
import { seedPromotions } from "./promotion.seed";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedCarts } from "./cart.seed";
import { seedOrders } from "./orders.seed";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function seedAll() {
  try {
    console.log("🌱 Seeding started...");

    await seedUsersAndStoves(prisma);
    await seedCategoriesAndProducts(prisma);
    await seedCarts(prisma);
    await seedPromotions(prisma);
    await seedOrders(prisma);

    console.log("🌱 Seeding completed");
  } catch (err) {
    console.error("❌ Seeding failed", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAll();
