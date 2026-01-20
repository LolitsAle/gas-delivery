import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seedAdminUser(prisma: PrismaClient) {
  const phone = "0348480033";

  const exists = await prisma.user.findUnique({
    where: { phoneNumber: phone },
  });

  if (exists) {
    console.log("👤 Admin user already exists");
    return exists;
  }

  // no password for now
  // const passwordHash = await bcrypt.hash("admin123", 10);

  const user = await prisma.user.create({
    data: {
      phoneNumber: phone,
      nickname: "Admin",
      password: "",
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  console.log("👤 Admin user created");
  return user;
}
