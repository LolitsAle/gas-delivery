import { seedAdminUser } from "./user.seed";
import { seedCategories } from "./category.seed";
import { seedProducts } from "./product.seed";
import { seedPromotions } from "./promotion.seed";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export async function seedAll() {
  try {
    console.log("🌱 Seeding started...");

    const admin = await seedAdminUser(prisma);
    const categories = await seedCategories(prisma);
    await seedProducts(prisma, categories);
    await seedPromotions(prisma);

    console.log("🌱 Seeding completed");
  } catch (err) {
    console.error("❌ Seeding failed", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAll();
