"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { User } from "@prisma/client";
import { Field } from "../Commons";

interface UserWithStoves extends User {
  stoves: any[];
}

interface Props {
  title: string;
  user?: UserWithStoves | null;
  mobile: boolean;
  onClose: () => void;
  onSave: (
    data: Partial<UserWithStoves> & { password?: string },
  ) => Promise<void> | void;
}

export default function UserForm({
  title,
  user,
  mobile,
  onClose,
  onSave,
}: Props) {
  const isCreate = !user;

  const [form, setForm] = useState({
    phoneNumber: user?.phoneNumber || "",
    password: "",
    name: user?.name || "",
    nickname: user?.nickname || "",
    address: user?.address || "",
    addressNote: user?.addressNote || "",
    points: user?.points ?? 0,
    role: user?.role || "USER",
    isVerified: user?.isVerified ?? false,
    isActive: user?.isActive ?? true,
  });

  const [loading, setLoading] = useState(false);

  const update = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload: any = {
        phoneNumber: form.phoneNumber,
        name: form.name,
        nickname: form.nickname,
        address: form.address,
        addressNote: form.addressNote,
        role: form.role,
      };

      if (isCreate) {
        payload.password = form.password;
      } else {
        payload.points = form.points;
        payload.isVerified = form.isVerified;
        payload.isActive = form.isActive;
      }

      await onSave(payload);
      onClose();
    } catch {
      alert("Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/40 flex ${
        mobile ? "items-end" : "items-center justify-center"
      }`}
    >
      <div
        className={`bg-white w-full ${
          mobile ? "rounded-t-2xl" : "rounded-xl max-w-lg"
        } p-4`}
      >
        {/* HEADER */}
        <div className="flex justify-between mb-3">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-3">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Số điện thoại">
              <input
                className="w-full outline-none bg-transparent text-sm disabled:text-gray-500"
                value={form.phoneNumber}
                disabled={!isCreate}
                onChange={(e) => update("phoneNumber", e.target.value)}
              />
            </Field>

            <Field label="Tên">
              <input
                className="w-full outline-none bg-transparent text-sm"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </Field>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nickname">
              <input
                className="w-full outline-none bg-transparent text-sm"
                value={form.nickname}
                onChange={(e) => update("nickname", e.target.value)}
              />
            </Field>

            <Field label="Địa chỉ">
              <input
                className="w-full outline-none bg-transparent text-sm"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </Field>
          </div>

          {/* Row 3 */}
          <Field label="Ghi chú địa chỉ">
            <input
              className="w-full outline-none bg-transparent text-sm"
              value={form.addressNote}
              onChange={(e) => update("addressNote", e.target.value)}
            />
          </Field>

          {/* Row 4 */}
          {!isCreate && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Điểm">
                <input
                  type="number"
                  className="w-full outline-none bg-transparent text-sm"
                  value={form.points}
                  onChange={(e) => update("points", Number(e.target.value))}
                />
              </Field>

              <Field label="Vai trò">
                <select
                  className="w-full bg-transparent outline-none text-sm"
                  value={form.role}
                  onChange={(e) =>
                    update("role", e.target.value as User["role"])
                  }
                >
                  <option value="USER">Người dùng</option>
                  <option value="STAFF">Nhân viên</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </Field>
            </div>
          )}

          {/* Row 5 */}
          {!isCreate && (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center justify-between border rounded px-3 py-2 text-sm">
                <span>Đã xác thực</span>
                <input
                  type="checkbox"
                  checked={form.isVerified}
                  onChange={(e) => update("isVerified", e.target.checked)}
                />
              </label>

              <label className="flex items-center justify-between border rounded px-3 py-2 text-sm">
                <span>Đang hoạt động</span>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => update("isActive", e.target.checked)}
                />
              </label>
            </div>
          )}
        </div>

        {/* ACTION */}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-60"
          >
            {loading ? "Đang lưu..." : isCreate ? "Tạo user" : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
