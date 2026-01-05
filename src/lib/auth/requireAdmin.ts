import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth/jwt-node";

export async function requireAdmin(req: Request) {
  const cookieHeader = req.headers.get("cookie");

  if (!cookieHeader) {
    throw new Error("Tài khoản không có quyền truy cập");
  }

  const accessToken = parseCookie(cookieHeader)["access_token"];
  if (!accessToken) {
    throw new Error("Tài khoản không có quyền truy cập");
  }

  try {
    const payload: any = await verifyJwt(accessToken);

    const user = await prisma.user.findUnique({
      where: { id: payload?.userId },
      select: {
        id: true,
        role: true,
        sessionVersion: true,
      },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Tài khoản không có quyền truy cập");
    }

    if (user.sessionVersion !== payload.sessionVersion) {
      throw new Error("Tài khoản không có quyền truy cập");
    }

    return user;
  } catch {
    throw new Error("Tài khoản không có quyền truy cập");
  }
}

/* =======================
   Small cookie parser
======================= */
function parseCookie(cookie: string) {
  return Object.fromEntries(
    cookie.split("; ").map((c) => {
      const [k, ...v] = c.split("=");
      return [k, decodeURIComponent(v.join("="))];
    })
  );
}
