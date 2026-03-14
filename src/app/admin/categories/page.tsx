"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdminActionBar,
  AdminEmptyState,
  AdminMobileCard,
  AdminSectionCard,
} from "@/components/admin/AdminPageKit";

interface Category {
  id: string;
  name: string;
  freeShip: boolean;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  useEffect(() => {
    apiFetchAuth<{ categories: Category[] }>("/api/admin/categories")
      .then((res) => setCategories(res.categories))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  return (
    <div className="space-y-4 p-[2vw] md:p-[4vw]">
      <AdminActionBar>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm danh mục"
              className="pl-9"
            />
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm danh mục
          </Button>
        </div>
      </AdminActionBar>

      {loading ? (
        <AdminSectionCard>Đang tải dữ liệu...</AdminSectionCard>
      ) : (
        <>
          <div className="hidden md:block">
            <AdminSectionCard className="overflow-hidden p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Miễn ship</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.freeShip ? "Có" : "Không"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setEditing(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => setDeleting(c)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length === 0 ? <AdminEmptyState title="Không có danh mục phù hợp" /> : null}
            </AdminSectionCard>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((c) => (
              <AdminMobileCard
                key={c.id}
                header={<p className="font-semibold">{c.name}</p>}
                footer={
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(c)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />Sửa
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleting(c)}>
                      <Trash2 className="mr-2 h-3.5 w-3.5" />Xóa
                    </Button>
                  </div>
                }
              >
                <p className="text-sm text-muted-foreground">Miễn ship: {c.freeShip ? "Có" : "Không"}</p>
              </AdminMobileCard>
            ))}
            {filtered.length === 0 ? <AdminEmptyState title="Không có danh mục phù hợp" /> : null}
          </div>
        </>
      )}

      {(creating || editing) && (
        <CategoryForm
          title={creating ? "Thêm danh mục" : "Chỉnh sửa danh mục"}
          category={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={async (data) => {
            if (editing) {
              const res = await apiFetchAuth<{ category: Category }>("/api/admin/categories", {
                method: "PUT",
                body: { id: editing.id, ...data },
              });
              setCategories((prev) => prev.map((c) => (c.id === editing.id ? res.category : c)));
              setEditing(null);
              return;
            }
            const res = await apiFetchAuth<{ category: Category }>("/api/admin/categories", {
              method: "POST",
              body: data,
            });
            setCategories((prev) => [res.category, ...prev]);
            setCreating(false);
          }}
        />
      )}

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa danh mục</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn chắc chắn muốn xóa danh mục {deleting?.name ?? ""}?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleting) return;
                setDeletingLoading(true);
                try {
                  await apiFetchAuth(`/api/admin/categories?id=${deleting.id}`, {
                    method: "DELETE",
                  });
                  setCategories((prev) => prev.filter((c) => c.id !== deleting.id));
                  setDeleting(null);
                } finally {
                  setDeletingLoading(false);
                }
              }}
              disabled={deletingLoading}
            >
              {deletingLoading ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoryForm({
  title,
  category,
  onClose,
  onSave,
}: {
  title: string;
  category?: Category | null;
  onClose: () => void;
  onSave: (data: Partial<Category>) => void;
}) {
  const [name, setName] = useState(category?.name || "");
  const [freeShip, setFreeShip] = useState(category?.freeShip || false);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên danh mục" />
          <label className="flex items-center justify-between rounded-lg border p-3 text-sm">
            Miễn phí vận chuyển
            <Switch checked={freeShip} onCheckedChange={setFreeShip} />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={() => onSave({ name, freeShip })}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
