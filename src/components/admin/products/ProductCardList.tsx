"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ProductWithCategory } from "./types";
import { r2Url } from "@/lib/helper/helpers";
import {
  AdminEmptyState,
  AdminSectionCard,
} from "@/components/admin/AdminPageKit";

type ProductCardListProps = {
  products: ProductWithCategory[];
  loading?: boolean;
  onEdit?: (product: ProductWithCategory) => void;
  onDelete?: (id: string) => void;
};

export default function ProductCardList({ products, loading, onEdit, onDelete }: ProductCardListProps) {
  if (loading) return <AdminSectionCard>Đang tải dữ liệu...</AdminSectionCard>;
  if (!products?.length) return <AdminEmptyState title="Không có sản phẩm nào." />;

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <AdminSectionCard key={product.id} className="space-y-3">
          <div className="flex gap-3">
            {product.previewImageUrl ? (
              <Image
                src={r2Url(product.previewImageUrl)}
                alt={product.productName}
                width={72}
                height={72}
                className="aspect-square shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="h-18 w-18 rounded-lg bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{product.productName}</p>
              <p className="text-sm text-muted-foreground">{product.category?.name || "-"}</p>
              <p className="text-sm">{product.currentPrice.toLocaleString()}đ</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {product.tags?.length ? (
              product.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">Không có tag</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit?.(product)}>
              Sửa
            </Button>
            <Button size="sm" variant="destructive" className="flex-1" onClick={() => onDelete?.(product.id)}>
              Xóa
            </Button>
          </div>
        </AdminSectionCard>
      ))}
    </div>
  );
}
