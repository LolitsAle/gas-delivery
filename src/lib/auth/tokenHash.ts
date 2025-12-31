// src/lib/auth/tokenHash.ts
import crypto from "crypto";

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
