"use client";

import { ReactNode, useEffect, useState } from "react";
import { Search, Plus, Tags } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const selectedTags = filters.tags ?? [];

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2 md:flex md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1">
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
            <SelectTrigger className="w-fit min-w-27.5 md:w-48">
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
            <SelectTrigger className="w-fit min-w-27.5 md:w-44">
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
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 justify-start md:w-fit md:flex-none"
              >
                <Tags className="mr-2 h-4 w-4" />
                Thẻ{selectedTags.length > 0 ? ` (${selectedTags.length})` : ""}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-56">
              {PRODUCT_TAGS.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => toggleTag(tag)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ml-auto flex items-center gap-2">
            {actions}

            <Button
              onClick={onAdd}
              className="min-w-9 px-2 sm:px-3 bg-black text-white"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Thêm sản phẩm</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
