import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";

type UpdateMePayload = {
  name?: string | null;
  address?: string | null;
  addressNote?: string | null;
};

export const POST = withAuth(["USER", "ADMIN", "STAFF"], async (req, ctx) => {
  try {
    const body = (await req.json()) as UpdateMePayload;
    const user = ctx.user;

    const data: UpdateMePayload = {};

    // name
    if ("name" in body) {
      if (body.name !== null && typeof body.name !== "string") {
        return NextResponse.json({ message: "Invalid name" }, { status: 400 });
      }
      data.name = body.name ?? null;
    }

    // address
    if ("address" in body) {
      if (body.address !== null && typeof body.address !== "string") {
        return NextResponse.json(
          { message: "Invalid address" },
          { status: 400 }
        );
      }
      data.address = body.address ?? null;
    }

    // addressNote
    if ("addressNote" in body) {
      if (body.addressNote !== null && typeof body.addressNote !== "string") {
        return NextResponse.json(
          { message: "Invalid addressNote" },
          { status: 400 }
        );
      }
      data.addressNote = body.addressNote ?? null;
    }

    // Không có gì để update
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data,
      select: {
        id: true,
        name: true,
        nickname: true,
        address: true,
        addressNote: true,
        phoneNumber: true,
        points: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error("update /user/me error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
});
