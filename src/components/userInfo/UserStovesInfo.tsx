"use client";

import { useState } from "react";
import { Product, Stove } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import StoveFormDrawer from "./StoveFormDrawer";

interface StoveWithProduct extends Stove {
  product: Product;
}

interface Props {
  stoves: StoveWithProduct[];
  onChange: (stoves: Stove[]) => void;
}

export default function UserStovesInfo({ stoves, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StoveWithProduct | null>(null);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (stove: StoveWithProduct) => {
    setEditing(stove);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    const ok = confirm("Xóa bếp này? Hành động không thể hoàn tác.");
    if (!ok) return;

    onChange(stoves.filter((s) => s.id !== id));

    if (editing?.id === id) {
      setOpen(false);
      setEditing(null);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="mb-[5vw]">
        <Button
          size="sm"
          onClick={openCreate}
          className="w-full bg-gas-orange-700 text-white"
        >
          <Plus className="w-[5vw] h-[5vw] font-bold" /> Thêm bếp
        </Button>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {stoves.length === 0 && (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              Bạn chưa có bếp nào
            </CardContent>
          </Card>
        )}

        {stoves.map((stove) => (
          <Card key={stove.id}>
            <CardHeader
              className="flex flex-row items-center justify-between pb-2 bg-gas-orange-400 rounded-t-lg"
              actions={
                <div className="flex items-center justify-center gap-[2vw]">
                  <Button
                    className="shadow rounded-lg bg-white"
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(stove)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    className="shadow rounded-lg bg-red-600 text-white"
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(stove.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              }
            >
              <CardTitle className="text-base ml-[3vw]">
                🔥 {stove.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm p-[3vw] gap-[2vw] flex flex-col justify-baseline items-baseline">
              <p className="text-md">🏠 {stove.address ?? "chưa cập nhật"}</p>
              {stove.note && (
                <p className="text-muted-foreground">🗺️: {stove.note}</p>
              )}
              <div className="bg-gas-orange-100 p-[2vw] w-full rounded-md font-bold">
                📦{" "}
                {stove?.product?.productName
                  ? stove?.product?.productName
                  : "chưa chọn sản phẩm"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DRAWER COMPONENT */}
      <StoveFormDrawer open={open} onOpenChange={setOpen} stove={editing} />
    </div>
  );
}
