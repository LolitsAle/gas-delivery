"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { ProductWithCategory } from "./types";
import { r2Url } from "@/lib/helper/helpers";

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
  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Không có sản phẩm nào.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <Card key={product.id} className="rounded-2xl shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-3">
              {product.previewImageUrl ? (
                <Image
                  src={r2Url(product.previewImageUrl)}
                  alt={product.productName}
                  width={80}
                  height={80}
                  className="rounded-xl object-cover aspect-square shrink-0"
                />
              ) : (
                <div className="w-20 h-20 bg-muted rounded-xl" />
              )}

              <div className="flex-1 space-y-1">
                <div className="font-semibold text-base">
                  {product.productName}
                </div>

                <div className="text-sm text-muted-foreground">
                  Danh mục: {product.category?.name || "-"}
                </div>

                <div className="text-sm">
                  Giá:{" "}
                  <span className="font-medium">
                    {product.currentPrice.toLocaleString()}đ
                  </span>
                </div>

                <div className="text-sm">
                  Điểm:{" "}
                  <span className="font-medium">
                    {product.pointValue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {product.tags.length > 0 ? (
                product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  Không có tag
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => onEdit?.(product)}
              >
                Sửa
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                onClick={() => onDelete?.(product.id)}
              >
                Xoá
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
