"use client";

import { useEffect, useState } from "react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminDataTable, AdminEntityCreateButton, AdminEntityDrawer, AdminFilterBar, AdminPageHeader, AdminPageShell, AdminSearchInput, AdminStatusBadge } from "@/components/admin/foundation";

const conditionTypes = ["PRODUCT_TAG", "CATEGORY", "MIN_SUBTOTAL", "ORDER_TYPE"];
const actionTypes = ["DISCOUNT_PERCENT", "DISCOUNT_AMOUNT", "FREE_SHIP", "BONUS_POINT"];

type Promotion = { id: string; name: string; isActive: boolean; priority: number; startAt: string; endAt: string; conditions: { type: string; value: string | null }[]; actions: { type: string; value: number | null; maxDiscount: number | null }[] };

export default function AdminPromotionsPage() {
  const [items, setItems] = useState<Promotion[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ name: "", description: "", startAt: "", endAt: "", isActive: true, priority: 0, conditions: [{ type: "MIN_SUBTOTAL", value: "" }], actions: [{ type: "DISCOUNT_AMOUNT", value: 0, maxDiscount: 0 }] });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = async () => {
    const res = await apiFetchAuth<{ promotions: Promotion[] }>("/api/admin/promotions");
    setItems(res.promotions.filter((x) => x.name.toLowerCase().includes(search.toLowerCase())));
  };
  useEffect(() => { fetchData(); }, [search]);

  const submit = async () => {
    if (editingId) await apiFetchAuth(`/api/admin/promotions/${editingId}`, { method: "PUT", body: form });
    else await apiFetchAuth("/api/admin/promotions", { method: "POST", body: form });
    setOpen(false); setEditingId(null); fetchData();
  };

  return <AdminPageShell>
    <AdminPageHeader title="Promotions" action={<AdminEntityCreateButton label="Create promotion" onClick={() => setOpen(true)} />} />
    <AdminFilterBar><AdminSearchInput value={search} onChange={(e) => setSearch(e.target.value)} /></AdminFilterBar>
    <AdminDataTable headers={["Name", "Status", "Priority", "Actions"]} rows={items.map((it) => [it.name, <AdminStatusBadge key={it.id} status={it.isActive ? "ACTIVE" : "INACTIVE"} />, String(it.priority), <div key={it.id} className="space-x-2"><Button size="sm" variant="outline" onClick={() => { setEditingId(it.id); setForm(it); setOpen(true); }}>Edit</Button><Button size="sm" variant="destructive" onClick={async () => { await apiFetchAuth(`/api/admin/promotions/${it.id}`, { method: "DELETE" }); fetchData(); }}>Delete</Button></div>])} />
    <AdminEntityDrawer open={open} onOpenChange={setOpen} title={editingId ? "Edit promotion" : "Create promotion"} onSubmit={submit}>
      <div className="space-y-3">
        <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-2"><div><Label>Start</Label><Input type="datetime-local" value={form.startAt?.slice(0,16) || ""} onChange={(e) => setForm((p: any) => ({ ...p, startAt: new Date(e.target.value).toISOString() }))} /></div><div><Label>End</Label><Input type="datetime-local" value={form.endAt?.slice(0,16) || ""} onChange={(e) => setForm((p: any) => ({ ...p, endAt: new Date(e.target.value).toISOString() }))} /></div></div>
        <div><Label>Condition</Label><Select value={form.conditions[0]?.type} onValueChange={(v) => setForm((p: any) => ({ ...p, conditions: [{ ...p.conditions[0], type: v }] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{conditionTypes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><Input value={form.conditions[0]?.value ?? ""} onChange={(e) => setForm((p: any) => ({ ...p, conditions: [{ ...p.conditions[0], value: e.target.value }] }))} /></div>
        <div><Label>Action</Label><Select value={form.actions[0]?.type} onValueChange={(v) => setForm((p: any) => ({ ...p, actions: [{ ...p.actions[0], type: v }] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{actionTypes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><Input type="number" value={form.actions[0]?.value ?? 0} onChange={(e) => setForm((p: any) => ({ ...p, actions: [{ ...p.actions[0], value: Number(e.target.value) }] }))} /></div>
      </div>
    </AdminEntityDrawer>
  </AdminPageShell>;
}
