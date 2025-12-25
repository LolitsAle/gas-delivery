import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET =
  Buffer.from(process.env.JWT_SECRET!, "utf-8") || "keymaster123";

export function signJwt(payload: object) {
  const expiresIn: SignOptions["expiresIn"] = "7d";
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJwt<T>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}
