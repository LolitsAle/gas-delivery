"use client";

import React, { memo, useEffect, useState, useCallback, useMemo } from "react";
import { Menu, User, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetchAuth } from "@/lib/api/apiClient";

interface UserInfo {
  id: string;
  nickname: string;
}

interface HeaderProps {
  onMenuClick?: () => void;
}

const USER_STORAGE_KEY = "user";

function HeaderComponent({ onMenuClick }: HeaderProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  /* Fetch user info */
  useEffect(() => {
    const cached = localStorage.getItem(USER_STORAGE_KEY);
    if (cached) {
      setUser(JSON.parse(cached));
      return;
    }

    (async () => {
      try {
        const data = await apiFetchAuth<{ user: UserInfo }>("/api/auth/me");

        if (!data?.user) return;

        setUser(data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      } catch {}
    })();
  }, []);

  /* Close dropdown on route change */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* Close dropdown on ESC */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  /* Logout */
  const logout = useCallback(async () => {
    try {
      await apiFetchAuth("/api/auth/logout", { method: "POST" });
    } finally {
      localStorage.removeItem(USER_STORAGE_KEY);
      router.replace("/login");
    }
  }, [router]);

  const getCurrentPathName = useMemo(() => {
    switch (pathname) {
      case "/admin":
        return "Trang Chủ";
      case "/admin/orders":
        return "Đơn Hàng";
      case "/admin/ware-house":
        return "Kho Gas";
      case "/admin/products":
        return "Sản Phẩm";
      case "/admin/users":
        return "Khách Hàng";
      default:
        return "Trang Chủ";
    }
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 md:px-6 h-14 md:h-16">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={onMenuClick}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <span className="font-semibold text-gray-800 text-sm md:text-base">
            {getCurrentPathName}
          </span>
        </div>

        {/* Right */}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-100 transition"
          >
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          </button>

          {/* Backdrop */}
          {open && (
            <div
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
            />
          )}

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 z-40 mt-2 w-44 rounded-md bg-white shadow-lg border border-gray-200">
              {user && (
                <div className="px-4 py-2 border-b border-gray-200 text-sm text-gray-700">
                  Hi, <span className="font-semibold">{user.nickname}</span>
                </div>
              )}

              {/* <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
                <User className="w-4 h-4" />
                User Info
              </button> */}

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default memo(HeaderComponent);
