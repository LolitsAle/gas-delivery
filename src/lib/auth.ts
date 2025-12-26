import { verifyJwt } from "@/lib/jwt";

export function getAuthUser(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.replace("Bearer ", "");
  return verifyJwt<{ userId: string; role: string }>(token);
}
