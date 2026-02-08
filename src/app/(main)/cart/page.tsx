"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  CartItemsWithProduct,
  useCurrentUser,
} from "@/components/context/CurrentUserContext";
import ProductImage from "../store/ProductImage";
import CartSummary from "./CartSummary";
import StoveSummary from "./StoveSummary";

export default function CartPage() {
  const { currentUser } = useCurrentUser();

  const items: CartItemsWithProduct[] = useMemo(() => {
    return currentUser?.cart?.items ?? [];
  }, [currentUser]);

  const stove = useMemo(() => {
    if (!currentUser?.cart?.stoveId) return null;
    return (
      currentUser.stoves.find((s) => s.id === currentUser?.cart?.stoveId) ??
      null
    );
  }, [currentUser]);

  const normalItems = useMemo(() => {
    if (!stove?.productId) return items;
    return items.filter((i) => i.productId !== stove.productId);
  }, [items, stove]);

  const {
    totalMoney,
    totalPointsUse,
    totalPointsEarn,
    discountCash,
    bonusPoints,
  } = useMemo(() => {
    let money = 0;
    let pointUse = 0;
    let pointEarn = 0;
    let discount = 0;
    let bonus = 0;

    items.forEach((i) => {
      if (!i.product) return;

      if (i.payByPoints) {
        pointUse += (i.product.pointValue ?? 0) * i.quantity;
      } else {
        money += (i.product.currentPrice ?? 0) * i.quantity;
      }

      if (i.earnPoints) {
        pointEarn += 1000;
      }
    });

    if (stove?.defaultPromoChoice === "DISCOUNT_CASH") discount = 10000;
    if (stove?.defaultPromoChoice === "BONUS_POINT") bonus = 1000;

    return {
      totalMoney: Math.max(money - discount, 0),
      totalPointsUse: pointUse,
      totalPointsEarn: pointEarn + bonus,
      discountCash: discount,
      bonusPoints: bonus,
    };
  }, [items, stove]);

  const userPoints = currentUser?.points ?? 0;
  const finalPointBalance = userPoints + totalPointsEarn - totalPointsUse;
  const notEnoughPoints = finalPointBalance < 0;

  return (
    <div className="bg-gas-green-50 overflow-hidden flex flex-col h-screen">
      <div className="shrink-0">
        <CartSummary
          userPoints={userPoints}
          totalMoney={totalMoney}
          totalPointsUse={totalPointsUse}
          totalPointsEarn={totalPointsEarn}
          discountCash={discountCash}
          notEnoughPoints={notEnoughPoints}
        />
      </div>
      <div className="bg-white p-[5vw] overflow-auto flex-1 pb-[30vw]">
        <StoveSummary stove={stove} cartItems={items} />

        <div className="space-y-3">
          {normalItems.map((item) => {
            if (!item.product) return null;

            return (
              <Card key={item.id} className="rounded-xl">
                <CardContent className="p-3 flex gap-3">
                  <div className="w-[10vw]">
                    <ProductImage
                      src={item.product.previewImageUrl || ""}
                      alt={item.product.productName}
                    />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold">{item.product.productName}</p>
                    <p className="text-sm text-gray-500">
                      {(item.product.currentPrice ?? 0).toLocaleString()}đ
                    </p>

                    <div className="flex justify-between items-center mt-2">
                      <span>SL: {item.quantity}</span>
                      <button className="text-red-500 text-sm">Xóa</button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
