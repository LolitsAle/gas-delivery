// lib/auth/requireRole.ts
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth/jwt-node";
import { AuthError } from "./authError";
import { isRoleAllowed } from "./adminRoles";

type AccessTokenPayload = {
  userId: string;
  role: string;
  sessionVersion: number;
  iat: number;
  exp: number;
};

export async function requireRole(req: Request, roles: string[]) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthError("Chưa đăng nhập", 401);
  }

  const accessToken = authHeader.replace("Bearer ", "").trim();

  let payload: AccessTokenPayload;

  try {
    payload = verifyJwt<AccessTokenPayload>(accessToken);
  } catch {
    throw new AuthError("Access token hết hạn hoặc không hợp lệ", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      role: true,
      sessionVersion: true,
      points: true,
      tags: true,
    },
  });

  if (!user) {
    throw new AuthError("Tài khoản không tồn tại", 401);
  }

  // 🔐 session invalidated → logout all
  if (user.sessionVersion !== payload.sessionVersion) {
    throw new AuthError("Phiên đăng nhập không hợp lệ", 401);
  }

  // 🔐 role check → FORBIDDEN
  if (!isRoleAllowed(user.role, roles)) {
    throw new AuthError("Không có quyền truy cập", 403);
  }

  return user;
}
