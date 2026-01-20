import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function saveHouseImage(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${crypto.randomUUID()}${ext}`;

  const uploadDir = path.join(process.cwd(), "public/uploads/house");
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);

  return `/uploads/house/${filename}`;
}
