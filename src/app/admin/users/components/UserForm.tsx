"use client";

import { useState } from "react";
import { X, ImagePlus, Trash2 } from "lucide-react";
import { User } from "../constants";

interface Props {
  title: string;
  user?: User | null;
  mobile: boolean;
  onClose: () => void;
  onSave: (data: Partial<User>) => Promise<void> | void;
}

export default function UserForm({
  title,
  user,
  mobile,
  onClose,
  onSave,
}: Props) {
  /* =====================
      STATE
  ====================== */
  const [form, setForm] = useState({
    nickname: user?.nickname || "",
    phoneNumber: user?.phoneNumber || "",
    role: user?.role || "USER",
    address: user?.address || "",
    addressNote: user?.addressNote || "",
    houseImage: (user?.houseImage || []) as string[], // ảnh đã có
  });

  const [newHouseImages, setNewHouseImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  /* =====================
      UPLOAD
  ====================== */
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/house-image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    return data.path as string;
  };

  /* =====================
      IMAGE SELECT
  ====================== */
  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const total = form.houseImage.length + newHouseImages.length + files.length;

    if (total > 3) {
      alert("Tối đa 3 ảnh nhà");
      return;
    }

    setNewHouseImages((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeOldImage = (index: number) => {
    setForm({
      ...form,
      houseImage: form.houseImage.filter((_, i) => i !== index),
    });
  };

  const removeNewImage = (index: number) => {
    setNewHouseImages((prev) => prev.filter((_, i) => i !== index));
  };

  /* =====================
      SAVE
  ====================== */
  const handleSave = async () => {
    try {
      setLoading(true);

      let uploadedImages: string[] = [];

      if (newHouseImages.length) {
        uploadedImages = await Promise.all(newHouseImages.map(uploadImage));
      }

      await onSave({
        ...form,
        houseImage: [...form.houseImage, ...uploadedImages],
      });

      onClose();
    } catch {
      alert("Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const totalImages = form.houseImage.length + newHouseImages.length;

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
        {/* ================= HEADER ================= */}
        <div className="flex justify-between mb-3">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* ================= FORM ================= */}
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

          {/* ================= HOUSE IMAGE ================= */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Ảnh nhà ({totalImages}/3)
              </span>

              {totalImages < 3 && (
                <label className="cursor-pointer flex items-center gap-1 text-sm text-blue-600">
                  <ImagePlus size={16} />
                  Chọn ảnh
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    multiple
                    onChange={handleSelectImage}
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* ảnh cũ */}
              {form.houseImage.map((img, idx) => (
                <div key={img} className="relative">
                  <img
                    src={img}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    onClick={() => removeOldImage(idx)}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {/* ảnh mới */}
              {newHouseImages.map((file, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    onClick={() => removeNewImage(idx)}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= ACTION ================= */}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-60"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
