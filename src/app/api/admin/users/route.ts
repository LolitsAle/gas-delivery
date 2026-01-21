// app/api/admin/users/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";

export const GET = withAuth(["ADMIN"], async (req) => {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search")?.trim() || "";
  const status = searchParams.get("status"); // ACTIVE | INACTIVE | null

  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") || 10), 1),
    50,
  );

  /* WHERE */
  const where: any = {};

  if (search) {
    where.OR = [
      { phoneNumber: { contains: search, mode: "insensitive" } },
      { nickname: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status === "ACTIVE") where.isActive = true;
  if (status === "INACTIVE") where.isActive = false;

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        phoneNumber: true,
        nickname: true,
        role: true,
        isVerified: true,
        isActive: true,
        points: true,
        address: true,
        addressNote: true,
        createdAt: true,
        updatedAt: true,
        stoves: {
          select: {
            id: true,
            name: true,
            address: true,
            productId: true,
            product: {
              select: {
                id: true,
                productName: true,
                currentPrice: true,
                pointValue: true,
                tags: true,
              },
            },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const POST = withAuth(["ADMIN"], async (req) => {
  try {
    const body = await req.json();

    const user = await prisma.user.create({
      data: {
        phoneNumber: body.phoneNumber,
        nickname: body.nickname,
        password: body.password || "",
        role: body.role ?? "USER",
        isVerified: body.isVerified ?? false,
        isActive: body.isActive ?? true,
        address: body.address || null,
        addressNote: body.addressNote || null,
      },
      select: {
        id: true,
        phoneNumber: true,
        nickname: true,
        role: true,
        isVerified: true,
        isActive: true,
        points: true,
        address: true,
        addressNote: true,
        createdAt: true,
        updatedAt: true,
        stoves: {
          select: {
            id: true,
            name: true,
            address: true,
            productId: true,
            product: {
              select: {
                id: true,
                productName: true,
                currentPrice: true,
                pointValue: true,
                tags: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    return NextResponse.json(
      { message: "Create user failed" },
      { status: 500 },
    );
  }
});
