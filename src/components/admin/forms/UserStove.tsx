"use client";

import { useState } from "react";
import { X, Plus, Pencil, Trash } from "lucide-react";
import UserStoveForm from "./UserStoveForm";
import { UserWithStoves } from "@/app/admin/users/page";
import { Stove } from "@prisma/client";
interface StoveWithProduct extends Stove {
  product: {
    id: string;
    productName: string;
  } | null;
}

interface UserStoveModalProps {
  user: {
    id: string;
    stoves: StoveWithProduct[];
  };
  mobile: boolean;
  onClose: () => void;

  onCreate: (data: Partial<Stove>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Stove>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function UserStoveModal({
  user,
  mobile,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: UserStoveModalProps) {
  const [editing, setEditing] = useState<StoveWithProduct | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <>
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
          {/* HEADER */}
          <div className="flex justify-between mb-3">
            <h2 className="font-semibold">Danh sách bếp</h2>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          {/* CREATE */}
          <button
            onClick={() => setCreating(true)}
            className="w-full h-10 rounded-xl bg-black text-white flex items-center justify-center gap-2 mb-3"
          >
            <Plus size={16} /> Thêm bếp
          </button>

          {/* LIST */}
          <div className="space-y-2">
            {user.stoves.map((s) => (
              <div
                key={s.id}
                className="border rounded-xl p-3 flex justify-between gap-3"
              >
                <div className="space-y-1 text-sm">
                  <div className="font-medium">{s.name || "Bếp không tên"}</div>

                  <div className="text-gray-600">
                    🔥 {s.product?.productName || "Chưa gán gas"}
                  </div>

                  <div className="text-gray-600 truncate">📍 {s.address}</div>

                  {s.note && (
                    <div className="text-gray-500 italic">“{s.note}”</div>
                  )}

                  <div className="text-xs text-gray-500">
                    🖼️ {s.houseImageCount} ảnh
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={() => setEditing(s)}>
                    <Pencil size={16} />
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => onDelete(s.id)}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}

            {user.stoves.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-6">
                Người dùng chưa có bếp
              </div>
            )}
          </div>
        </div>
      </div>

      {(creating || editing) && (
        <UserStoveForm
          userId={user.id}
          stove={editing}
          mobile={mobile}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={async (data) => {
            if (editing) {
              await onUpdate(editing.id, data);
            } else {
              await onCreate(data);
            }
          }}
        />
      )}
    </>
  );
}
