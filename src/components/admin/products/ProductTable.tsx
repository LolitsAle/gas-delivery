"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ProductWithCategory } from "./types";
import { r2Url } from "@/lib/helper/helpers";

type ProductTableProps = {
  products: ProductWithCategory[];
  loading?: boolean;
  onEdit?: (product: ProductWithCategory) => void;
  onDelete?: (id: string) => void;
};

export default function ProductTable({
  products,
  loading,
  onEdit,
  onDelete,
}: ProductTableProps) {
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
    <div className="w-full">
      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3">Ảnh</th>
              <th className="text-left px-4 py-3">Tên sản phẩm</th>
              <th className="text-left px-4 py-3">Danh mục</th>
              <th className="text-left px-4 py-3">Giá</th>
              <th className="text-left px-4 py-3">Điểm</th>
              <th className="text-left px-4 py-3">Tags</th>
              <th className="text-left px-4 py-3">Ngày tạo</th>
              <th className="text-right px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-t hover:bg-muted/50 transition"
              >
                <td className="px-4 py-3">
                  {product.previewImageUrl ? (
                    <Image
                      src={r2Url(product.previewImageUrl)}
                      alt={product.productName}
                      width={50}
                      height={50}
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-12.5 h-12.5 bg-muted rounded-md" />
                  )}
                </td>

                <td className="px-4 py-3 font-medium">{product.productName}</td>

                <td className="px-4 py-3">{product.category?.name || "-"}</td>

                <td className="px-4 py-3">
                  {product.currentPrice.toLocaleString()}đ
                </td>

                <td className="px-4 py-3">
                  {product.pointValue.toLocaleString()} điểm
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {product.tags.length > 0 ? (
                      product.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3">
                  {new Date(product.createdAt).toLocaleDateString("vi-VN")}
                </td>

                <td className="px-4 py-3 text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit?.(product)}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete?.(product.id)}
                  >
                    Xoá
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
