// app/api/admin/users/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";

type Params = {
  params: {
    id: string;
  };
};

/* ======================================================
   CREATE NEW USER
====================================================== */
export const POST = withAuth(["ADMIN"], async ({ req }) => {
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
      houseImage: body.houseImage || "",
      isActive: body.isActive ?? true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
});

/* ======================================================
   UPDATE USER (PATCH)
====================================================== */
export const PATCH = withAuth(["ADMIN"], async ({ req }) => {
  const { params } = req as any;
  const body = await req.json();

  const user = await prisma.user.update({
    where: { id: params.id },
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

/* ======================================================
   SOFT DELETE USER
====================================================== */
export const DELETE = withAuth(["ADMIN"], async ({ req }) => {
  const { params } = req as any;

  await prisma.user.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
});

/* ======================================================
   FULL UPDATE USER (PUT)
====================================================== */
export const PUT = withAuth(["ADMIN"], async ({ req }) => {
  const { params } = req as any;
  const body = await req.json();

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      nickname: body.nickname,
      address: body.address,
      addressNote: body.addressNote,
      role: body.role,
      isActive: body.isActive,
    },
  });

  return NextResponse.json({ user });
});
