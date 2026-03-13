"use client";

import { useEffect, useState } from "react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminDataTable, AdminFilterBar, AdminPageHeader, AdminPageShell, AdminPagination, AdminSearchInput } from "@/components/admin/foundation";

type Otp = { id: string; phone: string; code: string; expiresAt: string; attempts: number; createdAt: string };

export default function AdminPhoneOtpPage() {
  const [items, setItems] = useState<Otp[]>([]);
  const [search, setSearch] = useState("");
  const [expired, setExpired] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    const query = new URLSearchParams({ page: String(page), pageSize: "20", search, ...(expired !== "all" ? { expired: String(expired === "expired") } : {}) });
    const res = await apiFetchAuth<{ items: Otp[]; totalPages: number }>(`/api/admin/phone-otp?${query.toString()}`);
    setItems(res.items);
    setTotalPages(res.totalPages);
  };
  useEffect(() => { fetchData(); }, [search, expired, page]);

  return <AdminPageShell>
    <AdminPageHeader title="Phone OTP" description="Masked OTP code for security" />
    <AdminFilterBar>
      <AdminSearchInput value={search} onChange={(e) => setSearch(e.target.value)} />
      <Select value={expired} onValueChange={setExpired}><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="expired">Expired</SelectItem></SelectContent></Select>
    </AdminFilterBar>
    <AdminDataTable headers={["Phone", "Code", "Expires", "Attempts", "Actions"]} rows={items.map((it) => [it.phone, "••••••", new Date(it.expiresAt).toLocaleString(), String(it.attempts), <Button key={it.id} size="sm" variant="destructive" onClick={async () => { await apiFetchAuth(`/api/admin/phone-otp/${it.id}`, { method: "DELETE" }); fetchData(); }}>Delete</Button>])} />
    <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
  </AdminPageShell>;
}
