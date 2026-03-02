"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type PromotionAction,
  type PromotionActionType,
  type PromotionConditionType,
} from "@prisma/client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  dismissToast,
  showToastError,
  showToastLoading,
  showToastSuccess,
} from "@/lib/helper/toast";
import { PROMOTION_CONDITION_TYPES, type PromotionFull } from "@/lib/types/promotion";

type PromotionForm = {
  name: string;
  description: string;
  startAt: string;
  endAt: string;
  isActive: boolean;
  priority: number;
  conditionType: PromotionConditionType;
  conditionValue: string;
  discountAmount: string;
  bonusPoint: string;
};

const emptyForm: PromotionForm = {
  name: "",
  description: "",
  startAt: "",
  endAt: "",
  isActive: true,
  priority: 0,
  conditionType: "PRODUCT_TAG",
  conditionValue: "BINDABLE",
  discountAmount: "",
  bonusPoint: "",
};

const toDateInputValue = (value: Date | string) => {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const toIsoFromDateInput = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
};

const getActionValue = (
  actions: PromotionAction[],
  type: PromotionActionType,
) => actions.find((item) => item.type === type)?.value;

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] =
    useState<PromotionFull | null>(null);
  const [form, setForm] = useState<PromotionForm>(emptyForm);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const res = await apiFetchAuth<{ promotions: PromotionFull[] }>(
        "/api/admin/promotions",
      );
      setPromotions(res.promotions || []);
    } catch (error) {
      console.error("Load promotions failed", error);
      showToastError("Không thể tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const openCreate = () => {
    setEditingPromotion(null);
    setForm({
      ...emptyForm,
      startAt: toDateInputValue(new Date()),
      endAt: toDateInputValue(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)),
    });
    setDialogOpen(true);
  };

  const openEdit = (promotion: PromotionFull) => {
    setEditingPromotion(promotion);
    setForm({
      name: promotion.name,
      description: promotion.description || "",
      startAt: toDateInputValue(promotion.startAt),
      endAt: toDateInputValue(promotion.endAt),
      isActive: promotion.isActive,
      priority: promotion.priority,
      conditionType: promotion.conditions[0]?.type || "PRODUCT_TAG",
      conditionValue: promotion.conditions[0]?.value || "",
      discountAmount: String(
        getActionValue(
          promotion.actions,
          "DISCOUNT_AMOUNT",
        ) || "",
      ),
      bonusPoint: String(
        getActionValue(promotion.actions, "BONUS_POINT") ||
          "",
      ),
    });
    setDialogOpen(true);
  };

  const payload = useMemo(() => {
    const actions: {
      type: PromotionActionType;
      value?: number;
      maxDiscount?: number;
    }[] = [];

    if (form.discountAmount) {
      actions.push({
        type: "DISCOUNT_AMOUNT",
        value: Number(form.discountAmount),
      });
    }

    if (form.bonusPoint) {
      actions.push({
        type: "BONUS_POINT",
        value: Number(form.bonusPoint),
      });
    }

    return {
      name: form.name,
      description: form.description,
      startAt: toIsoFromDateInput(form.startAt),
      endAt: toIsoFromDateInput(form.endAt),
      isActive: form.isActive,
      priority: Number(form.priority),
      conditions: [
        {
          type: form.conditionType,
          value: form.conditionValue || null,
        },
      ],
      actions,
    };
  }, [form]);

  const handleSave = async () => {
    if (!payload.name.trim()) {
      showToastError("Vui lòng nhập tên khuyến mãi");
      return;
    }

    if (!payload.startAt || !payload.endAt) {
      showToastError("Vui lòng nhập ngày bắt đầu và kết thúc");
      return;
    }

    const loadingId = showToastLoading("Đang lưu khuyến mãi...");
    setSaving(true);
    try {
      if (editingPromotion) {
        await apiFetchAuth(`/api/admin/promotions/${editingPromotion.id}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        await apiFetchAuth("/api/admin/promotions", {
          method: "POST",
          body: payload,
        });
      }

      dismissToast(loadingId);
      showToastSuccess("Lưu khuyến mãi thành công");
      setDialogOpen(false);
      await loadPromotions();
    } catch (error) {
      dismissToast(loadingId);
      console.error("Save promotion failed", error);
      showToastError("Lưu khuyến mãi thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (promotion: PromotionFull) => {
    if (!confirm(`Xóa khuyến mãi "${promotion.name}"?`)) return;

    const loadingId = showToastLoading("Đang xóa khuyến mãi...");
    try {
      await apiFetchAuth(`/api/admin/promotions/${promotion.id}`, {
        method: "DELETE",
      });

      dismissToast(loadingId);
      showToastSuccess("Đã xóa khuyến mãi");
      await loadPromotions();
    } catch (error) {
      dismissToast(loadingId);
      console.error("Delete promotion failed", error);
      showToastError("Xóa khuyến mãi thất bại");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Quản lý khuyến mãi</h1>
          <p className="text-sm text-muted-foreground">
            Tạo, chỉnh sửa và quản lý các chương trình khuyến mãi.
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="size-4 mr-2" />
          Thêm khuyến mãi
        </Button>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Điều kiện</TableHead>
              <TableHead>Ưu đãi</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Kích hoạt</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : promotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Chưa có khuyến mãi nào.
                </TableCell>
              </TableRow>
            ) : (
              promotions.map((promotion) => {
                const discountAmount = getActionValue(
                  promotion.actions,
                  "DISCOUNT_AMOUNT",
                );
                const bonusPoint = getActionValue(
                  promotion.actions,
                  "BONUS_POINT",
                );

                return (
                  <TableRow key={promotion.id}>
                    <TableCell>
                      <div className="font-medium">{promotion.name}</div>
                      {promotion.description && (
                        <div className="text-xs text-muted-foreground">
                          {promotion.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {promotion.conditions[0]?.type}
                      {promotion.conditions[0]?.value
                        ? `: ${promotion.conditions[0].value}`
                        : ""}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {discountAmount
                          ? `- ${discountAmount.toLocaleString()}đ`
                          : ""}
                        {discountAmount && bonusPoint ? " + " : ""}
                        {bonusPoint
                          ? `${bonusPoint.toLocaleString()} điểm`
                          : ""}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(promotion.startAt).toLocaleDateString("vi-VN")}{" "}
                      → {new Date(promotion.endAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>{promotion.isActive ? "Bật" : "Tắt"}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEdit(promotion)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(promotion)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Tên chương trình</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Mô tả</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Bắt đầu</Label>
                <Input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, startAt: e.target.value }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>Kết thúc</Label>
                <Input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, endAt: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Điều kiện</Label>
                <Select
                  value={form.conditionType}
                  onValueChange={(value: PromotionConditionType) =>
                    setForm((prev) => ({ ...prev, conditionType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROMOTION_CONDITION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Giá trị điều kiện</Label>
                <Input
                  value={form.conditionValue}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      conditionValue: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Giảm giá (VNĐ)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.discountAmount}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      discountAmount: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>Điểm thưởng</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.bonusPoint}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bonusPoint: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="active-switch">Kích hoạt</Label>
              <Switch
                id="active-switch"
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Độ ưu tiên</Label>
              <Input
                type="number"
                value={form.priority}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    priority: Number(e.target.value || 0),
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
