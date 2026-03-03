import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { withAuth } from "@/lib/auth/withAuth";
import { r2Client } from "@/lib/r2/client";
import { buildR2Key } from "@/lib/r2/key";
import { validateUpload } from "@/lib/r2/validate";
import { prisma } from "@/lib/prisma";

type UploadFile = {
  mimeType: string;
  fileSize: number;
};

export const POST = withAuth(["USER", "ADMIN", "STAFF"], async (req, ctx) => {
  try {
    const { target, ownerId, files } = await req.json();
    const me = ctx.user;

    if (!target || !ownerId || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { message: "Thiếu dữ liệu upload" },
        { status: 400 },
      );
    }

    for (const f of files as UploadFile[]) {
      validateUpload({
        mimeType: f.mimeType,
        size: f.fileSize,
      });
    }

    let stoveUserId: string | null = null;
    let houseImageCount = 0;

    if (target === "avatar") {
      if (me.role === "USER" && me.id !== ownerId) {
        return NextResponse.json(
          { message: "Không có quyền upload avatar" },
          { status: 403 },
        );
      }
    }

    if (target === "stove") {
      const stove = await prisma.stove.findUnique({
        where: { id: ownerId },
        select: {
          id: true,
          userId: true,
          houseImageCount: true,
        },
      });

      if (!stove) {
        return NextResponse.json(
          { message: "Bếp không tồn tại" },
          { status: 404 },
        );
      }

      if (me.role === "USER" && stove.userId !== me.id) {
        return NextResponse.json(
          { message: "Không có quyền upload ảnh bếp" },
          { status: 403 },
        );
      }

      if (stove.houseImageCount + files.length > 5) {
        return NextResponse.json(
          {
            message: `Mỗi bếp tối đa 5 ảnh. Hiện có ${stove.houseImageCount}`,
          },
          { status: 400 },
        );
      }

      stoveUserId = stove.userId;
      houseImageCount = stove.houseImageCount;
    }

    if (target === "product") {
      if (!["ADMIN", "STAFF"].includes(me.role)) {
        return NextResponse.json(
          { message: "Không có quyền upload ảnh sản phẩm" },
          { status: 403 },
        );
      }
    }

    const uploads = await Promise.all(
      files.map(async (file: UploadFile) => {
        const ext = file.mimeType.split("/")[1];

        const key =
          target === "avatar"
            ? buildR2Key({ type: "avatar", userId: ownerId }, ext)
            : target === "stove"
              ? buildR2Key(
                  {
                    type: "stove",
                    userId: stoveUserId!,
                    stoveId: ownerId,
                  },
                  ext,
                )
              : buildR2Key({ type: "product", productId: ownerId }, ext);

        const command = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET!,
          Key: key,
          ContentType: file.mimeType,
        });

        const uploadUrl = await getSignedUrl(r2Client, command, {
          expiresIn: 60,
        });

        const publicUrl = `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.dev/${process.env.R2_BUCKET}/${key}`;

        return {
          key,
          uploadUrl,
          publicUrl,
        };
      }),
    );

    return NextResponse.json({
      uploads,
      limit: target === "stove" ? 5 : undefined,
      currentCount: target === "stove" ? houseImageCount : undefined,
    });
  } catch (err: any) {
    console.error("[UPLOAD_PRESIGN_BATCH]", err);
    return NextResponse.json(
      { message: err.message ?? "Upload error" },
      { status: 500 },
    );
  }
});
