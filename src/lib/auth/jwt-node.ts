// src/lib/auth/jwt-node.ts
import "server-only"; // 🔥 rất quan trọng với Next.js App Router
import jwt, { SignOptions } from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable");
  }
  return secret;
}

export function signJwt(
  payload: object,
  expiresIn: SignOptions["expiresIn"] = "7d",
) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

export function verifyJwt<T>(token: string): T {
  return jwt.verify(token, getJwtSecret()) as T;
}
