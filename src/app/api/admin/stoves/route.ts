// app/api/admin/stoves/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";

export const GET = withAuth(["ADMIN", "STAFF"], async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "Thiếu userId" }, { status: 400 });
    }

    const stoves = await prisma.stove.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        address: true,
        note: true,
        productId: true,
        product: {
          select: {
            id: true,
            productName: true,
          },
        },
      },
    });

    return NextResponse.json({ stoves });
  } catch (err) {
    console.error("[GET_STOVES]", err);
    return NextResponse.json(
      { message: "Không thể tải danh sách bếp" },
      { status: 500 },
    );
  }
});
