"use client";

import { useCallback, useState } from "react";
import { apiFetchAuth, apiLogoutClient } from "@/lib/api/apiClient";
import {
  showToastLoading,
  updateToastError,
  updateToastSuccess,
} from "@/lib/helper/toast";
import { User } from "@prisma/client";
import { FieldCustomed } from "../common/FieldCustom";
import { useRouter } from "next/navigation";

type Props = {
  user: User;
  onChange: (u: Partial<User>) => void;
};

export default function UserBasicInfo({ user, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const saveBasicInfoToApi = async () => {
    const tloading = showToastLoading("Đang lưu thông tin");
    setLoading(true);
    try {
      const payload = {
        name: user.name ?? null,
        address: user.address ?? null,
        addressNote: user.addressNote ?? null,
      };

      const res = await apiFetchAuth("/api/user/me", {
        method: "POST",
        body: payload,
      });
      updateToastSuccess(tloading, "Lưu thông tin thành công!");
      onChange(res);
    } catch (err) {
      updateToastError(tloading, "Lưu thông tin thất bại!");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="text-sm text-gray-500">Biệt danh</div>
        <div className="font-semibold">{user.nickname}</div>

        <div className="mt-2 text-sm text-gray-500">Điểm thưởng</div>
        <div className="font-semibold text-green-600">{user.points}</div>
        <div
          onClick={logout}
          className="absolute bottom-[2vw] right-[2vw] bg-red-500 p-[2vw] rounded-md text-white"
        >
          Đăng xuất
        </div>
      </div>

      {/* Editable */}
      <div className="bg-white rounded-2xl p-4 shadow space-y-4">
        <FieldCustomed
          id="name"
          label="Tên gọi"
          value={user.name ?? ""}
          onChange={(e) => onChange({ name: e.target.value })}
        />
        <FieldCustomed
          id="address"
          label="Địa chỉ"
          value={user.address ?? ""}
          onChange={(e) => onChange({ address: e.target.value })}
        />
        <FieldCustomed
          as="textarea"
          id="note"
          label="Ghi chú"
          value={user.addressNote ?? ""}
          onChange={(e) => onChange({ addressNote: e.target.value })}
        />
      </div>

      <button
        onClick={saveBasicInfoToApi}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-2xl font-semibold disabled:opacity-60"
      >
        {loading ? "Đang Lưu" : "Lưu"}
      </button>
    </>
  );
}
