// components/admin/UserEditModal.tsx
"use client";

import { X } from "lucide-react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { useState } from "react";

export default function UserEditModal({
  user,
  onClose,
  onUpdated,
}: {
  user: any;
  onClose: () => void;
  onUpdated: (u: any) => void;
}) {
  const [form, setForm] = useState({
    nickname: user.nickname,
    address: user.address || "",
    addressNote: user.addressNote || "",
    role: user.role,
    isActive: user.isActive,
  });

  async function submit() {
    const res = await apiFetchAuth(`/api/admin/users/${user.id}`, {
      method: "PUT",
      body: form,
    });

    onUpdated(res.user);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Edit user</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="space-y-3">
          <input
            value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            className="input"
            placeholder="Nickname"
          />

          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="input"
            placeholder="Address"
          />

          <input
            value={form.addressNote}
            onChange={(e) => setForm({ ...form, addressNote: e.target.value })}
            className="input"
            placeholder="Address note"
          />

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as any })}
            className="input"
          >
            <option value="USER">USER</option>
            <option value="STAFF">STAFF</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={submit} className="btn-primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
