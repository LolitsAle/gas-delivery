"use client";

import React, { memo } from "react";
import { House, Receipt, Store, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

const NAV_ITEMS = [
  {
    name: "Trang chủ",
    path: "/",
    icon: House,
  },
  {
    name: "Đơn Hàng",
    path: "/order",
    icon: Receipt,
  },
  {
    name: "Cửa Hàng",
    path: "/store",
    icon: Store,
  },
  {
    name: "Cá nhân",
    path: "/user",
    icon: User,
  },
];

function BottomNavBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <div className="fixed bottom-0 left-0 h-[24vw] w-screen bg-linear-to-b from-white/0 to-white/90"></div>
      <div className="fixed bottom-[4vw] left-1/2 -translate-x-1/2 w-[90vw] flex bg-gas-green-700 h-[20vw] rounded-xl text-[3.2vw] text-white z-100">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex-1 flex gap-2 flex-col justify-center items-center"
            >
              <Icon
                size="5vw"
                className={clsx(
                  isActive ? "text-gas-orange-400" : "text-[#F9FAFB]",
                )}
              />
              <span
                className={clsx(
                  "transition",
                  isActive &&
                    "text-gas-orange-400 border-b-2 border-gas-orange-400",
                )}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

export default memo(BottomNavBar);
