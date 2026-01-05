"use client";

import { useState } from "react";
import { X, ImagePlus, Trash2 } from "lucide-react";
import { User } from "../constants";

interface Props {
  title: string;
  user?: User | null;
  mobile: boolean;
  onClose: () => void;
  onSave: (data: Partial<User>) => void;
}

export default function UserForm({
  title,
  user,
  mobile,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState({
    nickname: user?.nickname || "",
    phoneNumber: user?.phoneNumber || "",
    role: user?.role || "USER",
    address: user?.address || "",
    addressNote: user?.addressNote || "",
    houseImage: user?.houseImage || ([] as string[]),
  });

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/house-image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    return data.path as string; // ví dụ: /uploads/house/xxx.webp
  };

  const handleSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (form.houseImage.length >= 3) {
      alert("Tối đa 3 ảnh nhà");
      return;
    }

    try {
      const path = await uploadImage(file);
      setForm({
        ...form,
        houseImage: [...form.houseImage, path],
      });
    } catch {
      alert("Upload ảnh thất bại");
    }
  };

  const removeImage = (index: number) => {
    setForm({
      ...form,
      houseImage: form.houseImage.filter((_, i) => i !== index),
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/40 flex ${
        mobile ? "items-end" : "items-center justify-center"
      }`}
    >
      <div
        className={`bg-white w-full ${
          mobile ? "rounded-t-2xl" : "rounded-xl max-w-lg"
        } p-4`}
      >
        <div className="flex justify-between mb-3">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="space-y-3">
          <input
            placeholder="Tên hiển thị"
            className="w-full border px-3 py-2 rounded"
            value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
          />

          <input
            placeholder="Số điện thoại"
            className="w-full border px-3 py-2 rounded"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            disabled={!!user}
          />

          <select
            className="w-full border px-3 py-2 rounded"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as any })}
          >
            <option value="USER">Người dùng</option>
            <option value="STAFF">Nhân viên</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>

          <input
            placeholder="Địa chỉ"
            className="w-full border px-3 py-2 rounded"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <input
            placeholder="Ghi chú địa chỉ"
            className="w-full border px-3 py-2 rounded"
            value={form.addressNote}
            onChange={(e) => setForm({ ...form, addressNote: e.target.value })}
          />

          {/* ========= HOUSE IMAGE UPLOAD ========= */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Ảnh nhà ({form.houseImage.length}/3)
              </span>

              {form.houseImage.length < 3 && (
                <label className="cursor-pointer flex items-center gap-1 text-sm text-blue-600">
                  <ImagePlus size={16} />
                  Thêm ảnh
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleSelectImage}
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {form.houseImage.map((img, idx) => (
                <div key={img} className="relative">
                  <img
                    src={img}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Hủy
          </button>
          <button
            onClick={() => {
              onSave(form);
              onClose();
            }}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
