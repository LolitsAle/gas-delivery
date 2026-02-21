"use client";

import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Field } from "../Commons";
import { apiFetchAuth } from "@/lib/api/apiClient";

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

export default function EditUserDrawer({
  open,
  selectedUser,
  onClose,
  onSave,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [userDetail, setUserDetail] = useState<UserWithRelations | null>(null);

  const [form, setForm] = useState<any>(null);

  /* ================= FETCH USER DETAIL ================= */

  useEffect(() => {
    console.log(open, selectedUser?.id);
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
        });
      } catch (err) {
        console.error("Fetch user detail failed", err);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchUserDetail();
  }, [open, selectedUser?.id]);

  /* ================= RESET WHEN CLOSE ================= */

  useEffect(() => {
    if (!open) {
      setUserDetail(null);
      setForm(null);
      setLoading(false);
      setDetailLoading(false);
    }
  }, [open]);

  /* ================= HANDLERS ================= */

  const update = (key: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  const toggleTag = (tag: string) => {
    const exists = form.tags.includes(tag);
    update(
      "tags",
      exists ? form.tags.filter((t: string) => t !== tag) : [...form.tags, tag],
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(form);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="h-[95vh] md:h-screen md:max-w-2xl md:ml-auto flex flex-col">
        <DrawerHeader>
          <DrawerTitle>
            {detailLoading
              ? "Đang tải..."
              : `Quản lý người dùng • ${
                  form?.nickname ||
                  form?.phoneNumber ||
                  selectedUser?.phoneNumber ||
                  ""
                }`}
          </DrawerTitle>
        </DrawerHeader>

        {detailLoading || !form ? (
          <div className="flex-1 flex items-center justify-center text-sm">
            Đang tải dữ liệu...
          </div>
        ) : (
          <>
            {/* BODY */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <Tabs defaultValue="info">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="info">Thông tin</TabsTrigger>
                  <TabsTrigger value="stoves">Bếp</TabsTrigger>
                  <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
                </TabsList>

                {/* INFO */}
                <TabsContent value="info" className="space-y-4">
                  <Field label="Số điện thoại">
                    <input
                      className="w-full bg-gray-100"
                      value={form.phoneNumber}
                      disabled
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Tên">
                      <input
                        className="w-full"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                      />
                    </Field>

                    <Field label="Nickname">
                      <input
                        className="w-full"
                        value={form.nickname}
                        onChange={(e) => update("nickname", e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field label="Địa chỉ">
                    <input
                      className="w-full"
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                    />
                  </Field>

                  {/* TAGS */}
                  <Field label="Tags">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={form.tags.includes("BUSSINESS")}
                          onChange={() => toggleTag("BUSSINESS")}
                        />
                        Business
                      </label>
                    </div>
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex justify-between border rounded px-3 py-2 text-sm">
                      <span>Đã xác thực</span>
                      <input
                        type="checkbox"
                        checked={form.isVerified}
                        onChange={(e) => update("isVerified", e.target.checked)}
                      />
                    </label>

                    <label className="flex justify-between border rounded px-3 py-2 text-sm">
                      <span>Đang hoạt động</span>
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => update("isActive", e.target.checked)}
                      />
                    </label>
                  </div>
                </TabsContent>

                {/* STOVES */}
                <TabsContent value="stoves">
                  {userDetail?.stoves?.length ? (
                    userDetail.stoves.map((s: any, i: number) => (
                      <div
                        key={s.id}
                        className="border rounded p-3 text-sm mb-2"
                      >
                        Bếp #{i + 1} – {s.address}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">Chưa có bếp</div>
                  )}
                </TabsContent>

                {/* ORDERS */}
                <TabsContent value="orders">
                  {userDetail?.orders?.length ? (
                    userDetail.orders.map((o: any) => (
                      <div
                        key={o.id}
                        className="border rounded p-3 text-sm mb-2"
                      >
                        #{o.id.slice(0, 8)} – {o.totalPrice?.toLocaleString()}đ
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">Chưa có đơn</div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* FOOTER */}
            <div className="border-t px-5 py-4 flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
