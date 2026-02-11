"use client";

import { useEffect, useState, useRef } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Category, Product, ProductTag } from "@prisma/client";
import { apiFetchAuth } from "@/lib/api/apiClient";
import Image from "next/image";
import { r2Url } from "@/lib/helper/helpers";
import { FieldCustomed } from "@/components/common/FieldCustom";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: () => void;
  categories: Category[];
}

export default function ProductDrawerForm({
  open,
  onOpenChange,
  product,
  onSuccess,
  categories,
}: Props) {
  const isEdit = !!product;
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<Partial<Product>>({
    productName: "",
    currentPrice: 0,
    pointValue: 0,
    description: "",
    categoryId: "",
    tags: [],
    previewImageUrl: null,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= INIT ================= */
  useEffect(() => {
    if (product) {
      setForm(product);
      setPreviewUrl(product.previewImageUrl ?? null);
      setImageFile(null);
    } else {
      setForm({
        productName: "",
        currentPrice: 0,
        pointValue: 0,
        description: "",
        categoryId: "",
        tags: [],
        previewImageUrl: null,
      });
      setPreviewUrl(null);
      setImageFile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* ================= IMAGE ================= */
  const handleImageChange = (file: File) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const openFilePicker = () => {
    fileRef.current?.click();
  };

  /* ================= TAG ================= */
  const toggleTag = (tag: ProductTag) => {
    const exists = form.tags?.includes(tag);

    if (exists) {
      setForm({
        ...form,
        tags: form.tags?.filter((t) => t !== tag),
      });
    } else {
      setForm({
        ...form,
        tags: [...(form.tags || []), tag],
      });
    }
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    try {
      setLoading(true);
      let finalImageUrl = form.previewImageUrl ?? null;
      if (imageFile) {
        const presign = await apiFetchAuth<{
          uploads: { uploadUrl: string; key: string }[];
        }>(`/api/upload/presign`, {
          method: "POST",
          body: {
            target: "product",
            ownerId: product?.id ?? "new",
            files: [
              {
                mimeType: imageFile.type,
                fileSize: imageFile.size,
              },
            ],
          },
        });
        const upload = presign.uploads[0];
        await fetch(upload.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": imageFile.type,
          },
          body: imageFile,
        });
        finalImageUrl = upload.key;
      }
      const payload = {
        ...form,
        previewImageUrl: finalImageUrl,
      };
      if (isEdit) {
        await apiFetchAuth(`/api/admin/products/${product!.id}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        await apiFetchAuth(`/api/admin/products`, {
          method: "POST",
          body: payload,
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  const displayImage = imageFile
    ? previewUrl
    : previewUrl
      ? r2Url(previewUrl)
      : null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-4 max-h-[90vh] flex flex-col">
        <DrawerHeader>
          <DrawerTitle>
            {isEdit ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm"}
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pt-2">
          <FieldCustomed
            id="name"
            label="Tên sản phẩm"
            value={form.productName}
            onChange={(e) => setForm({ ...form, productName: e.target.value })}
          />

          <FieldCustomed
            id="price"
            label="Giá"
            value={form.currentPrice}
            onChange={(e) =>
              setForm({ ...form, currentPrice: Number(e.target.value) })
            }
          />

          <FieldCustomed
            id="points"
            label="Điểm"
            value={form.pointValue}
            onChange={(e) =>
              setForm({ ...form, pointValue: Number(e.target.value) })
            }
          />

          <FieldCustomed
            as="textarea"
            id="description"
            label="Mô tả"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* CATEGORY */}
          <div>
            <label className="text-sm font-medium">Danh mục</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="input w-full mt-1"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* TAGS */}
          <div>
            <div className="text-sm font-medium mb-1">Tags</div>
            <div className="flex flex-wrap gap-2">
              {Object.values(ProductTag).map((tag) => {
                const active = form.tags?.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs border ${
                      active
                        ? "bg-black text-white border-black"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* IMAGE */}
          <div>
            <div className="text-sm font-medium mb-2">Ảnh sản phẩm</div>

            <div
              onClick={openFilePicker}
              className="relative w-full h-40 border rounded-md cursor-pointer overflow-hidden flex items-center justify-center bg-muted"
            >
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt="preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-sm text-muted-foreground">
                  Nhấn để chọn ảnh
                </span>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) =>
                e.target.files && handleImageChange(e.target.files[0])
              }
            />
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
