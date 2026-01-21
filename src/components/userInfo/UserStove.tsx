"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { apiFetchAuthNoRedirect } from "@/lib/api/apiClient";
import { Stove, User } from "@/app/(main)/user/page";
import ConfirmModal from "../main/ConfirmModal";

type Props = {
  user: User;
  onChange: (u: Partial<User>) => void;
};

const EMPTY_STOVE: Stove = {
  id: "",
  name: "",
  productId: "",
  address: "",
  note: "",
};

export default function UserStove({ user, onChange }: Props) {
  const [editingStove, setEditingStove] = useState<Stove | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [products, setProducts] = useState<
    { id: string; productName: string }[]
  >([]);

  const canDelete = user.stoves.length > 1;
  const isEdit = Boolean(editingStove?.id);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  const saveStove = async () => {
    if (!editingStove) return;
    if (!editingStove.name || !editingStove.productId) return;

    try {
      setLoadingSave(true);

      if (isEdit) {
        // UPDATE
        const updated: Stove = await apiFetchAuthNoRedirect(
          `/api/user/stoves/${editingStove.id}`,
          {
            method: "PUT",
            body: editingStove,
          },
        );

        onChange({
          stoves: user.stoves.map((s) => (s.id === updated.id ? updated : s)),
        });
      } else {
        // CREATE
        const created: Stove = await apiFetchAuthNoRedirect(
          "/api/user/stoves",
          {
            method: "POST",
            body: editingStove,
          },
        );

        onChange({ stoves: [...user.stoves, created] });
      }

      setEditingStove(null);
    } catch (e: any) {
      alert(e.message || "Không thể lưu bếp");
    } finally {
      setLoadingSave(false);
    }
  };

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    if (!confirmDeleteId) return;

    try {
      setLoadingDelete(true);

      await apiFetchAuthNoRedirect(`/api/user/stoves/${confirmDeleteId}`, {
        method: "DELETE",
      });

      onChange({
        stoves: user.stoves.filter((s) => s.id !== confirmDeleteId),
      });

      setConfirmDeleteId(null);
    } catch (e: any) {
      alert(e.message || "Không thể xóa bếp");
    } finally {
      setLoadingDelete(false);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow">
        <div className="flex justify-between mb-3">
          <div className="font-semibold">Bếp</div>
          <button
            onClick={() => setEditingStove({ ...EMPTY_STOVE })}
            className="text-green-600"
          >
            <Plus />
          </button>
        </div>

        {user.stoves.map((s) => (
          <div
            key={s.id}
            className="flex justify-between items-center border rounded-xl p-3 mb-2"
          >
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-gray-500">{s.address}</div>
            </div>

            <div className="flex gap-3">
              {/* EDIT */}
              <button
                onClick={() => setEditingStove({ ...s })}
                className="text-gray-500 hover:text-green-600"
                title="Sửa bếp"
              >
                <Pencil size={18} />
              </button>

              {/* DELETE */}
              <button
                disabled={!canDelete}
                title={canDelete ? "Xóa bếp" : "Phải có ít nhất 1 bếp"}
                onClick={() => {
                  if (!canDelete) return;
                  setConfirmDeleteId(s.id);
                }}
                className={`${
                  canDelete
                    ? "text-red-500 hover:opacity-80"
                    : "text-gray-300 cursor-not-allowed"
                }`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= ADD / EDIT MODAL ================= */}
      {editingStove && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center px-[5vw]">
          <div className="bg-white w-full rounded-2xl p-4 space-y-4">
            <div className="font-semibold text-lg">
              {isEdit ? "Sửa bếp" : "Thêm bếp mới"}
            </div>

            <input
              className="w-full border rounded-xl p-2"
              placeholder="Tên bếp"
              value={editingStove.name}
              onChange={(e) =>
                setEditingStove({
                  ...editingStove,
                  name: e.target.value,
                })
              }
            />

            <input
              className="w-full border rounded-xl p-2"
              placeholder="Địa chỉ"
              value={editingStove.address}
              onChange={(e) =>
                setEditingStove({
                  ...editingStove,
                  address: e.target.value,
                })
              }
            />

            <select
              className="w-full border rounded-xl p-2"
              value={editingStove.productId}
              onChange={(e) =>
                setEditingStove({
                  ...editingStove,
                  productId: e.target.value,
                })
              }
            >
              <option value="">Chọn loại gas</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                className="flex-1 border rounded-xl py-2"
                onClick={() => setEditingStove(null)}
              >
                Hủy
              </button>
              <button
                className="flex-1 bg-green-600 text-white rounded-xl py-2 disabled:opacity-50"
                disabled={loadingSave}
                onClick={saveStove}
              >
                {loadingSave ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONFIRM DELETE ================= */}
      {confirmDeleteId && (
        <ConfirmModal
          title="Xóa bếp"
          description="Bạn có chắc chắn muốn xóa bếp này không?"
          confirmText="Xóa"
          cancelText="Hủy"
          loading={loadingDelete}
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
