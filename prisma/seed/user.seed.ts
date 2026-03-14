import { PrismaClient } from "@prisma/client";

const RoleEnum = {
  ADMIN: "ADMIN",
} as const;

export async function seedUsers(prisma: PrismaClient) {
  await prisma.user.deleteMany({});

  await prisma.user.create({
    data: {
      name: "Admin",
      nickname: "admin",
      phoneNumber: "0348480033",
      passwordHash: "",
      role: RoleEnum.ADMIN,
      isVerified: true,
      isActive: true,
      points: 0,
    },
  });

  console.log("✅ Seeded users");
}
