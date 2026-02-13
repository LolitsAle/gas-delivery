"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { StoveWithProducts } from "@/components/context/CurrentUserContext";
import UserStoveDrawer from "@/components/main/userInfo/StoveFormDrawer";

type CartStoveCardProps = {
  stove: StoveWithProducts | null;
  onRemove: () => void;
};

export default function StoveSummary({ stove, onRemove }: CartStoveCardProps) {
  const [open, setOpen] = useState(false);

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
        return <div className="text-xs text-green-600">Sản phẩm tặng kèm</div>;
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

              <Button
                className="shadow rounded-lg bg-white text-red-600"
                size="icon"
                variant="ghost"
                onClick={onRemove}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          }
        >
          <CardTitle className="text-base ml-[3vw]">{stove.name}</CardTitle>
        </CardHeader>

        <CardContent className="text-sm p-[3vw] flex flex-col gap-[2vw]">
          <div className="p-[2vw] w-full rounded-md font-semibold bg-gas-green-100">
            {stove.product ? (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>📦 {stove.product.productName}</span>
                  <span>x{stove.defaultProductQuantity}</span>
                </div>
                <div className="flex justify-between pl-[5vw]">
                  <span>
                    Giá: {stove.product.currentPrice.toLocaleString()}đ x{" "}
                    {stove.defaultProductQuantity}
                  </span>
                  <span>
                    {(
                      stove.product.currentPrice * stove.defaultProductQuantity
                    ).toLocaleString()}
                    đ
                  </span>
                </div>

                <div className="bg-green-50 rounded-lg p-2">
                  <div className="border-l border-gray-200 pl-3">
                    {renderPromoLabel()}

                    {stove.defaultPromoChoice === "GIFT_PRODUCT" &&
                      stove.promoProduct && (
                        <div className="flex justify-between text-xs text-gray-700 mt-0.5">
                          <span>🎁 {stove.promoProduct.productName}</span>
                          <span>x{stove.defaultProductQuantity}</span>
                        </div>
                      )}
                    {stove.defaultPromoChoice === "DISCOUNT_CASH" && (
                      <div className="text-green-600 text-xs flex justify-between">
                        <div>-10,000đ x {stove.defaultProductQuantity}</div>
                        <div>
                          -
                          {(
                            10000 * stove.defaultProductQuantity
                          ).toLocaleString()}
                          đ
                        </div>
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
