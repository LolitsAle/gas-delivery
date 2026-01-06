// lib/auth/withAuth.ts
import { NextResponse } from "next/server";
import { requireRole } from "./requiredRole";
import { AuthError } from "./authError";

type HandlerContext = {
  user: any;
  params: any;
};

type Handler = (req: Request, ctx: HandlerContext) => Promise<Response>;

export function withAuth(roles: string[], handler: Handler) {
  return async function (
    req: Request,
    ctx: { params: Record<string, string> }
  ) {
    try {
      const user = await requireRole(req, roles);

      return await handler(req, { user, params: ctx.params });
    } catch (err: any) {
      if (err instanceof AuthError) {
        return NextResponse.json(
          { message: err.message },
          { status: err.status }
        );
      }

      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
