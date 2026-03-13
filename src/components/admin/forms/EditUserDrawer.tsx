"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/types/frontend";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiFetchAuth, apiFetchPublic } from "@/lib/api/apiClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { r2Url } from "@/lib/helper/helpers";

interface UserWithRelations extends User {
  stoves: any[];
  orders?: any[];
}

interface Props {
  open: boolean;
  selectedUser: UserWithRelations | null;
  onClose: () => void;
  onSave: (data: Partial<UserWithRelations>) => Promise<void> | void;
}

const stoveDefaults = {
  id: "",
  name: "",
  address: "",
  note: "",
  productId: "",
  houseImage: [] as string[],
};

export default function EditUserDrawer({ open, selectedUser, onClose, onSave }: Props) {
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [userDetail, setUserDetail] = useState<UserWithRelations | null>(null);
  const [form, setForm] = useState<any>(null);
  const [bindableProducts, setBindableProducts] = useState<any[]>([]);
  const [editingStove, setEditingStove] = useState<any | null>(null);
  const [stoveForm, setStoveForm] = useState<any>(stoveDefaults);
  const [savingStove, setSavingStove] = useState(false);

  useEffect(() => {
    if (!open || !selectedUser?.id) return;

    const fetchUserDetail = async () => {
      try {
        setDetailLoading(true);
        const data = await apiFetchAuth(`/api/admin/users/${selectedUser.id}`);
        setUserDetail(data);
        setForm({
          phoneNumber: data.phoneNumber,
          name: data.name || "",
          nickname: data.nickname || "",
          address: data.address || "",
          addressNote: data.addressNote || "",
          points: data.points ?? 0,
          role: data.role,
          isVerified: data.isVerified,
          isActive: data.isActive,
          tags: data.tags || [],
          password: "",
        });
      } finally {
        setDetailLoading(false);
      }
    };

    fetchUserDetail();
    apiFetchPublic("/api/products?tags=BINDABLE").then((data) => setBindableProducts(Array.isArray(data) ? data : []));
  }, [open, selectedUser?.id]);

  useEffect(() => {
    if (!open) {
      setUserDetail(null);
      setForm(null);
      setEditingStove(null);
      setStoveForm(stoveDefaults);
    }
  }, [open]);

  const update = (key: string, value: any) => setForm((prev: any) => ({ ...prev, [key]: value }));

  const toggleTag = (tag: string) => {
    const currentTags = form.tags || [];
    update("tags", currentTags.includes(tag) ? currentTags.filter((t: string) => t !== tag) : [...currentTags, tag]);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const openEditStove = (stove: any) => {
    setEditingStove(stove);
    setStoveForm({
      ...stoveDefaults,
      ...stove,
      houseImage: stove.houseImage || [],
      productId: stove.productId || "",
    });
  };

  const saveStove = async () => {
    if (!editingStove?.id) return;
    setSavingStove(true);
    try {
      await apiFetchAuth(`/api/admin/stoves/${editingStove.id}`, {
        method: "PUT",
        body: stoveForm,
      });
      const refreshed = await apiFetchAuth(`/api/admin/users/${selectedUser?.id}`);
      setUserDetail(refreshed);
      setEditingStove(null);
    } finally {
      setSavingStove(false);
    }
  };

  return (
    <>
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent className="flex flex-col md:ml-auto md:max-w-3xl">
          <DrawerHeader>
            <DrawerTitle>
              {detailLoading
                ? "Đang tải..."
                : `Quản lý người dùng • ${form?.nickname || form?.phoneNumber || selectedUser?.phoneNumber || ""}`}
            </DrawerTitle>
          </DrawerHeader>

          {detailLoading || !form ? (
            <div className="flex flex-1 items-center justify-center text-sm">Đang tải dữ liệu...</div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <Tabs defaultValue="info">
                  <TabsList className="mb-4 grid grid-cols-3">
                    <TabsTrigger value="info">Thông tin</TabsTrigger>
                    <TabsTrigger value="stoves">Bếp</TabsTrigger>
                    <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Số điện thoại</Label>
                        <Input value={form.phoneNumber} onChange={(e) => update("phoneNumber", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Mật khẩu mới</Label>
                        <Input
                          type="password"
                          placeholder="Để trống nếu không đổi"
                          value={form.password}
                          onChange={(e) => update("password", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Tên</Label>
                        <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Nickname</Label>
                        <Input value={form.nickname} onChange={(e) => update("nickname", e.target.value)} />
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Điểm</Label>
                        <Input
                          type="number"
                          value={form.points}
                          onChange={(e) => update("points", Number(e.target.value || 0))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={form.role} onValueChange={(v) => update("role", v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">USER</SelectItem>
                            <SelectItem value="STAFF">STAFF</SelectItem>
                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Địa chỉ</Label>
                      <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Ghi chú địa chỉ</Label>
                      <Textarea value={form.addressNote} onChange={(e) => update("addressNote", e.target.value)} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "BUSSINESS", value: "BUSSINESS" },
                        { label: "VIP", value: "VIP" },
                      ].map((item) => (
                        <Button
                          key={item.value}
                          type="button"
                          variant={form.tags.includes(item.value) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTag(item.value)}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="flex items-center justify-between rounded-lg border p-3 text-sm">
                        Đã xác thực
                        <input
                          type="checkbox"
                          checked={form.isVerified}
                          onChange={(e) => update("isVerified", e.target.checked)}
                        />
                      </label>
                      <label className="flex items-center justify-between rounded-lg border p-3 text-sm">
                        Đang hoạt động
                        <input
                          type="checkbox"
                          checked={form.isActive}
                          onChange={(e) => update("isActive", e.target.checked)}
                        />
                      </label>
                    </div>
                  </TabsContent>

                  <TabsContent value="stoves" className="space-y-2">
                    {userDetail?.stoves?.length ? (
                      userDetail.stoves.map((s: any, i: number) => (
                        <div key={s.id} className="rounded-lg border p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium">Bếp #{i + 1} • {s.name || s.address}</p>
                            <Button variant="outline" size="sm" onClick={() => openEditStove(s)}>
                              Cập nhật bếp
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">{s.address}</p>
                          <div className="mt-2 flex gap-2 overflow-x-auto">
                            {(s.houseImage || []).map((img: string) => (
                              <Image
                                key={img}
                                src={r2Url(img)}
                                alt="stove"
                                width={64}
                                height={64}
                                className="h-16 w-16 rounded-md border object-cover"
                              />
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">Chưa có bếp</div>
                    )}
                  </TabsContent>

                  <TabsContent value="orders">
                    {userDetail?.orders?.length ? (
                      userDetail.orders.map((o: any) => (
                        <div key={o.id} className="mb-2 rounded border p-3 text-sm">
                          #{o.id.slice(0, 8)} – {o.totalPrice?.toLocaleString()}đ
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">Chưa có đơn</div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex justify-end gap-2 border-t px-5 py-4">
                <Button variant="outline" onClick={onClose}>Đóng</Button>
                <Button onClick={handleSave} disabled={loading}>{loading ? "Đang lưu..." : "Lưu thay đổi"}</Button>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>

      <Drawer open={!!editingStove} onOpenChange={() => setEditingStove(null)}>
        <DrawerContent className="md:ml-auto md:max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Cập nhật bếp</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4 px-4 pb-4">
            <div className="space-y-2">
              <Label>Tên điểm giao</Label>
              <Input value={stoveForm.name} onChange={(e) => setStoveForm((p: any) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Địa chỉ</Label>
              <Input value={stoveForm.address} onChange={(e) => setStoveForm((p: any) => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea value={stoveForm.note || ""} onChange={(e) => setStoveForm((p: any) => ({ ...p, note: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Sản phẩm mặc định</Label>
              <Select
                value={stoveForm.productId || "NONE"}
                onValueChange={(v) => setStoveForm((p: any) => ({ ...p, productId: v === "NONE" ? null : v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Không chọn</SelectItem>
                  {bindableProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.productName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(stoveForm.houseImage || []).map((img: string) => (
                <Image key={img} src={r2Url(img)} alt="stove image" width={120} height={120} className="aspect-square rounded-md border object-cover" />
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingStove(null)}>Hủy</Button>
              <Button onClick={saveStove} disabled={savingStove}>{savingStove ? "Đang lưu..." : "Lưu bếp"}</Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
