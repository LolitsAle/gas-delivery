"use client";

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Category, ProductTag } from "@prisma/client";
import { ProductFilters } from "./types";

interface Props {
  filters: ProductFilters;
  onChange: (filters: Partial<ProductFilters>) => void;
  onAdd: () => void;
  categories: Category[];
}

export default function ProductFilterBar({
  filters,
  onChange,
  onAdd,
  categories,
}: Props) {
  const [searchValue, setSearchValue] = useState(filters.search ?? "");

  /* =============================
     SYNC SEARCH FROM PARENT
  ============================== */
  useEffect(() => {
    setSearchValue(filters.search ?? "");
  }, [filters.search]);

  /* =============================
     DEBOUNCE SEARCH
  ============================== */
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange({ search: searchValue });
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchValue, onChange]);

  /* =============================
     TAG TOGGLE
  ============================== */
  const toggleTag = (tag: ProductTag) => {
    const currentTags = filters.tags ?? [];
    const exists = currentTags.includes(tag);

    if (exists) {
      onChange({
        tags: currentTags.filter((t) => t !== tag),
      });
    } else {
      onChange({
        tags: [...currentTags, tag],
      });
    }
  };

  /* =============================
     RENDER
  ============================== */

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        {/* SEARCH */}
        <div className="relative flex-1 min-w-50">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Tìm sản phẩm..."
            className="input w-full pl-9"
          />
        </div>

        {/* CATEGORY */}
        <select
          value={filters.categoryId ?? "all"}
          onChange={(e) =>
            onChange({
              categoryId: e.target.value,
            })
          }
          className="input"
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* SORT */}
        <select
          value={`${filters.sort}_${filters.order}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split("_");
            onChange({
              sort: sort as ProductFilters["sort"],
              order: order as "asc" | "desc",
            });
          }}
          className="input"
        >
          <option value="createdAt_desc">Mới nhất</option>
          <option value="productName_asc">Tên A → Z</option>
          <option value="productName_desc">Tên Z → A</option>
          <option value="currentPrice_asc">Giá thấp → cao</option>
          <option value="currentPrice_desc">Giá cao → thấp</option>
        </select>

        {/* ADD BUTTON */}
        <button onClick={onAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Thêm
        </button>
      </div>

      {/* TAG FILTER */}
      <div className="flex flex-wrap gap-2">
        {Object.values(ProductTag).map((tag) => {
          const active = (filters.tags ?? []).includes(tag);

          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-xs border transition
                ${
                  active
                    ? "bg-black text-white border-black"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
