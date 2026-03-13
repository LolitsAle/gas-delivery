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
import { r2Url } from "@/lib/helper/helpers";

const STATUS_LABEL_MAP: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  DELIVERING: "Đang giao",
  UNPAID: "Chưa thanh toán",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã huỷ",
};

type StoveImageDetail = {
  id: string;
  houseImage?: string[];
};

type UserStovesResponse = {
  id: string;
  stoves?: StoveImageDetail[];
};

type SelectedOrder = {
  id: string;
  stoveId?: string | null;
  createdAt?: string;
  status?: string;
  note?: string | null;
  user?: {
    id: string;
    phoneNumber?: string | null;
    nickname?: string | null;
    name?: string | null;
    points?: number | null;
    tags?: string[];
  } | null;
  stoveSnapshot?: {
    stoveName?: string | null;
    address?: string | null;
    note?: string | null;
    productName?: string | null;
    quantity?: number | null;
    unitPrice?: number | null;
    discountPerUnitSnapshot?: number | null;
    productTagsSnapshot?: string[];
    promoChoice?: string | null;
  } | null;
};

interface Props {
  open: boolean;
  selectedOrder: SelectedOrder | null;
  onClose: () => void;
}

export default function EditUserDrawer({
  open,
  selectedOrder,
  onClose,
}: Props) {
  const [activeTab, setActiveTab] = useState("info");
  const [imageLoading, setImageLoading] = useState(false);
  const [stoveImages, setStoveImages] = useState<string[]>([]);
  const [imageFetched, setImageFetched] = useState(false);

  useEffect(() => {
    if (!open) {
      setActiveTab("info");
      setImageLoading(false);
      setStoveImages([]);
      setImageFetched(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || activeTab !== "images") return;
    if (!selectedOrder?.user?.id || !selectedOrder?.stoveId) return;
    if (imageFetched) return;

    const fetchStoveImages = async () => {
      try {
        setImageLoading(true);

        const data = await apiFetchAuth(
          `/api/admin/users/${selectedOrder.user!.id}`,
        );

        const matchedStove =
          data?.stoves?.find(
            (stove: StoveImageDetail) => stove.id === selectedOrder.stoveId,
          ) || null;

        setStoveImages(matchedStove?.houseImage || []);
      } catch (err) {
        console.error("Fetch stove images failed", err);
        setStoveImages([]);
      } finally {
        setImageLoading(false);
        setImageFetched(true);
      }
    };

    fetchStoveImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    activeTab,
    imageFetched,
    selectedOrder?.user?.id,
    selectedOrder?.stoveId,
  ]);

  const headerLabel = useMemo(() => {
    return (
      selectedOrder?.user?.nickname ||
      selectedOrder?.user?.name ||
      selectedOrder?.user?.phoneNumber ||
      ""
    );
  }, [selectedOrder]);

  const stoveInfo = selectedOrder?.stoveSnapshot;

  const statusLabel = selectedOrder?.status
    ? (STATUS_LABEL_MAP[selectedOrder.status] ?? selectedOrder.status)
    : "-";

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="md:max-w-2xl md:ml-auto flex flex-col">
        <DrawerHeader>
          <DrawerTitle>{`Thông tin người dùng • ${headerLabel}`}</DrawerTitle>
        </DrawerHeader>

        {!selectedOrder ? (
          <div className="flex-1 flex items-center justify-center text-sm">
            Không có dữ liệu
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="images">Hình ảnh</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-3 text-sm">
                <div className="border rounded p-3">
                  <div className="text-gray-500">Số điện thoại</div>
                  <div className="font-medium">
                    {selectedOrder.user?.phoneNumber || "-"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded p-3">
                    <div className="text-gray-500">Tên</div>
                    <div className="font-medium">
                      {selectedOrder.user?.name || "-"}
                    </div>
                  </div>

                  <div className="border rounded p-3">
                    <div className="text-gray-500">Nickname</div>
                    <div className="font-medium">
                      {selectedOrder.user?.nickname || "-"}
                    </div>
                  </div>
                </div>

                <div className="border rounded p-3 space-y-1">
                  <div className="text-gray-500">Điểm giao</div>
                  <div className="font-semibold">
                    {stoveInfo?.stoveName || "Không có tên bếp"}
                  </div>
                  <div>{stoveInfo?.address || "Không có địa chỉ"}</div>
                  {stoveInfo?.note ? (
                    <div className="text-gray-600">
                      Ghi chú: {stoveInfo.note}
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded p-3">
                    <div className="text-gray-500">Trạng thái đơn</div>
                    <div className="font-medium">{statusLabel}</div>
                  </div>

                  <div className="border rounded p-3">
                    <div className="text-gray-500">Điểm hiện tại</div>
                    <div className="font-medium">
                      {selectedOrder.user?.points ?? "-"}
                    </div>
                  </div>
                </div>

                {selectedOrder.note && (
                  <div className="border rounded p-3">
                    <div className="text-gray-500">Ghi chú đơn hàng</div>
                    <div className="font-medium">{selectedOrder.note}</div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="images" className="space-y-3">
                {!selectedOrder.stoveId ? (
                  <div className="text-sm text-gray-500">
                    Đơn hàng này không có stoveId.
                  </div>
                ) : imageLoading ? (
                  <div className="text-sm text-gray-500">
                    Đang tải ảnh bếp...
                  </div>
                ) : stoveImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {stoveImages.map((image, index) => (
                      <Image
                        key={`${selectedOrder.stoveId}-${index}`}
                        src={r2Url(image)}
                        alt={`Ảnh bếp ${index + 1}`}
                        width={320}
                        height={128}
                        unoptimized
                        className="w-full h-32 object-cover rounded border"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Không có ảnh bếp.</div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
