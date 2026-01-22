"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import StoveFormDialog from "./StoveFormDialog";
import { UserWithStoves } from "./page";
import { Stove } from "@prisma/client";

type Props = {
  user: UserWithStoves;
  onClose: () => void;
};

export default function UserStovesDialog({ user, onClose }: Props) {
  const [editing, setEditing] = useState<Stove | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>🔥 Bếp của {user.nickname}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {user.stoves.map((stove: Stove) => (
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

                  <Button size="icon" variant="ghost" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

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
          onSave={async (data, images) => {
            // TODO: API create stove + upload images
            console.log("CREATE", data, images);
          }}
        />
      )}

      {/* EDIT */}
      {editing && (
        <StoveFormDialog
          open
          stove={editing}
          onClose={() => setEditing(null)}
          onSave={async (data, images) => {
            // TODO: API update stove + upload images
            console.log("UPDATE", editing.id, data, images);
          }}
        />
      )}
    </>
  );
}
