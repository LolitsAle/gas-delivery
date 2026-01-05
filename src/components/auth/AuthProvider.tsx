// src/components/auth/AuthProvider.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const PUBLIC_ROUTES = ["/login", "/register"];

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function initAuth() {
      // ✅ Public route → bỏ qua auth
      if (PUBLIC_ROUTES.includes(pathname)) {
        setReady(true);
        return;
      }

      try {
        // 🔑 LUÔN refresh trước
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (res.ok) {
          // ✅ access token mới đã được set vào cookie
          setReady(true);
          return;
        }
      } catch {
        // ignore
      }

      // ❌ Không refresh được → logout
      router.replace("/login");
    }

    initAuth();
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="text-gray-500">Checking session…</span>
      </div>
    );
  }

  return <>{children}</>;
}
