// src/lib/auth/jwt-node.ts
import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

export function signJwt(
  payload: object,
  expiresIn: SignOptions["expiresIn"] = "7d"
) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJwt<T>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}
