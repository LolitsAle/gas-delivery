"use client";

import React, { useEffect, useState } from "react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import type { User } from "@/lib/types/frontend";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MoreVertical, Plus, Search } from "lucide-react";
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
import CreateUserDrawer from "@/components/admin/forms/CreateUserDrawer";
import EditUserDrawer from "@/components/admin/forms/EditUserDrawer";
import {
  AdminActionBar,
  AdminEmptyState,
  AdminMobileCard,
  AdminPageLayout,
  AdminRefreshButton,
  AdminSectionCard,
} from "@/components/admin/AdminPageKit";

export interface UserWithStoves extends User {
  stoves: any[];
}

export default function Page() {
  const [total, setTotal] = useState(0);
  const [editingUser, setEditingUser] = useState<UserWithStoves | null>(null);
  const [creating, setCreating] = useState(false);
  const [users, setUsers] = useState<UserWithStoves[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [page, setPage] = useState(1);
  const [triggerUserRefresh, setTriggerUserRefresh] = useState(false);

  const pageSize = 10;
  const refreshUser = () => setTriggerUserRefresh((p) => !p);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
    });
    if (search.trim()) params.set("search", search.trim());
    if (status !== "ALL") params.set("status", status);

    apiFetchAuth<{ users: UserWithStoves[]; meta: any }>(
      `/api/admin/users?${params.toString()}`,
    )
      .then((res) => {
        setUsers(res.users || []);
        setTotal(res.meta?.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page, search, status, triggerUserRefresh]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <AdminPageLayout
      actionBar={
        <AdminActionBar>
          <div className="flex flex-row gap-2 md:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tên / SĐT"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select
              value={status}
              onValueChange={(value) => setStatus(value as any)}
            >
              <SelectTrigger className="w-fit min-w-120px max-w-160px">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Đã bị khoá</SelectItem>
              </SelectContent>
            </Select>

            <AdminRefreshButton onClick={refreshUser} loading={loading} />

            <Button
              onClick={() => setCreating(true)}
              className="min-w-9 px-2 sm:px-3"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Tạo user</span>
            </Button>
          </div>
        </AdminActionBar>
      }
    >
      <div className="space-y-3 md:hidden">
        {users.map((u) => (
          <AdminMobileCard
            key={u.id}
            header={
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {u.nickname || u.name || "Không tên"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {u.phoneNumber}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white/80"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingUser(u)}>
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={async () => {
                        await apiFetchAuth(`/api/admin/users/${u.id}`, {
                          method: "DELETE",
                        });
                        refreshUser();
                      }}
                    >
                      Khóa user
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            }
          >
            <p className="text-sm text-muted-foreground">Điểm: {u.points}</p>
            <p className="text-sm text-muted-foreground">
              Bếp: {u.stoves.length}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {u.address || "Không có địa chỉ"}
            </p>
          </AdminMobileCard>
        ))}
        {!loading && users.length === 0 ? (
          <AdminEmptyState title="Không có người dùng" />
        ) : null}
      </div>

      <div className="hidden md:block">
        <AdminSectionCard className="overflow-hidden p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead className="text-center">SL Bếp</TableHead>
                <TableHead className="text-center">Điểm</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.nickname || u.name || "-"}
                  </TableCell>
                  <TableCell>{u.phoneNumber}</TableCell>
                  <TableCell>{u.address || "-"}</TableCell>
                  <TableCell className="text-center">
                    {u.stoves.length}
                  </TableCell>
                  <TableCell className="text-center">{u.points}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingUser(u)}>
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={async () => {
                            await apiFetchAuth(`/api/admin/users/${u.id}`, {
                              method: "DELETE",
                            });
                            refreshUser();
                          }}
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
          {!loading && users.length === 0 ? (
            <AdminEmptyState title="Không có người dùng" />
          ) : null}
        </AdminSectionCard>
      </div>

      <Pagination className="mt-2">
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

      <CreateUserDrawer
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={async (data) => {
          await apiFetchAuth("/api/admin/users", {
            method: "POST",
            body: data,
          });
          setCreating(false);
          refreshUser();
        }}
      />

      <EditUserDrawer
        open={!!editingUser}
        selectedUser={editingUser!}
        onClose={() => setEditingUser(null)}
        onSave={async (data) => {
          await apiFetchAuth(`/api/admin/users/${editingUser!.id}`, {
            method: "PUT",
            body: data,
          });
          setEditingUser(null);
          refreshUser();
        }}
      />
    </AdminPageLayout>
  );
}
