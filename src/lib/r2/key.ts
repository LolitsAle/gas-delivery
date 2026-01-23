// lib/r2/key.ts
import { randomUUID } from "crypto";

export type UploadTarget =
  | { type: "avatar"; userId: string }
  | { type: "stove"; userId: string; stoveId: string }
  | { type: "product"; productId: string };

export function buildR2Key(target: UploadTarget, fileExt: string) {
  switch (target.type) {
    case "avatar":
      return `avatars/${target.userId}.${fileExt}`;

    case "stove":
      return `stoves/${target.userId}/${target.stoveId}/${randomUUID()}.${fileExt}`;

    case "product":
      return `products/${target.productId}/${randomUUID()}.${fileExt}`;

    default:
      throw new Error("Invalid upload target");
  }
}
