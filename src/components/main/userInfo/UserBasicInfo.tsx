"use client";

import { useCallback } from "react";
import { apiLogoutClient } from "@/lib/api/apiClient";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";

type Props = {
  user: User;
};

export default function UserBasicInfo({ user }: Props) {
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await apiLogoutClient();
      router.replace("/login");
    } catch {}
  }, [router]);

  return (
    <>
      {/* Nickname / Points */}
      <div className="relative bg-white rounded-2xl p-4 shadow">
        <div className="text-sm text-gray-500">Tên</div>
        <div className="font-semibold">{user.name}</div>

        <div className="mt-2 text-sm text-gray-500">Điểm thưởng</div>
        <div className="font-semibold text-green-600">{user.points}</div>
      </div>

      <div
        onClick={logout}
        className="bottom-[2vw] flex justify-center items-center right-[2vw] bg-red-500 p-[2vw] rounded-md text-white"
      >
        Đăng xuất
      </div>
    </>
  );
}
