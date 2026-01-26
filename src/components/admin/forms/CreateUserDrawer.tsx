"use client";

import { useState } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Field } from "../Commons";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    phoneNumber: string;
    name?: string;
    nickname?: string;
    address?: string;
    addressNote?: string;
  }) => Promise<void>;
}

export default function CreateUserDrawer({ open, onClose, onCreate }: Props) {
  const [form, setForm] = useState({
    phoneNumber: "",
    name: "",
    nickname: "",
    address: "",
    addressNote: "",
  });

  const [loading, setLoading] = useState(false);

  const update = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => setForm((p) => ({ ...p, [key]: value }));

  const handleCreate = async () => {
    try {
      setLoading(true);
      await onCreate(form);
      onClose();
    } catch {
      alert("Tạo user thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent
        className="
          h-[95vh] 
          md:h-screen md:max-w-md md:ml-auto
          flex flex-col
        "
      >
        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Tạo người dùng mới</h2>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Số điện thoại *">
              <input
                className="w-full text-sm"
                value={form.phoneNumber}
                onChange={(e) => update("phoneNumber", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tên">
              <input
                className="w-full text-sm"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </Field>

            <Field label="Biệt danh">
              <input
                className="w-full text-sm"
                value={form.nickname}
                onChange={(e) => update("nickname", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Địa chỉ">
            <input
              className="w-full text-sm"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </Field>

          <Field label="Ghi chú địa chỉ">
            <input
              className="w-full text-sm"
              value={form.addressNote}
              onChange={(e) => update("addressNote", e.target.value)}
            />
          </Field>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-white border-t px-5 py-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo user"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
