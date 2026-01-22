"use client";

import React, { useEffect, useState } from "react";
import { AdminCard, StatusBadge } from "@/components/admin/Commons";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { User } from "@prisma/client";
import UserForm from "@/components/admin/forms/UserForm";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MoreVertical, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserStovesDialog from "./UserStoveDialog";

export interface UserWithStoves extends User {
  stoves: any[];
}

interface Props {}

function Page(props: Props) {
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
        <Input
          placeholder="Tên / SĐT"
          className="h-10 flex-1 rounded-md text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          value={status}
          onValueChange={(value) => setStatus(value as any)}
        >
          <SelectTrigger className="h-10 w-22.5 rounded-md text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
            <SelectItem value="INACTIVE">Đã bị khoá</SelectItem>
          </SelectContent>
        </Select>

        <Button
          size="icon"
          className="h-10 w-10 rounded-md"
          onClick={() => setCreating(true)}
          aria-label="Tạo user"
        >
          <Plus className="h-4 w-4" />
        </Button>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Mở menu"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" sideOffset={6}>
                  <DropdownMenuItem onClick={() => setEditingUser(u)}>
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditStove(u)}>
                    Quản lý bếp
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => deleteUser(u)}
                  >
                    Khoá user
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
      <div className="hidden md:block w-full overflow-x-auto">
        <div className="rounded-lg border bg-white shadow-sm">
          <Table className="w-full table-fixed">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tên
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Số điện thoại
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Địa chỉ
                </TableHead>
                <TableHead className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  SL Bếp
                </TableHead>
                <TableHead className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Điểm
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tình trạng
                </TableHead>
                <TableHead className="px-4 py-3 text-right" />
              </TableRow>
            </TableHeader>

            {/* BODY */}
            <TableBody>
              {paged.map((u) => (
                <TableRow
                  key={u.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="px-4 py-3 font-medium">
                    {u.nickname}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {u.phoneNumber}
                  </TableCell>

                  <TableCell className="px-4 py-3 max-w-65">
                    <div className="truncate text-sm">{u.address || "-"}</div>
                    {u.addressNote && (
                      <div className="truncate text-xs text-muted-foreground">
                        {u.addressNote}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-center text-sm">
                    {u.stoves.length}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-center text-sm">
                    {u.points}
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <StatusBadge
                        status={u.isActive ? "ACTIVE" : "INACTIVE"}
                      />
                      <StatusBadge
                        status={u.isVerified ? "VERIFIED" : "PENDING"}
                      />
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Mở menu"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" sideOffset={6}>
                        <DropdownMenuItem onClick={() => setEditingUser(u)}>
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditStove(u)}>
                          Quản lý bếp
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => deleteUser(u)}
                        >
                          Khoá user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) setPage(page - 1);
              }}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;

            return (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(p);
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) setPage(page + 1);
              }}
              className={
                page === totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
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

      {/* MANAGE STOVES */}
      {editStove && (
        <UserStovesDialog user={editStove} onClose={() => setEditStove(null)} />
      )}
    </div>
  );
}

export default Page;
