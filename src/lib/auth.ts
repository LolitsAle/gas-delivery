import { verifyJwt } from "@/lib/auth/jwt-node";

export function getAuthUser(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.replace("Bearer ", "");
  return verifyJwt<{ userId: string; role: string }>(token);
}
