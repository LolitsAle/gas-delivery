"use client";

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import type { ProductTag } from "@/lib/types/promotion";
import { PRODUCT_TAGS } from "@/lib/types/promotion";
import { CategoryOption, ProductFilters } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReactNode } from "react";

interface Props {
  filters: ProductFilters;
  onChange: (filters: Partial<ProductFilters>) => void;
  onAdd: () => void;
  categories: CategoryOption[];
  actions?: ReactNode;
}

export default function ProductFilterBar({
  filters,
  onChange,
  onAdd,
  categories,
  actions,
}: Props) {
  const [searchValue, setSearchValue] = useState(filters.search ?? "");

  useEffect(() => {
    setSearchValue(filters.search ?? "");
  }, [filters.search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange({ search: searchValue });
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchValue, onChange]);

  const toggleTag = (tag: ProductTag) => {
    const currentTags = filters.tags ?? [];
    onChange({
      tags: currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag],
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Tìm sản phẩm..."
            className="pl-9"
          />
        </div>

        <Select
          value={filters.categoryId ?? "all"}
          onValueChange={(value) => onChange({ categoryId: value })}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={`${filters.sort}_${filters.order}`}
          onValueChange={(value) => {
            const [sort, order] = value.split("_");
            onChange({
              sort: sort as ProductFilters["sort"],
              order: order as "asc" | "desc",
            });
          }}
        >
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt_desc">Mới nhất</SelectItem>
            <SelectItem value="productName_asc">Tên A → Z</SelectItem>
            <SelectItem value="productName_desc">Tên Z → A</SelectItem>
            <SelectItem value="currentPrice_asc">Giá thấp → cao</SelectItem>
            <SelectItem value="currentPrice_desc">Giá cao → thấp</SelectItem>
          </SelectContent>
        </Select>

        {actions}

        <Button onClick={onAdd}>
          <Plus size={16} className="mr-2" />
          Thêm
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRODUCT_TAGS.map((tag) => {
          const active = (filters.tags ?? []).includes(tag);

          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                active
                  ? "border-black bg-black text-white"
                  : "border-gray-300 bg-white hover:bg-gray-100"
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
