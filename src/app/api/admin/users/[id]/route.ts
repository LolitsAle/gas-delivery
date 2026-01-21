// app/api/admin/users/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";
import { getId } from "@/lib/api/helper";

/* ======================================================
   UPDATE USER (EDIT FORM)
====================================================== */
export const PUT = withAuth(["ADMIN"], async (req, { params }) => {
  const userId = getId(params.id);
  if (!userId) {
    return NextResponse.json(
      { message: "User id is required" },
      { status: 400 },
    );
  }

  const body = await req.json();

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(body.nickname !== undefined && { nickname: body.nickname }),
      ...(body.address !== undefined && { address: body.address }),
      ...(body.addressNote !== undefined && { addressNote: body.addressNote }),
      ...(body.role !== undefined && { role: body.role }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.isVerified !== undefined && { isVerified: body.isVerified }),
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

  return NextResponse.json({ user });
});

/* ======================================================
   QUICK ACTION (PATCH)
   - toggle active
   - verify user
====================================================== */
export const PATCH = withAuth(["ADMIN"], async (req, { params }) => {
  const userId = getId(params.id);
  if (!userId) {
    return NextResponse.json(
      { message: "User id is required" },
      { status: 400 },
    );
  }

  const body = await req.json();

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(typeof body.isActive === "boolean" && { isActive: body.isActive }),
      ...(typeof body.isVerified === "boolean" && {
        isVerified: body.isVerified,
      }),
    },
    select: {
      id: true,
      isActive: true,
      isVerified: true,
    },
  });

  return NextResponse.json({ user });
});

/* ======================================================
   DELETE USER (SOFT DELETE)
====================================================== */
export const DELETE = withAuth(["ADMIN"], async (_req, { params }) => {
  const userId = getId(params.id);
  if (!userId) {
    return NextResponse.json(
      { message: "User id is required" },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
});
