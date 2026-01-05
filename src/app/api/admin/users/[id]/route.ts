// app/api/admin/users/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function PATCH(req: Request, { params }: any) {
  await requireAdmin(req);

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
}

export async function DELETE(req: Request, { params }: any) {
  await requireAdmin(req);

  await prisma.user.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await requireAdmin(req);

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

  return Response.json({ user });
}
