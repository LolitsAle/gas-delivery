"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import StoveFormDialog from "./StoveFormDialog";
import { UserWithStoves } from "../../../app/admin/users/page";
import { Stove } from "@prisma/client";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { DialogDescription } from "@radix-ui/react-dialog";
import ConfirmModal from "@/components/main/ConfirmModal";

type Props = {
  user: UserWithStoves;
  onClose: () => void;
  refreshUser: Dispatch<SetStateAction<boolean>>;
};

export default function UserStovesDialog({
  user,
  onClose,
  refreshUser,
}: Props) {
  const [stoves, setStoves] = useState<Stove[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshStove, setRefreshStove] = useState(false);

  const [editing, setEditing] = useState<Stove | null>(null);
  const [creating, setCreating] = useState(false);

  const [deleting, setDeleting] = useState<Stove | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const res = await apiFetchAuth<{ stoves: Stove[] }>(
        `/api/admin/users/${user.id}/stoves`,
      );
      if (mounted) {
        setStoves(res.stoves);
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [user.id, refreshStove]);

  async function handleSaveStove(
    stoveId: string | null,
    data: Partial<Stove>,
    newImages: File[],
    removedImages: string[],
  ) {
    if (!stoveId) return;

    let uploadedKeys: string[] = [];

    if (newImages.length > 0) {
      const presign = await apiFetchAuth<{
        uploads: { uploadUrl: string; publicUrl: string; key: string }[];
      }>(`/api/upload/presign`, {
        method: "POST",
        body: {
          target: "stove",
          ownerId: stoveId,
          files: newImages.map((f) => ({
            mimeType: f.type,
            fileSize: f.size,
          })),
        },
      });

      await Promise.all(
        presign.uploads.map((u, i) =>
          fetch(u.uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": newImages[i].type,
            },
            body: newImages[i],
          }),
        ),
      );

      uploadedKeys = presign.uploads.map((u) => u.key);
    }
    const existingImages = data.houseImage ?? [];
    console.log("existingImages", existingImages);

    const finalImages = existingImages
      .filter((img) => !removedImages.includes(img))
      .concat(uploadedKeys);
    await apiFetchAuth<{ stove: Stove }>(`/api/admin/stoves/${stoveId}`, {
      method: "PUT",
      body: {
        ...data,
        userId: user.id,
        houseImage: finalImages,
        houseImageCount: finalImages.length,
      },
    });

    refreshUser((prev) => !prev);
    setRefreshStove((prev) => !prev);
  }

  async function handleDeleteStove() {
    if (!deleting) return;

    try {
      setDeletingLoading(true);

      await apiFetchAuth(`/api/admin/stoves/${deleting.id}`, {
        method: "DELETE",
      });

      setDeleting(null);
      refreshUser((p) => !p);
      setRefreshStove((p) => !p);
    } finally {
      setDeletingLoading(false);
    }
  }

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>🔥 Bếp của {user.nickname}</DialogTitle>
            <DialogDescription className="sr-only">
              Tạo hoặc chỉnh sửa thông tin bếp
            </DialogDescription>
          </DialogHeader>

          {loading && (
            <div className="text-sm text-muted-foreground">Đang tải...</div>
          )}

          {!loading &&
            stoves.map((stove) => (
              <div
                key={stove.id}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {stove.name || "Bếp chưa đặt tên"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {stove.address}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    🖼 {stove.houseImageCount} ảnh
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditing(stove)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => setDeleting(stove)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

          <Button className="mt-4" onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm bếp
          </Button>
        </DialogContent>
      </Dialog>

      {/* CREATE */}
      {creating && (
        <StoveFormDialog
          open
          onClose={() => setCreating(false)}
          onSave={async (data, newImages, removedImages) => {
            await handleSaveStove(null, data, newImages, removedImages);
            setCreating(false);
          }}
        />
      )}

      {/* EDIT */}
      {editing && (
        <StoveFormDialog
          open
          stove={editing}
          onClose={() => setEditing(null)}
          onSave={async (data, newImages, removedImages) => {
            await handleSaveStove(editing.id, data, newImages, removedImages);
            setEditing(null);
          }}
        />
      )}

      {/* DELETE */}
      {deleting && (
        <ConfirmModal
          open={!!deleting}
          title="Xóa bếp này?"
          description={`Bếp "${deleting?.name || "Chưa đặt tên"}" sẽ bị xóa cùng toàn bộ ảnh.`}
          confirmText="Xóa bếp"
          loading={deletingLoading}
          onCancel={() => !deletingLoading && setDeleting(null)}
          onConfirm={handleDeleteStove}
        />
      )}
    </>
  );
}
