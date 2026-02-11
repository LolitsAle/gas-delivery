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

type Props = {
  stove: StoveWithProducts;
  items: CartItemsWithProduct[];
  refreshUser: () => Promise<void>;
};

export default function NormalCartItems({ items, refreshUser, stove }: Props) {
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

  return (
    <>
      {items.map((item) => {
        if (!item.product) return null;

        const handleIncrease = () => {
          updateCartItem(
            item.productId,
            item.quantity + 1,
            item.payByPoints,
            item.type,
          );
        };

        const handleDecrease = () => {
          const newQty = item.quantity - 1;
          updateCartItem(item.productId, newQty, item.payByPoints, item.type);
        };

        const handleRemove = () => {
          updateCartItem(item.productId, 0, item.payByPoints, item.type);
        };

        return (
          <Card key={item.id} className="rounded-xl bg-white">
            <CardContent className="p-3 flex justify-center items-center gap-[4vw] relative">
              <div className="w-[20vw]">
                <ProductImage
                  src={item.product.previewImageUrl || ""}
                  alt={item.product.productName}
                />
              </div>

              <div className="flex-1">
                <p className="font-semibold">{item.product.productName}</p>

                {item.payByPoints ? (
                  <p className="text-sm text-gas-orange-500">
                    {(
                      (item.product.pointValue ?? 0) * item.quantity
                    ).toLocaleString()}
                    ⭐
                  </p>
                ) : (
                  <p className="text-sm text-gas-green-600">
                    {(
                      (item.product.currentPrice ?? 0) * item.quantity
                    ).toLocaleString()}
                    đ
                  </p>
                )}

                {/* Quantity control */}
                <div className="flex items-center gap-3 mt-2">
                  <Button size="icon" variant="ghost" onClick={handleDecrease}>
                    <Minus className="w-4 h-4" />
                  </Button>

                  <span className="font-semibold">{item.quantity}</span>

                  <Button size="icon" variant="ghost" onClick={handleIncrease}>
                    <Plus className="w-4 h-4" />
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
