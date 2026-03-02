import type { ProductTag } from "@/lib/types/promotion";

export type CategoryOption = {
  id: string;
  name: string;
  tags?: ProductTag[];
};

export type ProductBase = {
  id: string;
  productName: string;
  currentPrice: number;
  pointValue?: number | null;
  description?: string | null;
  categoryId?: string | null;
  tags: ProductTag[];
  previewImageUrl?: string | null;
  createdAt?: string | Date;
};

export type ProductWithCategory = ProductBase & {
  category: CategoryOption;
};

export interface ProductFilters {
  search: string;
  categoryId: string;
  tags: ProductTag[];
  sort: string;
  order: "asc" | "desc";
  page: number;
  pageSize: number;
}
