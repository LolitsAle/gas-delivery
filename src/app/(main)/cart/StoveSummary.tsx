"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  CartItemsWithProduct,
  StoveWithProducts,
  useCurrentUser,
} from "@/components/context/CurrentUserContext";
import UserStoveDrawer from "@/components/userInfo/StoveFormDrawer";
import { apiFetchAuth } from "@/lib/api/apiClient";

type CartStoveCardProps = {
  stove: StoveWithProducts | null;
  cartItems: CartItemsWithProduct[];
};

export default function StoveSummary({ stove, cartItems }: CartStoveCardProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { refreshUser } = useCurrentUser();

  const stoveItem = useMemo(() => {
    if (!stove?.productId) return undefined;

    return cartItems.find(
      (item) =>
        item.productId === stove.productId &&
        item.type === "NORMAL_PRODUCT" &&
        !item.parentItemId,
    );
  }, [cartItems, stove?.productId]);

  const giftItem = useMemo(() => {
    console.log("stoveItem:", stoveItem);
    console.log("cartItems", cartItems);
    if (!stoveItem) return undefined;

    return cartItems.find(
      (item) =>
        item.type === "GIFT_PRODUCT" && item.parentItemId === stoveItem.id,
    );
  }, [cartItems, stoveItem]);

  const isActive = !!stoveItem;

  if (!stove) return null;

  const handleRemove = async () => {
    if (!stove?.productId || !stoveItem) return;

    try {
      setLoading(true);

      const itemsToRemove = [
        {
          productId: stove.productId,
          quantity: 0,
          payByPoints: false,
          type: "NORMAL_PRODUCT",
        },
      ];

      if (giftItem) {
        itemsToRemove.push({
          productId: giftItem.productId,
          quantity: 0,
          payByPoints: false,
          type: "GIFT_PRODUCT",
        });
      }

      await apiFetchAuth("/api/user/me/cart", {
        method: "PATCH",
        body: {
          stoveId: stove.id,
          items: itemsToRemove,
        },
      });

      await refreshUser();
    } catch (err) {
      console.error("Remove stove product failed", err);
    } finally {
      setLoading(false);
    }
  };

  const renderPromoLabel = () => {
    switch (stove.defaultPromoChoice) {
      case "DISCOUNT_CASH":
        return <div className="text-green-600 text-xs">💸 Giảm tiền mặt</div>;
      case "BONUS_POINT":
        return (
          <div className="text-green-600 text-xs">⭐ Cộng điểm thưởng</div>
        );
      case "GIFT_PRODUCT":
        return <div className="text-xs text-gray-500">Sản phẩm tặng kèm</div>;
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
            <div className="flex gap-2">
              <Button
                className="shadow rounded-lg bg-white"
                size="icon"
                variant="ghost"
                onClick={() => setOpen(true)}
              >
                <Pencil className="w-4 h-4" />
              </Button>

              {isActive && (
                <Button
                  className="shadow rounded-lg bg-white text-red-600"
                  size="icon"
                  variant="ghost"
                  disabled={loading}
                  onClick={handleRemove}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          }
        >
          <CardTitle className="text-base ml-[3vw]">{stove.name}</CardTitle>
        </CardHeader>

        <CardContent className="text-sm p-[3vw] flex flex-col gap-[2vw]">
          <div
            className={`p-[2vw] w-full rounded-md font-semibold ${
              isActive ? "bg-gas-green-100" : "bg-gray-100 text-gray-500"
            }`}
          >
            {isActive && stoveItem?.product ? (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span>📦 {stoveItem.product.productName}</span>
                  <span>x{stoveItem.quantity}</span>
                </div>

                <div className=" bg-green-50 rounded-lg p-2">
                  <div className="border-l border-gray-200 pl-3">
                    {renderPromoLabel()}

                    {giftItem && (
                      <div className="flex justify-between text-xs text-gray-700 mt-0.5">
                        <span> 🎁 {giftItem.product.productName}</span>
                        <span>x{giftItem.quantity}</span>
                      </div>
                    )}
                  </div>
                </div>
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
