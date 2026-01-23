"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import ConfirmModal from "@/components/main/ConfirmModal";

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

  /* =====================
     FETCH
  ====================== */
  useEffect(() => {
    apiFetchAuth<{ categories: Category[] }>("/api/admin/categories").then(
      (res) => {
        setCategories(res.categories);
        setLoading(false);
      },
    );
  }, []);

  /* =====================
     SEARCH
  ====================== */
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  /* =====================
     ACTIONS
     ====================== */
  async function createCategory(data: Partial<Category>) {
    const res = await apiFetchAuth<{ category: Category }>(
      "/api/admin/categories",
      {
        method: "POST",
        body: data,
      },
    );
    setCategories((prev) => [res.category, ...prev]);
    setCreating(false);
  }

  async function updateCategory(id: string, data: Partial<Category>) {
    const res = await apiFetchAuth<{ category: Category }>(
      "/api/admin/categories",
      {
        method: "PUT",
        body: { id, ...data },
      },
    );
    setCategories((prev) => prev.map((c) => (c.id === id ? res.category : c)));
    setEditing(null);
  }

  async function confirmDeleteCategory() {
    if (!deleting) return;

    try {
      setDeletingLoading(true);

      await apiFetchAuth(`/api/admin/categories?id=${deleting.id}`, {
        method: "DELETE",
      });

      setCategories((prev) => prev.filter((c) => c.id !== deleting.id));

      setDeleting(null);
    } finally {
      setDeletingLoading(false);
    }
  }

  if (loading) return <div className="p-4">Đang tải...</div>;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm danh mục"
            className="w-full pl-9 input"
          />
        </div>

        <button
          onClick={() => setCreating(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Thêm
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Tên</th>
              <th className="p-3">Miễn ship</th>
              <th className="p-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3">{c.freeShip ? "Có" : "Không"}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => setEditing(c)} className="icon-btn">
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleting(c)}
                    className="icon-btn text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  Không có danh mục
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <CategoryForm
          title={creating ? "Thêm danh mục" : "Chỉnh sửa danh mục"}
          category={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={(data) =>
            editing ? updateCategory(editing.id, data) : createCategory(data)
          }
        />
      )}

      {/* {deleting && (
        <ConfirmModal
          title="Xóa danh mục"
          description={`Bạn có chắc chắn muốn xóa "${deleting.name}"?`}
          confirmText="Xóa"
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDeleteCategory}
          loading={deletingLoading}
        />
      )} */}
    </div>
  );
}

/* =====================
   CATEGORY FORM
====================== */

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 w-full max-w-sm space-y-4">
        <div className="font-semibold text-lg">{title}</div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên danh mục"
          className="input w-full"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={freeShip}
            onChange={(e) => setFreeShip(e.target.checked)}
          />
          Miễn phí vận chuyển
        </label>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">
            Hủy
          </button>
          <button
            onClick={() => onSave({ name, freeShip })}
            className="btn-primary"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
