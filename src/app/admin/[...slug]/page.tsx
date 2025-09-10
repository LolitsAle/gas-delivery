import { notFound } from "next/navigation";

export default function AdminCatchAll() {
  // Always trigger the admin 404
  notFound();
}
