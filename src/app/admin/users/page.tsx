"use client";

import { useEffect, useState } from "react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AdminDataTable, AdminEntityCreateButton, AdminEntityDrawer, AdminFilterBar, AdminPageHeader, AdminPageShell, AdminPagination, AdminSearchInput, AdminStatusBadge } from "@/components/admin/foundation";

type Stove = { id: string; name: string; address: string; note?: string; defaultProductQuantity?: number; defaultPromoChoice?: string; houseImage?: string[]; productId?: string; defaultPromoProductId?: string };
type User = { id: string; name?: string; nickname: string; phoneNumber: string; role: "USER" | "ADMIN"; isVerified: boolean; isActive: boolean; points: number; tags: string[]; createdAt: string; stoves: Stove[] };

export default function AdminUsersPage() {
  const [items, setItems] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<any>({ nickname: "", phoneNumber: "", role: "USER", isActive: true, isVerified: false, tags: [] as string[] });

  const fetchData = async () => {
    const q = new URLSearchParams({ page: String(page), limit: "10", search, ...(status !== "ALL" ? { status } : {}) });
    const res = await apiFetchAuth<{ users: User[]; meta: { totalPages: number } }>(`/api/admin/users?${q.toString()}`);
    setItems(res.users);
    setTotalPages(res.meta.totalPages || 1);
  };

  useEffect(() => { fetchData(); }, [search, status, page]);

  const saveUser = async () => {
    if (editing) await apiFetchAuth(`/api/admin/users/${editing.id}`, { method: "PUT", body: form });
    else await apiFetchAuth(`/api/admin/users`, { method: "POST", body: { ...form, password: "temporary" } });
    setOpen(false); setEditing(null); fetchData();
  };

  return <AdminPageShell>
    <AdminPageHeader title="Users" action={<AdminEntityCreateButton label="Create user" onClick={() => setOpen(true)} />} />
    <AdminFilterBar>
      <AdminSearchInput value={search} onChange={(e) => setSearch(e.target.value)} />
      <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All</SelectItem><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem></SelectContent></Select>
    </AdminFilterBar>
    <AdminDataTable headers={["Name", "Phone", "Role", "Status", "Verified", "Stoves", "Actions"]} rows={items.map((u) => [u.nickname || u.name || "-", u.phoneNumber, u.role, <AdminStatusBadge key={u.id+"s"} status={u.isActive ? "ACTIVE" : "INACTIVE"} />, <AdminStatusBadge key={u.id+"v"} status={u.isVerified ? "VERIFIED" : "UNVERIFIED"} />, String(u.stoves?.length || 0), <div key={u.id} className="space-x-2"><Button size="sm" variant="outline" onClick={() => { setEditing(u); setForm({ ...u }); setOpen(true); }}>Edit</Button><Button size="sm" variant="destructive" onClick={async () => { await apiFetchAuth(`/api/admin/users/${u.id}`, { method: "DELETE" }); fetchData(); }}>Disable</Button></div>])} />
    <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
    <AdminEntityDrawer open={open} onOpenChange={setOpen} title={editing ? "Edit user" : "Create user"} onSubmit={saveUser}>
      <div className="space-y-3">
        <div><Label>Nickname</Label><Input value={form.nickname || ""} onChange={(e) => setForm((p: any) => ({ ...p, nickname: e.target.value }))} /></div>
        <div><Label>Phone</Label><Input value={form.phoneNumber || ""} onChange={(e) => setForm((p: any) => ({ ...p, phoneNumber: e.target.value }))} /></div>
        <div><Label>Role</Label><Select value={form.role || "USER"} onValueChange={(v) => setForm((p: any) => ({ ...p, role: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USER">USER</SelectItem><SelectItem value="ADMIN">ADMIN</SelectItem></SelectContent></Select></div>
        <div className="flex items-center gap-2"><Switch checked={!!form.isActive} onCheckedChange={(v) => setForm((p: any) => ({ ...p, isActive: v }))} /><Label>Active</Label></div>
        <div className="flex items-center gap-2"><Switch checked={!!form.isVerified} onCheckedChange={(v) => setForm((p: any) => ({ ...p, isVerified: v }))} /><Label>Verified</Label></div>
        <div className="space-y-2 rounded border p-2"><p className="text-sm font-medium">Stoves (reuse field mapping from UserStoveDrawer)</p>{(form.stoves || []).map((s: Stove) => <div key={s.id} className="rounded border p-2 text-xs"><p>{s.name}</p><p>{s.address}</p><p>Qty: {s.defaultProductQuantity || 1} - Promo: {s.defaultPromoChoice || "BONUS_POINT"}</p></div>)}</div>
      </div>
    </AdminEntityDrawer>
  </AdminPageShell>;
}
