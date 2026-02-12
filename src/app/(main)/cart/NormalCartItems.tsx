"use client";

import { Card, CardContent } from "@/components/ui/card";
import ProductImage from "../store/ProductImage";
import {
  CartItemsWithProduct,
  StoveWithProducts,
} from "@/components/context/CurrentUserContext";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { Button } from "@/components/admin/Commons";
import { Trash2, Plus, Minus } from "lucide-react";
import {
  dismissToast,
  showToastError,
  showToastLoading,
  showToastSuccess,
} from "@/lib/helper/toast";
import { useMemo } from "react";

type Props = {
  stove: StoveWithProducts;
  refreshUser: () => Promise<void>;
};

export default function NormalCartItems({ refreshUser, stove }: Props) {
  const items: CartItemsWithProduct[] = useMemo(() => {
    return (
      stove.cart?.items.filter((item) => !item.parentItemId && item.product) ??
      []
    );
  }, [stove.cart?.items]);

  const updateCartItem = async (
    productId: string,
    quantity: number,
    payByPoints: boolean,
    type: string,
  ) => {
    const loading = showToastLoading("Đang cập nhật giỏ hàng...");
    try {
      await apiFetchAuth("/api/user/me/cart", {
        method: "PATCH",
        body: {
          stoveId: stove.id,
          items: [
            {
              productId,
              quantity,
              payByPoints,
              type,
            },
          ],
        },
      });

      await refreshUser();
      dismissToast(loading);
      showToastSuccess("Cập nhật giỏ hàng thành công!");
    } catch (err) {
      console.error("Update cart failed", err);
      dismissToast(loading);
      showToastError("Cập nhật giỏ hàng thất bại!");
    }
  };

  if (!items.length) return null;

  return (
    <>
      {items.map((item) => {
        const handleIncrease = () => {
          updateCartItem(
            item.productId,
            item.quantity + 1,
            item.payByPoints,
            item.type,
          );
        };

        const handleDecrease = () => {
          updateCartItem(
            item.productId,
            item.quantity - 1,
            item.payByPoints,
            item.type,
          );
        };

        const handleRemove = () => {
          updateCartItem(item.productId, 0, item.payByPoints, item.type);
        };

        return (
          <Card key={item.id} className="rounded-xl bg-white">
            <CardContent className="p-3 flex justify-center items-start gap-[4vw] relative">
              <div className="w-[20vw]">
                <ProductImage
                  src={item.product?.previewImageUrl || ""}
                  alt={item.product?.productName || ""}
                />
              </div>

              <div className="flex-1 flex justify-start items-start">
                <div className="flex-1">
                  <p className="font-semibold">{item.product?.productName}</p>
                  {item.payByPoints ? (
                    <p className="text-sm text-gas-orange-500">
                      {(
                        (item.product?.pointValue ?? 0) * item.quantity
                      ).toLocaleString()}
                      ⭐
                    </p>
                  ) : (
                    <p className="text-sm text-gas-green-600">
                      {(
                        (item.product?.currentPrice ?? 0) * item.quantity
                      ).toLocaleString()}
                      đ
                    </p>
                  )}
                </div>
                <div className="flex items-center shrink-0 rounded-md px-[1vw]">
                  <Button size="icon" variant="ghost" onClick={handleDecrease}>
                    <Minus className="w-3 h-3" />
                  </Button>

                  <span className=" px-[2vw]">{item.quantity}</span>

                  <Button size="icon" variant="ghost" onClick={handleIncrease}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <Button
                className="absolute bottom-[2vw] right-[3vw] shadow rounded-lg bg-red-600 text-white p-[2vw]"
                size="icon"
                variant="ghost"
                onClick={handleRemove}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
