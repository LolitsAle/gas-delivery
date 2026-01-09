"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { apiFetchAuth } from "@/lib/api/apiClient";

/* =====================
   TYPES
====================== */

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  productName: string;
  currentPrice: number;
  pointValue: number;
  category: Category;
  categoryId?: string;
}

type SortValue =
  | "created_desc"
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc";

/* =====================
   PAGE
====================== */

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sort, setSort] = useState<SortValue>("created_desc");

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  /* =====================
     FETCH CATEGORIES
  ====================== */
  useEffect(() => {
    apiFetchAuth<{ categories: Category[] }>("/api/admin/categories").then(
      (res) => setCategories(res.categories)
    );
  }, []);

  /* =====================
     FETCH PRODUCTS
  ====================== */
  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (categoryId !== "all") params.set("categoryId", categoryId);

    if (sort === "name_asc") {
      params.set("sort", "productName");
      params.set("order", "asc");
    }
    if (sort === "name_desc") {
      params.set("sort", "productName");
      params.set("order", "desc");
    }
    if (sort === "price_asc") {
      params.set("sort", "currentPrice");
      params.set("order", "asc");
    }
    if (sort === "price_desc") {
      params.set("sort", "currentPrice");
      params.set("order", "desc");
    }
    if (sort === "created_desc") {
      params.set("sort", "createdAt");
      params.set("order", "desc");
    }

    apiFetchAuth<{ products: Product[] }>(
      `/api/admin/products?${params.toString()}`
    ).then((res) => {
      setProducts(res.products);
      setLoading(false);
    });
  }, [query, categoryId, sort]);

  /* =====================
     ACTIONS
  ====================== */
  async function createProduct(data: Partial<Product>) {
    const res = await apiFetchAuth<{ product: Product }>(
      "/api/admin/products",
      {
        method: "POST",
        body: data,
      }
    );
    setProducts((prev) => [res.product, ...prev]);
    setCreating(false);
  }

  async function updateProduct(id: string, data: Partial<Product>) {
    const res = await apiFetchAuth<{ product: Product }>(
      "/api/admin/products",
      {
        method: "PUT",
        body: { id, ...data },
      }
    );

    setProducts((prev) => prev.map((p) => (p.id === id ? res.product : p)));
    setEditing(null);
  }

  async function deleteProduct(p: Product) {
    if (!confirm(`Xóa sản phẩm "${p.productName}"?`)) return;

    await apiFetchAuth("/api/admin/products", {
      method: "DELETE",
      body: { id: p.id },
    });

    setProducts((prev) => prev.filter((x) => x.id !== p.id));
  }

  if (loading) return <div className="p-4">Đang tải...</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm sản phẩm"
            className="input w-full pl-9"
          />
        </div>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="input"
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortValue)}
          className="input"
        >
          <option value="created_desc">Mới nhất</option>
          <option value="name_asc">Tên A → Z</option>
          <option value="name_desc">Tên Z → A</option>
          <option value="price_asc">Giá thấp → cao</option>
          <option value="price_desc">Giá cao → thấp</option>
        </select>

        <button
          onClick={() => setCreating(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Thêm
        </button>
      </div>

      {/* =====================
          TABLE
      ====================== */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Tên</th>
              <th className="p-3">Danh mục</th>
              <th className="p-3">Giá</th>
              <th className="p-3">Điểm</th>
              <th className="p-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.productName}</td>
                <td className="p-3">{p.category.name}</td>
                <td className="p-3">{p.currentPrice.toLocaleString()}₫</td>
                <td className="p-3">{p.pointValue}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => setEditing(p)} className="icon-btn">
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteProduct(p)}
                    className="icon-btn text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Không có sản phẩm
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <ProductForm
          title={creating ? "Thêm sản phẩm" : "Chỉnh sửa sản phẩm"}
          product={editing}
          categories={categories}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={(data) =>
            editing ? updateProduct(editing.id, data) : createProduct(data)
          }
        />
      )}
    </div>
  );
}

/* =====================
   PRODUCT FORM (MODAL)
====================== */

function ProductForm({
  title,
  product,
  categories,
  onClose,
  onSave,
}: {
  title: string;
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
}) {
  const [productName, setProductName] = useState(product?.productName || "");
  const [currentPrice, setCurrentPrice] = useState(product?.currentPrice || 0);
  const [pointValue, setPointValue] = useState(product?.pointValue || 0);
  const [categoryId, setCategoryId] = useState(
    product?.category.id || categories[0]?.id
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 w-full max-w-md space-y-4">
        <div className="font-semibold text-lg">{title}</div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Tên sản phẩm
          </label>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Ví dụ: Gas SP 12kg"
            className="input w-full"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Giá bán (₫)
          </label>
          <input
            type="number"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(Number(e.target.value))}
            placeholder="Ví dụ: 450000"
            className="input w-full"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Điểm tích lũy
          </label>
          <input
            type="number"
            value={pointValue}
            onChange={(e) => setPointValue(Number(e.target.value))}
            placeholder="0 nếu không đổi điểm"
            className="input w-full"
          />
          <p className="text-xs text-gray-500">
            &gt; 0 sẽ tự động gắn tag <b>POINTS_EXCHANGABLE</b>
          </p>
        </div>

        {/* Danh mục */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Danh mục</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input w-full"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary">
            Hủy
          </button>
          <button
            onClick={() =>
              onSave({
                productName,
                currentPrice,
                pointValue,
                categoryId,
              })
            }
            className="btn-primary"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
