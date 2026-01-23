import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(["ADMIN", "STAFF"], async (_req, ctx) => {
  try {
    const userId = ctx.params.id as string;

    const stoves = await prisma.stove.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        address: true,
        note: true,
        houseImage: true,
        houseImageCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ stoves });
  } catch (error) {
    return NextResponse.json({ status: 500 });
  }
});
