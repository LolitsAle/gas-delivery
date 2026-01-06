// app/api/admin/users/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";

export const GET = withAuth(["ADMIN"], async (req) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);

  const where = search
    ? {
        OR: [
          { phoneNumber: { contains: search } },
          { nickname: { contains: search } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total });
});

/* ======================================================
   CREATE NEW USER
====================================================== */
export const POST = withAuth(["ADMIN"], async (req) => {
  try {
    const body = await req.json();

    const user = await prisma.user.create({
      data: {
        phoneNumber: body.phoneNumber,
        nickname: body.nickname,
        password: body.password || "",
        role: body.role || "USER",
        isVerified: body.isVerified ?? false,
        address: body.address || "",
        addressNote: body.addressNote || "",
        houseImage: body.houseImage || [],
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(null, { status: 500 });
  }
});
