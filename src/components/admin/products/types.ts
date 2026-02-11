import { Category, ProductTag } from "@prisma/client";

import { Product } from "@prisma/client";

export type ProductWithCategory = Product & {
  category: Category;
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
