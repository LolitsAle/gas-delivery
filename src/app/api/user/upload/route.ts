import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";
import { prisma } from "@/lib/prisma";
import { saveHouseImage } from "./saveHouseImage";
import fs from "fs/promises";
import path from "path";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const POST = withAuth(
  ["USER", "ADMIN", "STAFF"],
  async (req: Request, { user }) => {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    for (const f of files) {
      if (!f.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Invalid file type" },
          { status: 400 },
        );
      }

      if (f.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File too large (max 2MB)" },
          { status: 400 },
        );
      }
    }

    const uploadedUrls: string[] = [];

    try {
      await prisma.$transaction(async (tx) => {
        const dbUser = await tx.user.findUnique({
          where: { id: user.id },
          select: { houseImageCount: true },
        });

        if (!dbUser) throw new Error("User not found");

        if (dbUser.houseImageCount + files.length > MAX_IMAGES) {
          throw new Error("MAX_IMAGES_EXCEEDED");
        }

        for (const file of files) {
          const url = await saveHouseImage(file);
          uploadedUrls.push(url);
        }

        await tx.user.update({
          where: { id: user.id },
          data: {
            houseImage: { push: uploadedUrls },
            houseImageCount: { increment: uploadedUrls.length },
          },
        });
      });
    } catch (err: any) {
      if (err.message === "MAX_IMAGES_EXCEEDED") {
        return NextResponse.json(
          { error: "Chỉ được tối đa 5 ảnh" },
          { status: 400 },
        );
      }

      console.error(err);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    return NextResponse.json({ images: uploadedUrls });
  },
);

export const DELETE = withAuth(
  ["USER", "ADMIN", "STAFF"],
  async (req, { user }) => {
    const body = await req.json();
    const imageUrl: string = body.imageUrl;

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
    }

    try {
      await prisma.$transaction(async (tx) => {
        const dbUser = await tx.user.findUnique({
          where: { id: user.id },
          select: { houseImage: true, houseImageCount: true },
        });

        if (!dbUser) throw new Error("User not found");

        if (!dbUser.houseImage.includes(imageUrl)) {
          throw new Error("Image not found");
        }

        await tx.user.update({
          where: { id: user.id },
          data: {
            houseImage: dbUser.houseImage.filter((i) => i !== imageUrl),
            houseImageCount: {
              decrement: 1,
            },
          },
        });
      });

      // remove physical file
      const filePath = path.join(process.cwd(), "public", imageUrl);
      await fs.unlink(filePath).catch(() => {});

      return NextResponse.json({ success: true });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
  },
);
