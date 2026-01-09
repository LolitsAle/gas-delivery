import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ProductTag } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildTags(pointValue: number): ProductTag[] {
  return pointValue > 0 ? ["POINTS_EXCHANGABLE"] : [];
}
