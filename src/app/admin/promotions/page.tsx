"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
import {
  PROMOTION_ACTION,
  PROMOTION_CONDITION,
  PROMOTION_CONDITION_TYPES,
  PRODUCT_TAG,
  type PromotionAction,
  type PromotionActionType,
  type PromotionConditionType,
  type PromotionFull,
} from "@/lib/types/promotion";
import {
  AdminActionBar,
  AdminPageLayout,
  AdminEmptyState,
  AdminMobileCard,
  AdminRefreshButton,
  AdminSectionCard,
} from "@/components/admin/AdminPageKit";

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
  conditionType: PROMOTION_CONDITION.PRODUCT_TAG,
  conditionValue: PRODUCT_TAG.BINDABLE,
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
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    setDrawerOpen(true);
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
      conditionType:
        promotion.conditions[0]?.type || PROMOTION_CONDITION.PRODUCT_TAG,
      conditionValue: promotion.conditions[0]?.value || "",
      discountAmount: String(
        getActionValue(promotion.actions, PROMOTION_ACTION.DISCOUNT_AMOUNT) ||
          "",
      ),
      bonusPoint: String(
        getActionValue(promotion.actions, PROMOTION_ACTION.BONUS_POINT) || "",
      ),
    });
    setDrawerOpen(true);
  };

  const payload = useMemo(() => {
    const actions: { type: PromotionActionType; value?: number }[] = [];

    if (form.discountAmount) {
      actions.push({
        type: PROMOTION_ACTION.DISCOUNT_AMOUNT,
        value: Number(form.discountAmount),
      });
    }

    if (form.bonusPoint) {
      actions.push({
        type: PROMOTION_ACTION.BONUS_POINT,
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
      conditions: [{ type: form.conditionType, value: form.conditionValue || null }],
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
      setDrawerOpen(false);
      await loadPromotions();
    } catch {
      dismissToast(loadingId);
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
    } catch {
      dismissToast(loadingId);
      showToastError("Xóa khuyến mãi thất bại");
    }
  };

  return (
    <AdminPageLayout
      actionBar={
        <AdminActionBar>
        <div className="flex flex-wrap items-center gap-2">
          <AdminRefreshButton onClick={loadPromotions} loading={loading} />
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Thêm khuyến mãi
          </Button>
        </div>
      </AdminActionBar>
      }
    >
      <div className="hidden md:block">
        <AdminSectionCard className="overflow-hidden p-0">
          <Table>
            <TableHeader className="bg-muted/40">
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
              {promotions.map((promotion) => {
                const discountAmount = getActionValue(
                  promotion.actions,
                  PROMOTION_ACTION.DISCOUNT_AMOUNT,
                );
                const bonusPoint = getActionValue(
                  promotion.actions,
                  PROMOTION_ACTION.BONUS_POINT,
                );
                return (
                  <TableRow key={promotion.id}>
                    <TableCell className="font-medium">{promotion.name}</TableCell>
                    <TableCell>
                      {promotion.conditions[0]?.type}
                      {promotion.conditions[0]?.value
                        ? `: ${promotion.conditions[0].value}`
                        : ""}
                    </TableCell>
                    <TableCell>
                      {discountAmount ? `- ${discountAmount.toLocaleString()}đ` : ""}
                      {discountAmount && bonusPoint ? " + " : ""}
                      {bonusPoint ? `${bonusPoint.toLocaleString()} điểm` : ""}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(promotion.startAt).toLocaleDateString("vi-VN")} →{" "}
                      {new Date(promotion.endAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>{promotion.isActive ? "Bật" : "Tắt"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon" onClick={() => openEdit(promotion)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="ml-2"
                        onClick={() => handleDelete(promotion)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!loading && promotions.length === 0 ? <AdminEmptyState title="Chưa có khuyến mãi nào" /> : null}
        </AdminSectionCard>
      </div>

      <div className="space-y-3 md:hidden">
        {promotions.map((promotion) => {
          const discountAmount = getActionValue(
            promotion.actions,
            PROMOTION_ACTION.DISCOUNT_AMOUNT,
          );
          const bonusPoint = getActionValue(
            promotion.actions,
            PROMOTION_ACTION.BONUS_POINT,
          );
          return (
            <AdminMobileCard
              key={promotion.id}
              header={<p className="text-sm font-semibold">{promotion.name}</p>}
              footer={
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(promotion)}>
                    Sửa
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDelete(promotion)}>
                    Xóa
                  </Button>
                </div>
              }
            >
              <p className="text-xs text-muted-foreground">
                {new Date(promotion.startAt).toLocaleDateString("vi-VN")} → {new Date(promotion.endAt).toLocaleDateString("vi-VN")}
              </p>
              <p className="text-sm">
                {discountAmount ? `- ${discountAmount.toLocaleString()}đ` : ""}
                {discountAmount && bonusPoint ? " + " : ""}
                {bonusPoint ? `${bonusPoint.toLocaleString()} điểm` : ""}
              </p>
              <p className="text-xs text-muted-foreground">{promotion.isActive ? "Đang bật" : "Đang tắt"}</p>
            </AdminMobileCard>
          );
        })}
        {!loading && promotions.length === 0 ? <AdminEmptyState title="Chưa có khuyến mãi nào" /> : null}
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="md:ml-auto md:max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>
              {editingPromotion ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi"}
            </DrawerTitle>
          </DrawerHeader>

          <div className="space-y-4 px-4 pb-4">
            <div className="grid gap-2">
              <Label>Tên chương trình</Label>
              <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Mô tả</Label>
              <Input value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Bắt đầu</Label>
                <Input type="datetime-local" value={form.startAt} onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Kết thúc</Label>
                <Input type="datetime-local" value={form.endAt} onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Điều kiện</Label>
                <Select value={form.conditionType} onValueChange={(value: PromotionConditionType) => setForm((prev) => ({ ...prev, conditionType: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROMOTION_CONDITION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Giá trị điều kiện</Label>
                <Input value={form.conditionValue} onChange={(e) => setForm((prev) => ({ ...prev, conditionValue: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Giảm giá (VNĐ)</Label>
                <Input type="number" min={0} value={form.discountAmount} onChange={(e) => setForm((prev) => ({ ...prev, discountAmount: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Điểm thưởng</Label>
                <Input type="number" min={0} value={form.bonusPoint} onChange={(e) => setForm((prev) => ({ ...prev, bonusPoint: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="active-switch">Kích hoạt</Label>
              <Switch id="active-switch" checked={form.isActive} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))} />
            </div>
            <div className="grid gap-2">
              <Label>Độ ưu tiên</Label>
              <Input type="number" value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: Number(e.target.value || 0) }))} />
            </div>
          </div>

          <DrawerFooter>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </AdminPageLayout>
  );
}
