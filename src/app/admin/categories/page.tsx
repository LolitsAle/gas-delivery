"use client";

import { useEffect, useState } from "react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminConfirmDeleteDialog,
  AdminDataTable,
  AdminEmptyState,
  AdminEntityCreateButton,
  AdminEntityDrawer,
  AdminFilterActions,
  AdminFilterBar,
  AdminLoadingSkeleton,
  AdminMobileList,
  AdminPageHeader,
  AdminPageShell,
  AdminSearchInput,
} from "@/components/admin/foundation";

type Category = { id: string; name: string; products?: { id: string }[] };

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetchAuth<{ categories: Category[] }>("/api/admin/categories");
      const s = search.toLowerCase();
      setItems(res.categories.filter((x) => x.name.toLowerCase().includes(s)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const onSubmit = async () => {
    if (editing) {
      await apiFetchAuth("/api/admin/categories", { method: "PUT", body: { id: editing.id, name } });
    } else {
      await apiFetchAuth("/api/admin/categories", { method: "POST", body: { name } });
    }
    setOpen(false);
    setEditing(null);
    setName("");
    fetchData();
  };

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Categories"
        action={<AdminEntityCreateButton label="Create category" onClick={() => setOpen(true)} />}
      />
      <AdminFilterBar>
        <AdminSearchInput value={search} onChange={(e) => setSearch(e.target.value)} />
        <AdminFilterActions onReset={() => setSearch("")} onRefresh={fetchData} />
      </AdminFilterBar>
      {loading ? <AdminLoadingSkeleton /> : items.length === 0 ? <AdminEmptyState title="No categories" /> : (
        <>
          <AdminDataTable
            headers={["Name", "Products", "Actions"]}
            rows={items.map((item) => [item.name, String(item.products?.length || 0), <div key={item.id} className="space-x-2"><Button size="sm" variant="outline" onClick={() => { setEditing(item); setName(item.name); setOpen(true); }}>Edit</Button><Button size="sm" variant="destructive" onClick={() => setDeleting(item)}>Delete</Button></div>])}
          />
          <AdminMobileList
            items={items.map((item) => <div key={item.id} className="rounded-lg border p-3"><div className="font-medium">{item.name}</div></div>)}
          />
        </>
      )}
      <AdminEntityDrawer open={open} onOpenChange={setOpen} title={editing ? "Edit category" : "Create category"} onSubmit={onSubmit}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
      </AdminEntityDrawer>
      <AdminConfirmDeleteDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)} onConfirm={async () => {
        if (!deleting) return;
        await apiFetchAuth(`/api/admin/categories?id=${deleting.id}`, { method: "DELETE" });
        setDeleting(null);
        fetchData();
      }} />
    </AdminPageShell>
  );
}
