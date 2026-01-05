import { NextResponse } from "next/server";
import sharp from "sharp";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ message: "No file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const fileName = `${randomUUID()}.webp`;
  const uploadDir = path.join(process.cwd(), "public/uploads/house");

  await fs.mkdir(uploadDir, { recursive: true });

  const outputPath = path.join(uploadDir, fileName);

  await sharp(buffer).resize(1024).webp({ quality: 80 }).toFile(outputPath);

  return NextResponse.json({
    path: `/uploads/house/${fileName}`,
  });
}
