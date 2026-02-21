"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetchAuth } from "@/lib/api/apiClient";

type StoveDetail = {
  id: string;
  name?: string | null;
  address?: string | null;
  note?: string | null;
  houseImage?: string[];
  product?: {
    productName?: string | null;
  } | null;
};

type UserDetail = {
  id: string;
  phoneNumber: string;
  name?: string | null;
  nickname?: string | null;
  address?: string | null;
  stoves?: StoveDetail[];
};

type SelectedOrder = {
  user: {
    id: string;
    phoneNumber?: string;
    nickname?: string;
    name?: string;
  };
  stoveId?: string | null;
};

interface Props {
  open: boolean;
  selectedOrder: SelectedOrder | null;
  onClose: () => void;
}

export default function EditUserDrawer({ open, selectedOrder, onClose }: Props) {
  const [detailLoading, setDetailLoading] = useState(false);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);

  useEffect(() => {
    if (!open || !selectedOrder?.user?.id) return;

    const fetchUserDetail = async () => {
      try {
        setDetailLoading(true);
        const data = await apiFetchAuth(`/api/admin/users/${selectedOrder.user.id}`);
        setUserDetail(data);
      } catch (err) {
        console.error("Fetch user detail failed", err);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchUserDetail();
  }, [open, selectedOrder?.user?.id]);

  useEffect(() => {
    if (!open) {
      setUserDetail(null);
      setDetailLoading(false);
    }
  }, [open]);

  const boundStove = useMemo(() => {
    if (!selectedOrder?.stoveId || !userDetail?.stoves?.length) return null;

    return userDetail.stoves.find((stove) => stove.id === selectedOrder.stoveId) || null;
  }, [selectedOrder?.stoveId, userDetail?.stoves]);

  const stoveImages = boundStove?.houseImage || [];

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="h-[95vh] md:h-screen md:max-w-2xl md:ml-auto flex flex-col">
        <DrawerHeader>
          <DrawerTitle>
            {detailLoading
              ? "Đang tải..."
              : `Thông tin người dùng • ${
                  userDetail?.nickname ||
                  userDetail?.name ||
                  userDetail?.phoneNumber ||
                  selectedOrder?.user?.phoneNumber ||
                  ""
                }`}
          </DrawerTitle>
        </DrawerHeader>

        {detailLoading || !userDetail ? (
          <div className="flex-1 flex items-center justify-center text-sm">Đang tải dữ liệu...</div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <Tabs defaultValue="info">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="stoves">Bếp</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-3 text-sm">
                <div className="border rounded p-3">
                  <div className="text-gray-500">Số điện thoại</div>
                  <div className="font-medium">{userDetail.phoneNumber}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded p-3">
                    <div className="text-gray-500">Tên</div>
                    <div className="font-medium">{userDetail.name || "-"}</div>
                  </div>

                  <div className="border rounded p-3">
                    <div className="text-gray-500">Nickname</div>
                    <div className="font-medium">{userDetail.nickname || "-"}</div>
                  </div>
                </div>

                <div className="border rounded p-3">
                  <div className="text-gray-500">Địa chỉ</div>
                  <div className="font-medium">{userDetail.address || "-"}</div>
                </div>
              </TabsContent>

              <TabsContent value="stoves" className="space-y-3">
                {boundStove ? (
                  <>
                    <div className="border rounded p-3 text-sm space-y-1">
                      <div className="font-semibold">{boundStove.name || "Bếp đã bind"}</div>
                      <div>{boundStove.address || "Không có địa chỉ"}</div>
                      {boundStove.product?.productName && (
                        <div className="text-gray-600">Sản phẩm: {boundStove.product.productName}</div>
                      )}
                      {boundStove.note && (
                        <div className="text-gray-600">Ghi chú: {boundStove.note}</div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {stoveImages.length > 0 ? (
                        stoveImages.map((image, index) => (
                          <Image
                            key={`${boundStove.id}-${index}`}
                            src={image}
                            alt={`Ảnh bếp ${index + 1}`}
                            width={320}
                            height={128}
                            unoptimized
                            className="w-full h-32 object-cover rounded border"
                          />
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">Không có ảnh bếp</div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    Không tìm thấy bếp đang được bind với đơn hàng này.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
