"use client";

import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Field } from "../Commons";

interface UserWithStoves extends User {
  stoves: any[];
  orders?: any[];
}

interface Props {
  open: boolean;
  user: UserWithStoves;
  onClose: () => void;
  onSave: (
    data: Partial<UserWithStoves> & { password?: string },
  ) => Promise<void> | void;
}

export default function EditUserDrawer({ open, user, onClose, onSave }: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    phoneNumber: user?.phoneNumber || "",
    name: user?.name || "",
    nickname: user?.nickname || "",
    address: user?.address || "",
    addressNote: user?.addressNote || "",
    points: user?.points ?? 0,
    role: user?.role || "USER",
    isVerified: user?.isVerified ?? false,
    isActive: user?.isActive ?? true,
  });

  useEffect(() => {
    setForm({
      phoneNumber: user?.phoneNumber || "",
      name: user?.name || "",
      nickname: user?.nickname || "",
      address: user?.address || "",
      addressNote: user?.addressNote || "",
      points: user?.points ?? 0,
      role: user?.role || "USER",
      isVerified: user?.isVerified ?? false,
      isActive: user?.isActive ?? true,
    });
  }, [user, open]);

  const update = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload: any = {
        name: form.name,
        nickname: form.nickname,
        address: form.address,
        addressNote: form.addressNote,
        role: form.role,
        points: form.points,
        isVerified: form.isVerified,
        isActive: form.isActive,
      };

      await onSave(payload);
      onClose();
    } catch {
      alert("Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="h-[95vh] md:h-screen md:max-w-2xl md:ml-auto flex flex-col">
        {/* HEADER */}
        <DrawerHeader>
          <DrawerTitle>
            Quản lý người dùng • {user?.nickname || user?.phoneNumber}
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="stoves">Bếp</TabsTrigger>
              <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
            </TabsList>

            {/* TAB 1 — INFO */}
            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Số điện thoại">
                  <input
                    className="w-full text-sm bg-gray-100"
                    value={form.phoneNumber}
                    disabled
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

                <Field label="Nickname">
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

              <div className="grid grid-cols-2 gap-3">
                <Field label="Điểm">
                  <input
                    type="number"
                    className="w-full text-sm bg-gray-100"
                    value={form.points}
                    disabled
                    onChange={(e) => update("points", Number(e.target.value))}
                  />
                </Field>

                <Field label="Vai trò">
                  <select
                    className="w-full text-sm"
                    value={form.role}
                    onChange={(e) =>
                      update("role", e.target.value as User["role"])
                    }
                  >
                    <option value="USER">Người dùng</option>
                    <option value="STAFF">Nhân viên</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-between border rounded px-3 py-2 text-sm">
                  <span>Đã xác thực</span>
                  <input
                    type="checkbox"
                    checked={form.isVerified}
                    onChange={(e) => update("isVerified", e.target.checked)}
                  />
                </label>

                <label className="flex items-center justify-between border rounded px-3 py-2 text-sm">
                  <span>Đang hoạt động</span>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => update("isActive", e.target.checked)}
                  />
                </label>
              </div>
            </TabsContent>

            {/* TAB 2 — STOVES */}
            <TabsContent value="stoves">
              <div className="space-y-3">
                {user?.stoves?.length ? (
                  user?.stoves.map((s, i) => (
                    <div
                      key={s.id || i}
                      className="border rounded-lg p-3 text-sm flex justify-between"
                    >
                      <div>
                        <div className="font-medium">Bếp #{i + 1}</div>
                        <div className="text-gray-500">{s.address}</div>
                        <div className="text-gray-500">{s.note}</div>
                      </div>
                      <Button size="sm" variant="outline">
                        Sửa
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">
                    Người dùng chưa có bếp nào
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 3 — ORDERS */}
            <TabsContent value="orders">
              <div className="space-y-3">
                {user?.orders?.length ? (
                  user?.orders.map((o, i) => (
                    <div
                      key={o.id || i}
                      className="border rounded-lg p-3 text-sm flex justify-between"
                    >
                      <div>
                        <div className="font-medium">
                          Đơn #{o.id.slice(0, 8)}
                        </div>
                        <div className="text-gray-500">
                          {o.totalPrice?.toLocaleString()} đ
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Xem
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">Chưa có đơn hàng</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-white border-t px-5 py-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
