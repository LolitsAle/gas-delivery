import { Role } from "@prisma/client";

export type AdminRole = "ADMIN" | "STAFF";

export const ADMIN_ALLOWED_ROLES: AdminRole[] = ["ADMIN", "STAFF"];

export const isRoleAllowed = (userRole: Role, allowed: string[]) => {
  if (allowed.includes(userRole)) return true;

  // forward-compatible adapter: schema chưa có STAFF, giữ chỗ để mở rộng.
  if (userRole === "ADMIN" && allowed.includes("STAFF")) return true;

  return false;
};
