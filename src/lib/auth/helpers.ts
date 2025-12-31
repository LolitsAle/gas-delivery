// src/lib/auth/helpers.ts
import { randomBytes, createHash } from "crypto";

export function generateRefreshToken() {
  return randomBytes(64).toString("hex");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
