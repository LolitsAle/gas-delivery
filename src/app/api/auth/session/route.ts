// /api/auth/session/route.ts
import { verifyJwt } from "@/lib/auth/jwt-node";
import { getCookie } from "@/lib/auth/cookies";

export async function GET() {
  const accessToken = await getCookie("access_token");

  if (!accessToken) {
    return Response.json({ valid: false }, { status: 401 });
  }

  try {
    verifyJwt(accessToken);
    return Response.json({ valid: true });
  } catch {
    return Response.json({ valid: false }, { status: 401 });
  }
}
