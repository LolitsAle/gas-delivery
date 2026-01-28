"use client";

import { useEffect, useState } from "react";
import { Stove } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TabInfo from "./StoveFormTabs/TabInfo";
import TabProducts from "./StoveFormTabs/TabProducts";
import TabImages from "./StoveFormTabs/TabImages";
import { apiFetchAuth, apiFetchPublic } from "@/lib/api/apiClient";
import {
  showToastError,
  showToastInfo,
  showToastLoading,
  showToastSuccess,
} from "@/lib/helper/toast";
import { useCurrentUser } from "../context/CurrentUserContext";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  stove: Stove | null;
}

const formDefault = {
  name: "",
  address: "",
  note: "",
  productId: undefined,
  defaultProductQuantity: 1,
  defaultPromoChoice: undefined,
  defaultPromoProductId: undefined,

  houseImages: [] as string[], // ảnh cũ (key trên R2)
  newHouseImages: [] as File[], // ảnh mới
  removedHouseImages: [] as string[], // ảnh bị xoá
};

export default function UserStoveDrawer({ open, onOpenChange, stove }: Props) {
  const isEdit = !!stove;
  const { refreshUser } = useCurrentUser();

  const [bindableProducts, setBindableProducts] = useState<any[]>([]);
  const [promoProducts, setPromoProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [form, setForm] = useState<any>(formDefault);

  /* ================= LOAD STOVE ================= */
  useEffect(() => {
    if (stove) {
      setForm({
        ...formDefault,
        ...stove,
        houseImages: stove.houseImage || [],
        newHouseImages: [],
        removedHouseImages: [],
      });
    } else {
      setForm(formDefault);
    }
  }, [stove]);

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    (async () => {
      try {
        const bind = await apiFetchPublic("/api/products?tags=BINDABLE");
        const promo = await apiFetchPublic("/api/products?tags=PROMO_ELIGIBLE");
        setBindableProducts(Array.isArray(bind) ? bind : []);
        setPromoProducts(Array.isArray(promo) ? promo : []);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  const submit = async () => {
    if (!form.name?.trim() || !form.address?.trim() || !form.productId) {
      showToastInfo("Vui lòng nhập đầy đủ tên bếp, địa chỉ và sản phẩm gas");
      return;
    }

    const loadingToastId = showToastLoading(
      isEdit ? "Đang lưu thay đổi..." : "Đang tạo bếp...",
    );

    try {
      let stoveId = stove?.id;

      /* STEP 1 — CREATE STOVE FIRST IF NEW */
      if (!isEdit) {
        const created = await apiFetchAuth(`/api/user/me/stoves`, {
          method: "POST",
          body: { ...form, houseImage: [] },
        });
        stoveId = created.id;
      }

      /* STEP 2 — UPLOAD NEW IMAGES */
      let uploadedKeys: string[] = [];

      if (form.newHouseImages.length > 0) {
        const presignRes = await apiFetchAuth("/api/upload/presign", {
          method: "POST",
          body: {
            target: "stove",
            ownerId: stoveId,
            files: form.newHouseImages.map((file: File) => ({
              mimeType: file.type,
              fileSize: file.size,
            })),
          },
        });

        const uploads = presignRes.uploads;

        await Promise.all(
          uploads.map((u: any, index: number) =>
            fetch(u.uploadUrl, {
              method: "PUT",
              body: form.newHouseImages[index],
            }),
          ),
        );

        uploadedKeys = uploads.map((u: any) => u.key);
      }

      /* STEP 3 — DELETE REMOVED IMAGES ✅ FIXED */
      if (form.removedHouseImages.length > 0) {
        await Promise.all(
          form.removedHouseImages.map((key: string) =>
            apiFetchAuth(`/api/upload/delete`, {
              method: "POST",
              body: { key },
            }),
          ),
        );
      }

      /* STEP 4 — FINAL IMAGE LIST */
      const finalKeys = [...form.houseImages, ...uploadedKeys];

      /* STEP 5 — UPDATE STOVE */
      await apiFetchAuth(`/api/user/me/stoves/${stoveId}`, {
        method: "PUT",
        body: {
          ...form,
          houseImage: finalKeys,
        },
      });

      showToastSuccess("Lưu bếp thành công 🎉", { id: loadingToastId });
      refreshUser();
      onOpenChange(false);
    } catch (err: any) {
      showToastError(err?.message || "Có lỗi xảy ra", { id: loadingToastId });
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-gray-50">
        <DrawerHeader>
          <DrawerTitle>{isEdit ? "🛠️ Cập nhật bếp" : "➕ Tạo bếp"}</DrawerTitle>
        </DrawerHeader>

        <div className="p-4">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-[3vw] shadow">
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="products">Sản phẩm</TabsTrigger>
              <TabsTrigger value="images">Hình ảnh</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <TabInfo form={form} setForm={setForm} />
            </TabsContent>

            <TabsContent value="products">
              <TabProducts
                form={form}
                setForm={setForm}
                bindableProducts={bindableProducts}
                promoProducts={promoProducts}
                loadingProducts={loadingProducts}
              />
            </TabsContent>

            <TabsContent value="images">
              <TabImages form={form} setForm={setForm} />
            </TabsContent>
          </Tabs>
        </div>

        <DrawerFooter>
          <Button className="bg-gas-green-600" onClick={submit}>
            {isEdit ? "Lưu thay đổi" : "Tạo bếp"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Huỷ</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
