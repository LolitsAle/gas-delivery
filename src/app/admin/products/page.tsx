"use client";

import { useEffect, useState } from "react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { formatVND } from "@/lib/pricing/productPrice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ProductTag } from "@prisma/client";
import { AdminDataTable, AdminEntityCreateButton, AdminEntityDrawer, AdminFilterActions, AdminFilterBar, AdminPageHeader, AdminPageShell, AdminPagination, AdminSearchInput } from "@/components/admin/foundation";

type Category = { id: string; name: string };
type Product = { id: string; productName: string; currentPrice: number; pointValue: number; description: string; categoryId: string; category: Category; tags: ProductTag[] };

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ productName: "", currentPrice: 0, pointValue: 0, description: "", categoryId: "", tags: [] as ProductTag[] });

  const fetchData = async () => {
    const query = new URLSearchParams({ page: String(page), pageSize: "10", search, ...(categoryId !== "ALL" ? { categoryId } : {}) });
    const [prods, cats] = await Promise.all([
      apiFetchAuth<{ products: Product[]; pagination: { totalPages: number } }>(`/api/admin/products?${query.toString()}`),
      apiFetchAuth<{ categories: Category[] }>("/api/admin/categories"),
    ]);
    setItems(prods.products);
    setTotalPages(prods.pagination.totalPages || 1);
    setCategories(cats.categories);
  };

  useEffect(() => { fetchData(); }, [page, search, categoryId]);

  const submit = async () => {
    const body = { ...form, currentPrice: Number(form.currentPrice), pointValue: Number(form.pointValue) };
    if (editing) await apiFetchAuth(`/api/admin/products/${editing.id}`, { method: "PUT", body });
    else await apiFetchAuth("/api/admin/products", { method: "POST", body });
    setOpen(false); setEditing(null); fetchData();
  };

  return <AdminPageShell>
    <AdminPageHeader title="Products" action={<AdminEntityCreateButton label="Create product" onClick={() => setOpen(true)} />} />
    <AdminFilterBar>
      <AdminSearchInput value={search} onChange={(e) => setSearch(e.target.value)} />
      <Select value={categoryId} onValueChange={setCategoryId}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="ALL">All category</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
      <AdminFilterActions onReset={() => { setSearch(""); setCategoryId("ALL"); }} onRefresh={fetchData} />
    </AdminFilterBar>
    <AdminDataTable headers={["Name", "Category", "Price", "Point", "Actions"]} rows={items.map((it) => [it.productName, it.category?.name || "-", formatVND(it.currentPrice), String(it.pointValue), <div key={it.id} className="space-x-2"><Button size="sm" variant="outline" onClick={() => { setEditing(it); setForm({ productName: it.productName, currentPrice: it.currentPrice, pointValue: it.pointValue, description: it.description, categoryId: it.categoryId, tags: it.tags }); setOpen(true); }}>Edit</Button><Button size="sm" variant="destructive" onClick={async () => { await apiFetchAuth(`/api/admin/products/${it.id}`, { method: "DELETE" }); fetchData(); }}>Delete</Button></div>])} />
    <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
    <AdminEntityDrawer open={open} onOpenChange={setOpen} title={editing ? "Edit product" : "Create product"} onSubmit={submit}>
      <div className="space-y-3">
        <div><Label>Name</Label><Input value={form.productName} onChange={(e) => setForm((p) => ({ ...p, productName: e.target.value }))} /></div>
        <div><Label>Category</Label><Select value={form.categoryId} onValueChange={(v) => setForm((p) => ({ ...p, categoryId: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Price</Label><Input type="number" value={form.currentPrice} onChange={(e) => setForm((p) => ({ ...p, currentPrice: Number(e.target.value) }))} /></div>
        <div><Label>Point</Label><Input type="number" value={form.pointValue} onChange={(e) => setForm((p) => ({ ...p, pointValue: Number(e.target.value) }))} /></div>
        <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
      </div>
    </AdminEntityDrawer>
  </AdminPageShell>;
}
