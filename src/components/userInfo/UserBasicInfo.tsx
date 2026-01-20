"use client";

import { useState } from "react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { User } from "@/app/(main)/user/page";

type Props = {
  user: User;
  onChange: (u: Partial<User>) => void;
};

export default function UserBasicInfo({ user, onChange }: Props) {
  const [loading, setLoading] = useState(false);

  const saveBasicInfoToApi = async () => {
    try {
      setLoading(true);
      const payload = {
        name: user.name ?? null,
        address: user.address ?? null,
        addressNote: user.addressNote ?? null,
      };

      const res = await apiFetchAuth("/api/user/me", {
        method: "POST",
        body: payload,
      });

      onChange(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nickname / Points */}
      <div className="bg-white rounded-2xl p-4 shadow">
        <div className="text-sm text-gray-500">Biệt danh</div>
        <div className="font-semibold">{user.nickname}</div>

        <div className="mt-2 text-sm text-gray-500">Điểm thưởng</div>
        <div className="font-semibold text-green-600">{user.points}</div>
      </div>

      {/* Editable */}
      <div className="bg-white rounded-2xl p-4 shadow space-y-4">
        <input
          className="w-full border rounded-xl p-2"
          placeholder="Tên gọi"
          value={user.name ?? ""}
          onChange={(e) => onChange({ name: e.target.value })}
        />

        <input
          className="w-full border rounded-xl p-2"
          placeholder="Địa chỉ"
          value={user.address ?? ""}
          onChange={(e) => onChange({ address: e.target.value })}
        />

        <textarea
          className="w-full border rounded-xl p-2"
          placeholder="Ghi chú"
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
