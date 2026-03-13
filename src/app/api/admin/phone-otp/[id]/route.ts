import { withAuth } from "@/lib/auth/withAuth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const DELETE = withAuth(["ADMIN", "STAFF"], async (_req, { params }) => {
  await prisma.phoneOtp.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
});
