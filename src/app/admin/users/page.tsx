"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { ChevronDown, Trash2, Pencil, Phone, X, Plus } from "lucide-react";

interface User {
  id: string;
  nickname: string;
  phoneNumber: string;
  role: "USER" | "ADMIN" | "STAFF";
  createdAt: string;
  address?: string;
  addressNote?: string;
  isActive?: boolean;
}

const ROLE_COLOR: Record<User["role"], string> = {
  USER: "bg-gray-100 text-gray-700",
  STAFF: "bg-blue-100 text-blue-700",
  ADMIN: "bg-red-100 text-red-700",
};

const ROLE_LABEL: Record<User["role"], string> = {
  USER: "Người dùng",
  STAFF: "Nhân viên",
  ADMIN: "Quản trị viên",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [actionUser, setActionUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  /* =====================
     FETCH
  ====================== */
  useEffect(() => {
    apiFetchAuth<{ users: User[] }>("/api/admin/users").then((res) => {
      setUsers(res.users);
      setLoading(false);
    });
  }, []);

  /* =====================
     SEARCH
  ====================== */
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter(
      (u) => u.phoneNumber.includes(q) || u.nickname.toLowerCase().includes(q)
    );
  }, [query, users]);

  /* =====================
     DELETE
  ====================== */
  async function deleteUser(user: User) {
    const snapshot = users;
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setActionUser(null);
    setEditingUser(null);

    try {
      await apiFetchAuth(`/api/admin/users/${user.id}`, { method: "DELETE" });
    } catch {
      setUsers(snapshot);
      alert("Xóa người dùng thất bại");
    }
  }

  /* =====================
     UPDATE
  ====================== */
  async function updateUser(id: string, data: Partial<User>) {
    const snapshot = users;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));

    try {
      const res = await apiFetchAuth<{ user: User }>(`/api/admin/users/${id}`, {
        method: "PUT",
        body: data,
      });
      setUsers((prev) => prev.map((u) => (u.id === id ? res.user : u)));
    } catch {
      setUsers(snapshot);
      alert("Cập nhật thất bại");
    }
  }

  /* =====================
     CREATE
  ====================== */
  async function createUser(data: Partial<User>) {
    try {
      const res = await apiFetchAuth<{ user: User }>(`/api/admin/users`, {
        method: "POST",
        body: data,
      });
      setUsers((prev) => [res.user, ...prev]);
    } catch {
      alert("Tạo người dùng thất bại");
    }
  }

  if (loading) return <div className="p-4">Đang tải…</div>;

  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <input
          placeholder="Tìm theo số điện thoại hoặc tên"
          className="flex-1 border px-3 py-2 rounded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          onClick={() => setCreating(true)}
          className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded"
        >
          <Plus size={16} />
          Tạo mới
        </button>
      </div>

      {/* =====================
          DESKTOP TABLE
      ====================== */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Tên hiển thị</th>
              <th className="p-2 text-left">Số điện thoại</th>
              <th className="p-2 text-left">Vai trò</th>
              <th className="p-2 text-left">Ngày tạo</th>
              <th className="p-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.nickname}</td>
                <td className="p-2">{u.phoneNumber}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      ROLE_COLOR[u.role]
                    }`}
                  >
                    {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td className="p-2">
                  {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="p-2 text-right space-x-2">
                  <button
                    onClick={() => setEditingUser(u)}
                    className="text-blue-600"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => deleteUser(u)}
                    className="text-red-600"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =====================
          MOBILE CARDS
      ====================== */}
      <div className="md:hidden space-y-3">
        {filtered.map((u) => (
          <div
            key={u.id}
            className="border rounded-lg p-3 flex justify-between"
          >
            <div>
              <div className="font-medium">{u.nickname}</div>
              <div className="text-sm text-gray-500">{u.phoneNumber}</div>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                  ROLE_COLOR[u.role]
                }`}
              >
                {ROLE_LABEL[u.role]}
              </span>
            </div>
            <button onClick={() => setActionUser(u)}>
              <ChevronDown />
            </button>
          </div>
        ))}
      </div>

      {/* =====================
          ACTION SHEET
      ====================== */}
      {actionUser && (
        <BottomSheet onClose={() => setActionUser(null)}>
          <div className="font-semibold text-lg">{actionUser.nickname}</div>
          <div className="text-sm text-gray-500">{actionUser.phoneNumber}</div>

          <button
            onClick={() => {
              setEditingUser(actionUser);
              setActionUser(null);
            }}
            className="sheet-btn"
          >
            <Pencil size={16} /> Chỉnh sửa
          </button>

          <a href={`tel:${actionUser.phoneNumber}`} className="sheet-btn">
            <Phone size={16} /> Gọi điện
          </a>

          <button
            onClick={() => deleteUser(actionUser)}
            className="sheet-btn text-red-600"
          >
            <Trash2 size={16} /> Xóa
          </button>
        </BottomSheet>
      )}

      {editingUser && (
        <UserForm
          title="Chỉnh sửa người dùng"
          user={editingUser}
          mobile={isMobile}
          onClose={() => setEditingUser(null)}
          onSave={(data: any) => updateUser(editingUser.id, data)}
        />
      )}

      {creating && (
        <UserForm
          title="Tạo người dùng mới"
          mobile={isMobile}
          onClose={() => setCreating(false)}
          onSave={(data: any) => createUser(data)}
        />
      )}
    </div>
  );
}

/* =====================
   REUSABLE COMPONENTS
===================== */

function BottomSheet({ children, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
      <div className="bg-white w-full rounded-t-2xl p-4 space-y-3">
        {children}
        <button onClick={onClose} className="w-full text-center text-gray-500">
          Đóng
        </button>
      </div>
    </div>
  );
}

function UserForm({ title, user, mobile, onClose, onSave }: any) {
  const [form, setForm] = useState({
    nickname: user?.nickname || "",
    phoneNumber: user?.phoneNumber || "",
    role: user?.role || "USER",
    address: user?.address || "",
    addressNote: user?.addressNote || "",
  });

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
        <div className="flex justify-between mb-3">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="space-y-3">
          <input
            placeholder="Tên hiển thị"
            className="w-full border px-3 py-2 rounded"
            value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
          />

          <input
            placeholder="Số điện thoại"
            className="w-full border px-3 py-2 rounded"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            disabled={!!user}
          />

          <select
            className="w-full border px-3 py-2 rounded"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="USER">Người dùng</option>
            <option value="STAFF">Nhân viên</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>

          <input
            placeholder="Địa chỉ"
            className="w-full border px-3 py-2 rounded"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <input
            placeholder="Ghi chú địa chỉ"
            className="w-full border px-3 py-2 rounded"
            value={form.addressNote}
            onChange={(e) => setForm({ ...form, addressNote: e.target.value })}
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Hủy
          </button>
          <button
            onClick={() => {
              onSave(form);
              onClose();
            }}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
