"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetchAuth } from "@/lib/api/apiClient";

import ProductFilterBar from "@/components/admin/products/ProductFilterBar";
import ProductTable from "@/components/admin/products/ProductTable";

import {
  ProductFilters,
  ProductWithCategory,
} from "@/components/admin/products/types";
import ProductCardList from "@/components/admin/products/ProductCardList";
import ProductDrawerForm from "@/components/admin/products/ProductDrawerForm";
import { Category } from "@prisma/client";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    categoryId: "all",
    tags: [],
    sort: "createdAt",
    order: "desc",
    page: 1,
    pageSize: 20,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingProduct, setEditingProduct] =
    useState<ProductWithCategory | null>(null);

  /* =============================
     FETCH PRODUCTS
  ============================== */

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (filters.search) params.set("search", filters.search);
      if (filters.categoryId !== "all")
        params.set("categoryId", filters.categoryId);

      if (filters.tags.length) params.set("tags", filters.tags.join(","));

      params.set("sort", filters.sort);
      params.set("order", filters.order);
      params.set("page", String(filters.page));
      params.set("pageSize", String(filters.pageSize));

      const res = await apiFetchAuth(
        `/api/admin/products?${params.toString()}`,
      );

      setProducts(res.products);
      setPagination(res.pagination);
    } catch (error) {
      console.error("Fetch products error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =============================
     HANDLERS
  ============================== */

  const handleCreate = () => {
    setEditingProduct(null);
    setDrawerOpen(true);
  };

  const handleEdit = (product: ProductWithCategory) => {
    setEditingProduct(product);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa sản phẩm này → không thể hoàn tác?")) return;

    await apiFetchAuth(`/api/admin/products/${id}`, {
      method: "DELETE",
    });

    fetchProducts();
  };

  const handleSaveSuccess = () => {
    setDrawerOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };
  /* =============================
       FETCH CATEGORIES
    ============================== */
  useEffect(() => {
    apiFetchAuth<{ categories: Category[] }>("/api/admin/categories")
      .then((res) => setCategories(res.categories))
      .catch(console.error);
  }, []);

  /* =============================
     RENDER
  ============================== */

  return (
    <div className="p-4 space-y-4">
      {/* FILTER BAR */}
      <ProductFilterBar
        filters={filters}
        categories={categories}
        onChange={(newFilters) =>
          setFilters((prev) => ({
            ...prev,
            ...newFilters,
            page: 1, // reset page khi filter thay đổi
          }))
        }
        onAdd={handleCreate}
      />

      {/* DESKTOP TABLE */}
      <div className="hidden md:block">
        <ProductTable
          products={products}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* MOBILE CARD LIST */}
      <div className="md:hidden">
        <ProductCardList
          products={products}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* DRAWER FORM */}
      <ProductDrawerForm
        open={drawerOpen}
        product={editingProduct}
        onOpenChange={() => setDrawerOpen(false)}
        onSuccess={handleSaveSuccess}
        categories={categories}
      />

      {/* Pagination UI sẽ build sau */}
    </div>
  );
}
