"use client";

import { Label } from "@/components/ui/label";
import Image from "next/image";
import { X, Plus } from "lucide-react";
import { useRef } from "react";
import { showToastError } from "@/lib/helper/toast";
import { r2Url } from "@/lib/helper/helpers";

const MAX_IMAGES = 5;

export default function TabImages({ form, setForm }: any) {
  const inputRef = useRef<HTMLInputElement>(null);

  const existingImages: string[] = form.houseImages || [];
  const newImages: File[] = form.newHouseImages || [];

  const totalCount = existingImages.length + newImages.length;

  /* ================= ADD FILES ================= */
  const handleSelectFiles = (files: FileList) => {
    const selected = Array.from(files);

    if (totalCount + selected.length > MAX_IMAGES) {
      showToastError("Mỗi bếp tối đa 5 ảnh");
      return;
    }

    setForm((f: any) => ({
      ...f,
      newHouseImages: [...(f.newHouseImages || []), ...selected],
    }));
  };

  /* ================= REMOVE OLD ================= */
  const removeExistingImage = (key: string) => {
    setForm((f: any) => ({
      ...f,
      houseImages: f.houseImages.filter((img: string) => img !== key),
      removedHouseImages: [...(f.removedHouseImages || []), key],
    }));
  };

  /* ================= REMOVE NEW ================= */
  const removeNewImage = (index: number) => {
    setForm((f: any) => {
      const updated = [...(f.newHouseImages || [])];
      updated.splice(index, 1);
      return { ...f, newHouseImages: updated };
    });
  };

  return (
    <div className="space-y-3">
      <Label>
        Hình ảnh nhà ({totalCount}/{MAX_IMAGES})
      </Label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) handleSelectFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="grid grid-cols-3 gap-3 mt-2">
        {/* ===== ẢNH CŨ ===== */}
        {existingImages.map((key) => {
          console.log(key);
          return (
            <div key={key} className="relative aspect-square">
              <Image
                loader={() => r2Url(key)}
                src={r2Url(key)}
                alt="house"
                fill
                className="object-cover rounded-xl border"
              />
              <button
                type="button"
                onClick={() => removeExistingImage(key)}
                className="absolute top-1 left-1 bg-black/60 text-white p-1 rounded-full"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}

        {/* ===== ẢNH MỚI ===== */}
        {newImages.map((file, index) => (
          <div key={index} className="relative aspect-square">
            <Image
              src={URL.createObjectURL(file)}
              alt="house"
              fill
              className="object-cover rounded-xl border"
            />
            <button
              type="button"
              onClick={() => removeNewImage(index)}
              className="absolute top-1 left-1 bg-black/60 text-white p-1 rounded-full"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {/* ===== BUTTON ADD ===== */}
        {totalCount < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50"
          >
            <Plus size={28} />
          </button>
        )}
      </div>
    </div>
  );
}
