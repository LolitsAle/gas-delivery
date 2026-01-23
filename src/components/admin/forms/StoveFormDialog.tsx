"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Stove } from "@prisma/client";
import { r2Url } from "@/lib/helper/helpers";
import { DialogDescription } from "@radix-ui/react-dialog";
import Image from "next/image";

const MAX_IMAGES = 5;

type Props = {
  open: boolean;
  stove?: Stove;
  onClose: () => void;
  onSave: (
    data: Partial<Stove>,
    newImages: File[],
    removedImages: string[],
  ) => Promise<void>;
};

export default function StoveFormDialog({
  open,
  stove,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  useEffect(() => {
    if (stove) {
      setName(stove.name ?? "");
      setAddress(stove.address ?? "");
      setNote(stove.note ?? "");
      setExistingImages(stove.houseImage ?? []);
    } else {
      setName("");
      setAddress("");
      setNote("");
      setExistingImages([]);
    }

    setNewImages([]);
    setRemovedImages([]);
  }, [stove, open]);

  function removeExistingImage(img: string) {
    setExistingImages((prev) => prev.filter((i) => i !== img));
    setRemovedImages((prev) => [...prev, img]);
  }
  function removeNewImage(index: number) {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddImages(files: FileList | null) {
    if (!files) return;

    const selected = Array.from(files);
    const total = existingImages.length + newImages.length + selected.length;

    if (total > MAX_IMAGES) {
      alert(`Chỉ được tối đa ${MAX_IMAGES} ảnh`);
      return;
    }

    setNewImages((prev) => [...prev, ...selected]);
  }

  async function handleSave() {
    await onSave({ ...stove }, newImages, removedImages);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {stove ? "✏️ Chỉnh sửa bếp" : "➕ Thêm bếp mới"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Tạo hoặc chỉnh sửa thông tin bếp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Tên bếp"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="Địa chỉ"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Textarea
            placeholder="Ghi chú"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {/* HOUSE IMAGES */}
          <div className="space-y-2">
            <div className="text-sm font-medium">
              Ảnh nhà ({existingImages.length + newImages.length}/{MAX_IMAGES})
            </div>

            {(existingImages.length > 0 || newImages.length > 0) && (
              <div className="grid grid-cols-3 gap-2">
                {/* Existing images */}
                {existingImages.map((img) => (
                  <div key={img} className="relative">
                    <Image
                      alt=""
                      src={r2Url(img)}
                      className="h-24 w-full rounded-md object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                      onClick={() => removeExistingImage(img)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* New images preview */}
                {newImages.map((file, i) => (
                  <div key={i} className="relative">
                    <Image
                      alt=""
                      src={URL.createObjectURL(file)}
                      className="h-24 w-full rounded-md object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                      onClick={() => removeNewImage(i)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload */}
            {existingImages.length + newImages.length < MAX_IMAGES && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <Upload className="h-4 w-4" />
                Thêm ảnh
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => handleAddImages(e.target.files)}
                />
              </label>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button onClick={handleSave}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
