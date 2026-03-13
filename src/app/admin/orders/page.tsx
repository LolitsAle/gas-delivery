"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { formatVND } from "@/lib/pricing/productPrice";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AdminDataTable, AdminEntityDrawer, AdminFilterBar, AdminPageHeader, AdminPageShell, AdminPagination, AdminSearchInput, AdminStatusBadge } from "@/components/admin/foundation";

type Order = { id: string; status: string; type: string; createdAt: string; totalPrice: number; pointsUsed: number; pointsEarned: number; note?: string; user?: { nickname?: string; phoneNumber?: string }; shipper?: { name?: string }; stoveSnapshot?: { address?: string; stoveName?: string } };

const doneStatuses = ["COMPLETED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);
  const [nextStatus, setNextStatus] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<any>(null);

  const query = useMemo(() => new URLSearchParams({ page: String(page), limit: "10", includeCompleted: String(status === "ALL" || doneStatuses.includes(status)), ...(search ? { search } : {}) }), [page, search, status]);

  const fetchData = useCallback(async () => {
    const res = await apiFetchAuth<{ orders: Order[]; pagination: { totalPages: number } }>(`/api/admin/orders?${query.toString()}`);
    let filtered = res.orders;
    if (status !== "ALL") filtered = filtered.filter((o) => o.status === status);
    if (type !== "ALL") filtered = filtered.filter((o) => o.type === type);
    if (search) filtered = filtered.filter((o) => o.id.includes(search) || o.user?.phoneNumber?.includes(search) || o.user?.nickname?.toLowerCase().includes(search.toLowerCase()));
    setItems(filtered);
    setTotalPages(res.pagination.totalPages || 1);
  }, [query, status, type, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const applyRealtimeUpdate = async (orderId: string, isCreate: boolean) => {
    if (page !== 1) return;
    const detail = await apiFetchAuth<Order>(`/api/admin/orders/${orderId}`);
    setItems((prev) => {
      const matchesFilter = (status === "ALL" || detail.status === status) && (type === "ALL" || detail.type === type);
      if (!matchesFilter) return prev;
      const idx = prev.findIndex((x) => x.id === detail.id);
      if (idx >= 0) {
        const cp = [...prev]; cp[idx] = detail; return cp;
      }
      return isCreate ? [detail, ...prev].slice(0, 10) : prev;
    });
  };

  useEffect(() => {
    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${protocol}://${window.location.host}/ws/admin-orders`);
      socketRef.current = ws;
      ws.onmessage = async (event) => {
        const payload = JSON.parse(event.data || "{}");
        if (payload.type === "ORDER_CREATED") await applyRealtimeUpdate(payload.orderId, true);
        if (payload.type === "ORDER_UPDATED") await applyRealtimeUpdate(payload.orderId, false);
      };
      ws.onclose = () => {
        reconnectRef.current = setTimeout(connect, 2000);
      };
    };
    connect();
    return () => { socketRef.current?.close(); if (reconnectRef.current) clearTimeout(reconnectRef.current); };
  }, [status, type, page]);

  return <AdminPageShell>
    <AdminPageHeader title="Orders" />
    <AdminFilterBar>
      <AdminSearchInput value={search} onChange={(e) => setSearch(e.target.value)} />
      <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All status</SelectItem>{["PENDING","CONFIRMED","DELIVERING","UNPAID","COMPLETED","CANCELLED"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
      <Select value={type} onValueChange={setType}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All type</SelectItem><SelectItem value="NORMAL">NORMAL</SelectItem><SelectItem value="EXCHANGE">EXCHANGE</SelectItem></SelectContent></Select>
      <Button variant="outline" onClick={fetchData}>Refresh</Button>
    </AdminFilterBar>
    <AdminDataTable headers={["ID", "Customer", "Phone", "Address", "Total", "Status", "Type", "CreatedAt", "Shipper", "Actions"]} rows={items.map((o) => [o.id.slice(0,8), o.user?.nickname || "-", o.user?.phoneNumber || "-", o.stoveSnapshot?.address || "-", formatVND(o.totalPrice), <AdminStatusBadge key={o.id+"st"} status={o.status} />, o.type, new Date(o.createdAt).toLocaleString(), o.shipper?.name || "-", <Button key={o.id} size="sm" variant="outline" onClick={() => { setSelected(o); setNextStatus(o.status); }}>Detail</Button>])} />
    <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
    <AdminEntityDrawer open={!!selected} onOpenChange={(v) => !v && setSelected(null)} title={`Order ${selected?.id || ""}`} onSubmit={async () => {
      if (!selected || nextStatus === selected.status) return setSelected(null);
      await apiFetchAuth(`/api/admin/orders/${selected.id}/status`, { method: "PATCH", body: { status: nextStatus } });
      setSelected(null); fetchData();
    }}>
      <div className="space-y-2 text-sm">
        <p>Khách: {selected?.user?.nickname} - {selected?.user?.phoneNumber}</p>
        <p>Địa chỉ: {selected?.stoveSnapshot?.address}</p>
        <p>Tổng tiền: {selected ? formatVND(selected.totalPrice) : "-"}</p>
        <p>Điểm dùng / nhận: {selected?.pointsUsed || 0} / {selected?.pointsEarned || 0}</p>
        <p>Ghi chú: {selected?.note || "-"}</p>
        <Select value={nextStatus} onValueChange={setNextStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["PENDING","CONFIRMED","DELIVERING","UNPAID","COMPLETED","CANCELLED"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
      </div>
    </AdminEntityDrawer>
  </AdminPageShell>;
}
