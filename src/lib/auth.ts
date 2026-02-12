import { verifyJwt } from "@/lib/auth/jwt-node";
import { Role } from "@prisma/client";

export function getAuthUser(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.replace("Bearer ", "");
  return verifyJwt<{ userId: string; role: string }>(token);
}

export interface AuthUser {
  id: string;
  role: Role;
  phoneNumber?: string;
  points: number;
}

export type AuthContext = {
  user: AuthUser;
  params: Record<string, string | string[]>;
};
