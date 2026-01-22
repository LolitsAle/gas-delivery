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
import { useState } from "react";
import { Stove } from "@prisma/client";

type Props = {
  open: boolean;
  stove?: Stove;
  onClose: () => void;
  onSave: (data: Partial<Stove>, images: File[]) => Promise<void>;
};

export default function StoveFormDialog({
  open,
  stove,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState(stove?.name ?? "");
  const [address, setAddress] = useState(stove?.address ?? "");
  const [note, setNote] = useState(stove?.note ?? "");
  const [images, setImages] = useState<File[]>([]);

  function removeExistingImage(index: number) {
    // API xoá ảnh sẽ xử lý sau
    stove?.houseImage.splice(index, 1);
  }

  async function handleSave() {
    await onSave({ name, address, note }, images);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {stove ? "✏️ Chỉnh sửa bếp" : "➕ Thêm bếp mới"}
          </DialogTitle>
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
            <div className="text-sm font-medium">Ảnh nhà</div>

            {/* Existing images */}
            {stove && stove?.houseImage?.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {stove.houseImage.map((img, i) => (
                  <div key={img} className="relative">
                    <img
                      src={img}
                      className="h-24 w-full rounded-md object-cover"
                    />
                    <button
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                      onClick={() => removeExistingImage(i)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload new images */}
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Upload className="h-4 w-4" />
              Thêm ảnh
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => setImages(Array.from(e.target.files ?? []))}
              />
            </label>
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
