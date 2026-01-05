// src/lib/auth/jwt-edge.ts
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "GasNgocLam");

export type EdgeJwtPayload = {
  userId: string;
  role: "ADMIN" | "USER" | "STAFF";
  exp: number;
};

export async function verifyJwtEdge(token: string): Promise<EdgeJwtPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as EdgeJwtPayload;
}
