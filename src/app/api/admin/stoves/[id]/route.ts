import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { r2Client } from "@/lib/r2/client";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";

export const PUT = withAuth(["ADMIN", "STAFF"], async (_req, { params }) => {
  try {
    const body = await _req.json();
    const { name, address, note, productId, houseImage, houseImageCount } =
      body;

    if (!address) {
      return NextResponse.json({ message: "Thiếu address" }, { status: 400 });
    }

    const stove = await prisma.stove.update({
      where: { id: params.id as string },
      data: {
        name: name ?? "",
        address,
        note: note ?? null,
        productId: productId ?? null,
        houseImage: Array.isArray(houseImage) ? houseImage : [],
        houseImageCount: houseImage?.length ?? 0,
      },
    });

    return NextResponse.json({ stove });
  } catch (err) {
    console.error("[UPDATE_STOVE]", err);
    return NextResponse.json(
      { message: "Không thể cập nhật bếp" },
      { status: 500 },
    );
  }
});

export const DELETE = withAuth(["ADMIN", "STAFF"], async (_req, { params }) => {
  try {
    const stove = await prisma.stove.findUnique({
      where: { id: params.id as string },
      select: { houseImage: true },
    });

    if (!stove) {
      return NextResponse.json(
        { message: "Bếp không tồn tại" },
        { status: 404 },
      );
    }

    if (stove.houseImage?.length) {
      await r2Client.send(
        new DeleteObjectsCommand({
          Bucket: process.env.R2_BUCKET!,
          Delete: {
            Objects: stove.houseImage.map((key) => ({ Key: key })),
          },
        }),
      );
    }

    await prisma.stove.delete({
      where: { id: params.id as string },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE_STOVE]", err);
    return NextResponse.json({ message: "Không thể xoá bếp" }, { status: 500 });
  }
});
