import { NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { withAuth } from "@/lib/auth/withAuth";
import { r2Client } from "@/lib/r2/client";

export const POST = withAuth(["USER", "ADMIN", "STAFF"], async (req) => {
  try {
    const { key } = await req.json();
    if (!key) {
      return NextResponse.json({ message: "Thiếu key" }, { status: 400 });
    }
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
      }),
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[UPLOAD_DELETE]", err);
    return NextResponse.json({ message: "Không thể xoá ảnh" }, { status: 500 });
  }
});
