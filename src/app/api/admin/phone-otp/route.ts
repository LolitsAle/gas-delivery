import { withAuth } from "@/lib/auth/withAuth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = withAuth(["ADMIN"], async () => {
  const items = await prisma.phoneOtp.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ items });
});

export const DELETE = withAuth(["ADMIN"], async () => {
  const now = new Date();
  const res = await prisma.phoneOtp.deleteMany({
    where: { expiresAt: { lt: now } },
  });

  return NextResponse.json({ deleted: res.count });
});
