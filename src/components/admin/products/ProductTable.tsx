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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ProductTableProps = {
  products: ProductWithCategory[];
  loading?: boolean;
  onEdit?: (product: ProductWithCategory) => void;
  onDelete?: (id: string) => void;
};

export default function ProductTable({ products, loading, onEdit, onDelete }: ProductTableProps) {
  if (loading) return <AdminSectionCard>Đang tải dữ liệu...</AdminSectionCard>;
  if (!products?.length) return <AdminEmptyState title="Không có sản phẩm nào." />;

  return (
    <AdminSectionCard className="overflow-hidden p-0">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Ảnh</TableHead>
            <TableHead>Tên sản phẩm</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.previewImageUrl ? (
                  <Image
                    src={r2Url(product.previewImageUrl)}
                    alt={product.productName}
                    width={50}
                    height={50}
                    className="rounded-md object-cover"
                  />
                ) : (
                  <div className="h-12.5 w-12.5 rounded-md bg-muted" />
                )}
              </TableCell>
              <TableCell className="font-medium">{product.productName}</TableCell>
              <TableCell>{product.category?.name || "-"}</TableCell>
              <TableCell>{product.currentPrice.toLocaleString()}đ</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {product.tags.length > 0 ? (
                    product.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="space-x-2 text-right">
                <Button size="sm" variant="outline" onClick={() => onEdit?.(product)}>
                  Sửa
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete?.(product.id)}>
                  Xoá
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminSectionCard>
  );
}
