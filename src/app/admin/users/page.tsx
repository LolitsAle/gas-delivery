"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { Pencil, Phone, Trash2 } from "lucide-react";

import { User } from "./constants";
import UsersHeader from "./components/UsersHeader";
import UsersMobileList from "./components/UsersMobileList";
import BottomSheet from "./components/BottomSheet";
import UserForm from "./components/UserForm";
import UsersTable from "./components/UsersTable";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [actionUser, setActionUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
  }, []);

  /* FETCH */
  useEffect(() => {
    apiFetchAuth<{ users: User[] }>("/api/admin/users").then((res) => {
      setUsers(res.users);
      setLoading(false);
    });
  }, []);

  /* SEARCH */
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter(
      (u) => u.phoneNumber.includes(q) || u.nickname.toLowerCase().includes(q),
    );
  }, [query, users]);

  /* DELETE */
  async function deleteUser(user: User) {
    const snapshot = users;
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setActionUser(null);
    setEditingUser(null);

    try {
      await apiFetchAuth(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
    } catch {
      setUsers(snapshot);
      alert("Xóa người dùng thất bại");
    }
  }

  /* UPDATE */
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

  /* CREATE */
  async function createUser(data: Partial<User>) {
    try {
      const res = await apiFetchAuth<{ user: User }>("/api/admin/users", {
        method: "POST",
        body: data,
      });
      setUsers((prev) => [res.user, ...prev]);
    } catch (error) {
      console.error("Create User ERROR:", error);
      alert("Tạo người dùng thất bại");
    }
  }

  if (loading) return <div className="p-4">Đang tải…</div>;

  return (
    <div className="p-4 space-y-4">
      <UsersHeader
        query={query}
        onQueryChange={setQuery}
        onCreate={() => setCreating(true)}
      />

      <UsersTable
        users={filtered}
        onEdit={setEditingUser}
        onDelete={deleteUser}
      />

      <UsersMobileList users={filtered} onAction={setActionUser} />

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
          onSave={(data) => updateUser(editingUser.id, data)}
        />
      )}

      {creating && (
        <UserForm
          title="Tạo người dùng mới"
          mobile={isMobile}
          onClose={() => setCreating(false)}
          onSave={createUser}
        />
      )}
    </div>
  );
}
