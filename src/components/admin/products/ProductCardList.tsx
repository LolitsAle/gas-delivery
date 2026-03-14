"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ProductWithCategory } from "./types";
import { r2Url } from "@/lib/helper/helpers";
import {
  AdminEmptyState,
  AdminMobileCard,
  AdminSectionCard,
} from "@/components/admin/AdminPageKit";

type ProductCardListProps = {
  products: ProductWithCategory[];
  loading?: boolean;
  onEdit?: (product: ProductWithCategory) => void;
  onDelete?: (id: string) => void;
};

export default function ProductCardList({
  products,
  loading,
  onEdit,
  onDelete,
}: ProductCardListProps) {
  if (loading) return <AdminSectionCard>Đang tải dữ liệu...</AdminSectionCard>;
  if (!products?.length) return <AdminEmptyState title="Không có sản phẩm nào." />;

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <AdminMobileCard
          key={product.id}
          header={
            <div className="flex items-center gap-3">
              {product.previewImageUrl ? (
                <Image
                  src={r2Url(product.previewImageUrl)}
                  alt={product.productName}
                  width={46}
                  height={46}
                  className="h-11.5 w-11.5 rounded-md object-cover"
                />
              ) : (
                <div className="h-11.5 w-11.5 rounded-md bg-white/70" />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{product.productName}</p>
                <p className="text-xs text-muted-foreground">{product.category?.name || "-"}</p>
              </div>
            </div>
          }
          footer={
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit?.(product)}>
                Sửa
              </Button>
              <Button size="sm" variant="destructive" className="flex-1" onClick={() => onDelete?.(product.id)}>
                Xóa
              </Button>
            </div>
          }
        >
          <p className="text-sm font-medium">Giá: {product.currentPrice.toLocaleString()}đ</p>
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
        </AdminMobileCard>
      ))}
    </div>
  );
}
