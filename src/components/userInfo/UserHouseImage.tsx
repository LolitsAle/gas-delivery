"use client";

import { useRef, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { User } from "@/app/(main)/user/page";
import { apiFetchAuthNoRedirect } from "@/lib/api/apiClient";
import Image from "next/image";

type Props = {
  user: User;
  onChange: (u: Partial<User>) => void;
};

const MAX_IMAGES = 5;

export default function UserHouseImage({ user, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const triggerPick = () => {
    if (user.houseImage.length >= MAX_IMAGES) return;
    fileInputRef.current?.click();
  };

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";

    if (!files.length) return;

    if (user.houseImage.length + files.length > MAX_IMAGES) {
      alert("Tối đa 5 ảnh");
      return;
    }

    try {
      setUploading(true);

      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));

      const res = await apiFetchAuthNoRedirect("/api/user/upload", {
        method: "POST",
        body: fd,
      });

      onChange({
        houseImage: [...user.houseImage, ...res.images],
      });
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (img: string) => {
    try {
      setDeleting(img);

      const res = await apiFetchAuthNoRedirect("/api/user/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: { imageUrl: img },
      });

      if (!res) throw new Error();

      onChange({
        houseImage: user.houseImage.filter((i) => i !== img),
      });
    } catch {
      alert("Xoá ảnh thất bại");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      <div className="flex justify-between mb-3 items-center">
        <div className="font-semibold">
          Ảnh nhà ({user.houseImage.length}/{MAX_IMAGES})
        </div>

        <button
          onClick={triggerPick}
          disabled={uploading || user.houseImage.length >= MAX_IMAGES}
          className="text-green-600 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="animate-spin" /> : <Plus />}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={onSelect}
      />

      <div className="grid grid-cols-3 gap-2">
        {user.houseImage.map((img) => (
          <div key={img} className="relative">
            <Image
              alt=""
              src={img}
              className="h-24 w-full rounded-xl object-cover"
            />

            <button
              onClick={() => removeImage(img)}
              disabled={deleting === img}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow disabled:opacity-50"
            >
              {deleting === img ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
