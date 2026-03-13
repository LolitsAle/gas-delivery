import { withAuth } from "@/lib/auth/withAuth";
import { prisma } from "@/lib/prisma";
import { listResponse, parseListQuery } from "@/lib/api/admin/contracts";

export const GET = withAuth(["ADMIN", "STAFF"], async (req) => {
  const { page, pageSize, search, searchParams } = parseListQuery(req.url, { pageSize: 20 });
  const expired = searchParams.get("expired");
  const now = new Date();

  const where: any = {
    ...(search ? { phone: { contains: search } } : {}),
    ...(expired === "true" ? { expiresAt: { lt: now } } : {}),
    ...(expired === "false" ? { expiresAt: { gte: now } } : {}),
  };

  const [items, totalItems] = await Promise.all([
    prisma.phoneOtp.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.phoneOtp.count({ where }),
  ]);

  return listResponse(items, page, pageSize, totalItems);
});
