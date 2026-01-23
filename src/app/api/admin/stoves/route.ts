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
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        address: true,
        note: true,
        productId: true,
        houseImage: true,
        houseImageCount: true,
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

export const POST = withAuth(["ADMIN", "STAFF"], async (req) => {
  try {
    const body = await req.json();
    const { userId, name, address, note, productId } = body;

    if (!userId || !address) {
      return NextResponse.json(
        { message: "Thiếu userId hoặc address" },
        { status: 400 },
      );
    }

    const stove = await prisma.stove.create({
      data: {
        userId,
        name: name ?? "",
        address,
        note: note ?? null,
        productId: productId ?? null,
        houseImage: [],
        houseImageCount: 0,
      },
    });

    return NextResponse.json({ stove }, { status: 201 });
  } catch (err) {
    console.error("[CREATE_STOVE]", err);
    return NextResponse.json({ message: "Không thể tạo bếp" }, { status: 500 });
  }
});
