"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import {
  CartItemsWithProduct,
  StoveWithProducts,
} from "@/components/context/CurrentUserContext";
import UserStoveDrawer from "@/components/userInfo/StoveFormDrawer";

type CartStoveCardProps = {
  stove: StoveWithProducts | null;
  cartItems: CartItemsWithProduct[];
};

export default function StoveSummary({ stove, cartItems }: CartStoveCardProps) {
  const [open, setOpen] = useState(false);

  const stoveItem = useMemo(() => {
    if (!stove?.productId) return undefined;
    return cartItems.find((item) => item.productId === stove.productId);
  }, [cartItems, stove?.productId]);

  const isActive = !!stoveItem;

  if (!stove) return null;

  const renderPromoLabel = () => {
    switch (stove.defaultPromoChoice) {
      case "DISCOUNT_CASH":
        return <div className="text-green-600 text-xs">💸 Giảm tiền mặt</div>;
      case "BONUS_POINT":
        return (
          <div className="text-green-600 text-xs">⭐ Cộng điểm thưởng</div>
        );
      case "GIFT_PRODUCT":
        return (
          <div className="text-green-600 text-xs">🎁 Tặng sản phẩm kèm</div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <CardHeader
          className="flex flex-row items-center justify-between pb-2 bg-gas-green-400 rounded-t-lg"
          actions={
            <Button
              className="shadow rounded-lg bg-white"
              size="icon"
              variant="ghost"
              onClick={() => setOpen(true)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          }
        >
          <CardTitle className="text-base ml-[3vw]">🔥 {stove.name}</CardTitle>
        </CardHeader>

        <CardContent className="text-sm p-[3vw] flex flex-col gap-[2vw]">
          <p>🏠 {stove.address ?? "Chưa cập nhật địa chỉ"}</p>

          {stove.note && (
            <p className="text-muted-foreground">🗺️ {stove.note}</p>
          )}

          <div
            className={`p-[2vw] w-full rounded-md font-semibold ${
              isActive ? "bg-gas-green-100" : "bg-gray-100 text-gray-500"
            }`}
          >
            {isActive && stoveItem?.product ? (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>📦 {stoveItem.product.productName}</span>
                  <span>x{stoveItem.quantity}</span>
                </div>

                {renderPromoLabel()}
              </div>
            ) : (
              "Chưa chọn sản phẩm cho bếp này"
            )}
          </div>
        </CardContent>
      </Card>

      <UserStoveDrawer open={open} onOpenChange={setOpen} stove={stove} />
    </>
  );
}
