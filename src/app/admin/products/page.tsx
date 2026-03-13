"use client";

import { useEffect, useState } from "react";
import { apiFetchAuth } from "@/lib/api/apiClient";

import ProductFilterBar from "@/components/admin/products/ProductFilterBar";
import ProductTable from "@/components/admin/products/ProductTable";

import {
  CategoryOption,
  ProductFilters,
  ProductWithCategory,
} from "@/components/admin/products/types";
import ProductCardList from "@/components/admin/products/ProductCardList";
import ProductDrawerForm from "@/components/admin/products/ProductDrawerForm";
import {
  AdminPageHeader,
  AdminRefreshButton,
  AdminSectionCard,
} from "@/components/admin/AdminPageKit";

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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [editingProduct, setEditingProduct] =
    useState<ProductWithCategory | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.categoryId !== "all") params.set("categoryId", filters.categoryId);
      if (filters.tags.length) params.set("tags", filters.tags.join(","));
      params.set("sort", filters.sort);
      params.set("order", filters.order);
      params.set("page", String(filters.page));
      params.set("pageSize", String(filters.pageSize));
      const res = await apiFetchAuth(`/api/admin/products?${params.toString()}`);
      setProducts(res.products || []);
    } catch (error) {
      console.error("Fetch products error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    apiFetchAuth<{ categories: CategoryOption[] }>("/api/admin/categories")
      .then((res) => setCategories(res.categories))
      .catch(console.error);
  }, []);

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
    await apiFetchAuth(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  return (
    <div className="space-y-4 p-[2vw] md:p-[4vw]">
      <AdminPageHeader
        title="Sản phẩm"
        description="Quản lý danh sách sản phẩm với giao diện đồng nhất admin."
        actions={<AdminRefreshButton onClick={fetchProducts} loading={loading} />}
      />

      <AdminSectionCard>
        <ProductFilterBar
          filters={filters}
          categories={categories}
          onChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))}
          onAdd={handleCreate}
        />
      </AdminSectionCard>

      <div className="hidden md:block">
        <ProductTable products={products} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <div className="md:hidden">
        <ProductCardList products={products} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <ProductDrawerForm
        open={drawerOpen}
        product={editingProduct}
        onOpenChange={() => setDrawerOpen(false)}
        onSuccess={() => {
          setDrawerOpen(false);
          setEditingProduct(null);
          fetchProducts();
        }}
        categories={categories}
      />
    </div>
  );
}
