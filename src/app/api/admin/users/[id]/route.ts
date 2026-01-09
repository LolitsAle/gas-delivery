// app/api/admin/users/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";
import { getId } from "@/lib/api/helper";

export const PATCH = withAuth(["ADMIN"], async (req, { params }) => {
  const userId = getId(params.id);

  if (!userId) {
    return NextResponse.json(
      { message: "User id is required" },
      { status: 400 }
    );
  }

  const body = await req.json();

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      nickname: body.nickname,
      role: body.role,
      isVerified: body.isVerified,
      address: body.address,
      addressNote: body.addressNote,
      houseImage: body.houseImage,
      isActive: body.isActive,
    },
  });

  return NextResponse.json({ user });
});

export const DELETE = withAuth(["ADMIN"], async (_req, { params }) => {
  const userId = getId(params.id);

  if (!userId) {
    return NextResponse.json(
      { message: "User id is required" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
});

export const PUT = withAuth(["ADMIN"], async (req, { params }) => {
  const userId = getId(params.id);

  if (!userId) {
    return NextResponse.json(
      { message: "User id is required" },
      { status: 400 }
    );
  }

  const body = await req.json();

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      nickname: body.nickname,
      address: body.address,
      addressNote: body.addressNote,
      houseImage: body.houseImage,
      role: body.role,
      isActive: body.isActive,
    },
  });

  return NextResponse.json({ user: updatedUser });
});
