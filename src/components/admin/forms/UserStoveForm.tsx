"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiFetchAuthNoRedirect } from "@/lib/api/apiClient";
import { Stove } from "@prisma/client";

type Product = { id: string; name: string };

interface StoveForm {
  id?: string;
  name: string;
  productId: string | null;
  userId: string;
  address: string;
  note: string | null;
  houseImage: string[];
  houseImageCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Props {
  userId: string;
  stove?: Stove | null;
  mobile: boolean;
  onClose: () => void;
  onSaved: (data: any) => void;
}

export default function StoveFormModal({
  userId,
  stove,
  mobile,
  onClose,
  onSaved,
}: Props) {
  const isCreate = !stove;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<StoveForm>({
    name: stove?.name || "",
    productId: stove?.productId || null,
    userId: userId,
    address: stove?.address || "",
    note: stove?.note || null,
    houseImage: stove?.houseImage || [],
    houseImageCount: stove?.houseImageCount || 0,
  });

  useEffect(() => {
    apiFetchAuthNoRedirect("/api/admin/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  const save = async () => {
    setLoading(true);

    await apiFetchAuthNoRedirect(
      isCreate
        ? `/api/admin/users/${userId}/stoves`
        : `/api/admin/stoves/${stove!.id}`,
      {
        method: isCreate ? "POST" : "PUT",
        body: JSON.stringify(form),
      },
    );

    onSaved(form);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-60 bg-black/40 flex ${
        mobile ? "items-end" : "items-center justify-center"
      }`}
    >
      <div
        className={`bg-white w-full ${
          mobile ? "rounded-t-2xl" : "rounded-xl max-w-md"
        } p-4`}
      >
        <div className="flex justify-between mb-3">
          <h2 className="font-semibold">
            {isCreate ? "Thêm bếp" : "Chỉnh sửa bếp"}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="space-y-3">
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Tên bếp"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <select
            className="w-full border px-3 py-2 rounded"
            value={form.productId || ""}
            onChange={(e) =>
              setForm({
                ...form,
                productId: e.target.value || null,
              })
            }
          >
            <option value="">— Chọn gas —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="border px-4 py-2 rounded" onClick={onClose}>
            Huỷ
          </button>
          <button
            disabled={loading}
            onClick={save}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
