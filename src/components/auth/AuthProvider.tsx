"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/auth/token";

const PUBLIC_ROUTES = ["/login", "/register", "/", "/install-app"];

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const [ready, setReady] = useState(isPublicRoute);

  useEffect(() => {
    if (isPublicRoute) return;

    const accessToken = tokenStorage.getAccess();

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    setReady(true);
  }, [isPublicRoute, router]);

  if (!ready && !isPublicRoute) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="text-gray-500">Checking session…</span>
      </div>
    );
  }

  return <>{children}</>;
}
