"use client";

import React, { useEffect, useState } from "react";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  ActionMenu,
  ActionMenuItem,
  AdminCard,
  AdminTable,
  AdminTableCell,
  AdminTableRow,
  StatusBadge,
} from "@/components/admin/Commons";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { User } from "@prisma/client";
import UserForm from "@/components/admin/forms/UserForm";

export interface UserWithStoves extends User {
  stoves: any[];
}

interface Props {}

function Page2(props: Props) {
  const {} = props;
  const [query] = useState("");
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  const [editingUser, setEditingUser] = useState<UserWithStoves | null>(null);
  const [creating, setCreating] = useState(false);
  const [editStove, setEditStove] = useState<UserWithStoves | null>(null);

  const [users, setUsers] = useState<UserWithStoves[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [page, setPage] = useState(1);

  const pageSize = 5;

  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (query) params.set("search", query);
    if (status !== "ALL") params.set("status", status);

    apiFetchAuth<{ users: UserWithStoves[]; total: number }>(
      `/api/admin/users?${params.toString()}`,
    )
      .then((res) => {
        setUsers(res.users);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, [page, limit, query, status]);

  /* Reset page khi filter/search đổi */
  useEffect(() => {
    setPage(1);
  }, [query, status]);

  // Create user
  async function createUser(data: Partial<UserWithStoves>) {
    try {
      const res = await apiFetchAuth<{ user: UserWithStoves }>(
        "/api/admin/users",
        {
          method: "POST",
          body: data,
        },
      );

      if (page === 1) {
        setUsers((prev) => [res.user, ...prev.slice(0, limit - 1)]);
      }

      setTotal((t) => t + 1);
    } catch (error) {
      console.error("Create User ERROR:", error);
      alert("Tạo người dùng thất bại");
    }
  }

  // Delete user
  async function deleteUser(user: UserWithStoves) {
    const snapshot = users;

    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setTotal((t) => t - 1);

    try {
      await apiFetchAuth(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
    } catch {
      setUsers(snapshot);
      setTotal((t) => t + 1);
      alert("Xóa người dùng thất bại");
    }
  }

  // Update user
  async function updateUser(id: string, data: Partial<User>) {
    const snapshot = users;

    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));

    try {
      const res = await apiFetchAuth<{ user: UserWithStoves }>(
        `/api/admin/users/${id}`,
        {
          method: "PUT",
          body: data,
        },
      );

      setUsers((prev) => prev.map((u) => (u.id === id ? res.user : u)));
    } catch {
      setUsers(snapshot);
      alert("Cập nhật thất bại");
    }
  }

  /* FILTER */
  const filtered = users.filter((u) => {
    const matchSearch =
      u.nickname.toLowerCase().includes(search.toLowerCase()) ||
      u.phoneNumber.includes(search);

    const matchStatus =
      status === "ALL" ||
      (status === "ACTIVE" && u.isActive) ||
      (status === "INACTIVE" && !u.isActive);

    return matchSearch && matchStatus;
  });

  /* PAGINATION */
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return <div className="text-sm text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter – Mobile first */}
      <div className="flex items-center gap-2">
        <input
          placeholder="Tên / SĐT"
          className="h-10 flex-1 rounded-xl border px-3 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="h-10 w-[90px] rounded-xl border px-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="ALL">All</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="INACTIVE">Đã bị khoá</option>
        </select>

        <button
          onClick={() => setCreating(true)}
          className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center"
          aria-label="Tạo user"
        >
          +
        </button>
      </div>

      {/* Mobile – Card */}
      <div className="md:hidden space-y-3">
        {paged.map((u) => (
          <AdminCard
            key={u.id}
            title={
              <div className="flex items-center gap-[2vw]">
                <div className="max-w-[60%] truncate font-medium">
                  {u.nickname}
                </div>
                <a
                  href={`tel:${u.phoneNumber}`}
                  className="shrink-0 text-md text-gray-700 underline"
                >
                  ({u.phoneNumber})
                </a>
              </div>
            }
            actions={
              <ActionMenu>
                <ActionMenuItem onClick={() => setEditingUser(u)}>
                  Chỉnh sửa
                </ActionMenuItem>
                <ActionMenuItem danger onClick={() => deleteUser(u)}>
                  Khoá user
                </ActionMenuItem>
              </ActionMenu>
            }
          >
            {/* Row 2: Address + Points */}
            <div className="flex justify-between text-sm text-gray-700">
              <div className="truncate max-w-[70%]">
                📍 {u.address || "Chưa có địa chỉ"}
              </div>
              <div className="whitespace-nowrap">⭐ {u.points}</div>
            </div>

            {/* Row 3: Address Note */}
            {u.addressNote && (
              <div className="text-sm font-medium text-gray-800">
                {u.addressNote}
              </div>
            )}

            {/* Row 4: Status tags */}
            <div className="flex gap-2 flex-wrap">
              <StatusBadge status={u.isActive ? "ACTIVE" : "INACTIVE"} />
              <StatusBadge status={u.isVerified ? "VERIFIED" : "PENDING"} />
            </div>

            {/* Row 5: Stoves */}
            <div className="text-xs text-gray-500">
              🔥 {u.stoves.length} bếp
            </div>
          </AdminCard>
        ))}
      </div>

      {/* Desktop – Table */}
      <AdminTable
        headers={["User", "Phone", "Address", "Stoves", "Points", "Status", ""]}
      >
        {paged.map((u) => (
          <AdminTableRow key={u.id}>
            <AdminTableCell>{u.nickname}</AdminTableCell>
            <AdminTableCell>{u.phoneNumber}</AdminTableCell>
            <AdminTableCell>
              <div className="text-sm">{u.address || "-"}</div>
              {u.addressNote && (
                <div className="text-xs text-gray-500">{u.addressNote}</div>
              )}
            </AdminTableCell>
            <AdminTableCell>{u.stoves.length}</AdminTableCell>
            <AdminTableCell>{u.points}</AdminTableCell>
            <AdminTableCell>
              <div className="flex gap-2">
                <StatusBadge status={u.isActive ? "ACTIVE" : "INACTIVE"} />
                <StatusBadge status={u.isVerified ? "VERIFIED" : "PENDING"} />
              </div>
            </AdminTableCell>
            <AdminTableCell>
              <ActionMenu>
                <ActionMenuItem onClick={() => setEditingUser(u)}>
                  Chỉnh sửa
                </ActionMenuItem>
                <ActionMenuItem onClick={() => setEditStove(u)}>
                  Quản lý bếp
                </ActionMenuItem>
                <ActionMenuItem danger onClick={() => deleteUser(u)}>
                  Khoá user
                </ActionMenuItem>
              </ActionMenu>
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminTable>
      <AdminPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* CREATE USER */}
      {creating && (
        <UserForm
          title="Tạo người dùng mới"
          mobile={false}
          onClose={() => setCreating(false)}
          onSave={async (data) => {
            await createUser(data);
            setCreating(false);
          }}
        />
      )}

      {/* UPDATE USER */}
      {editingUser && (
        <UserForm
          title="Chỉnh sửa người dùng"
          user={editingUser}
          mobile={false}
          onClose={() => setEditingUser(null)}
          onSave={async (data) => {
            await updateUser(editingUser.id, data);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}

export default Page2;
