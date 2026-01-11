// lib/auth/withAuth.ts
import { NextResponse } from "next/server";
import { requireRole } from "./requiredRole";
import { AuthError } from "./authError";
import { AuthContext, AuthUser } from "@/lib/auth";

/* =========================
   Auth-aware Handler
========================= */
type AuthHandler = (
  req: Request,
  ctx: AuthContext
) => Response | Promise<Response>;

/* =========================
   withAuth Wrapper
========================= */
export function withAuth(roles: string[], handler: AuthHandler) {
  return async function (req: Request, ctx: any): Promise<Response> {
    try {
      const user = (await requireRole(req, roles)) as AuthUser;

      return await handler(req, {
        user,
        params: await ctx.params, // runtime-safe
      });
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        return NextResponse.json(
          { message: err.message },
          { status: err.status }
        );
      }

      console.error("withAuth error:", err);

      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
