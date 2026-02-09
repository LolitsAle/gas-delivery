"use client";

import { useMemo } from "react";
import {
  CartItemsWithProduct,
  useCurrentUser,
} from "@/components/context/CurrentUserContext";
import CartSummary from "./CartSummary";
import StoveSummary from "./StoveSummary";
import { useRouter } from "next/navigation";
import { apiFetchAuth } from "@/lib/api/apiClient";
import NormalCartItems from "./NormalCartItems";

export default function CartPage() {
  const { currentUser, refreshUser, activeStoveId } = useCurrentUser();
  const router = useRouter();

  const stove = useMemo(() => {
    if (!currentUser || !activeStoveId) return null;
    return currentUser.stoves.find((s) => s.id === activeStoveId) ?? null;
  }, [currentUser, activeStoveId]);
  console.log("stove", stove);

  const items: CartItemsWithProduct[] = useMemo(() => {
    return stove?.cart?.items ?? [];
  }, [stove?.cart?.items]);

  const stoveProductInCart = useMemo(() => {
    if (!stove?.productId) return false;
    return items.some((i) => i.productId === stove.productId);
  }, [items, stove?.productId]);

  const normalItems = useMemo(() => {
    if (!stove?.productId) return items;

    const stoveCartItem = items.find(
      (i) => i.productId === stove.productId && i.type === "NORMAL_PRODUCT",
    );

    if (!stoveCartItem) return items;

    return items.filter(
      (i) => i.id !== stoveCartItem.id && i.parentItemId !== stoveCartItem.id,
    );
  }, [items, stove?.productId]);

  /* 💰 Tính toán */
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

  const handleAddStoveProduct = async () => {
    if (!stove?.productId || !stove?.defaultProductQuantity) return;

    try {
      await apiFetchAuth("/api/user/me/cart", {
        method: "PATCH",
        body: {
          stoveId: stove.id,
          items: [
            {
              productId: stove.productId,
              quantity: stove.defaultProductQuantity,
              payByPoints: false,
              type: "NORMAL_PRODUCT",
              promo:
                stove.defaultPromoChoice === "GIFT_PRODUCT" &&
                stove.promoProduct
                  ? {
                      type: "GIFT_PRODUCT",
                      productId: stove.promoProduct.id,
                    }
                  : undefined,
            },
          ],
        },
      });

      await refreshUser();
    } catch (err) {
      console.error("Add stove product failed", err);
    }
  };

  const handleCreateOrder = async () => {
    if (!stove) return;
    if (!items.length) return;
    if (notEnoughPoints) return;

    try {
      await apiFetchAuth("/api/user/me/orders", {
        method: "POST",
        body: {
          stoveId: stove.id,
        },
      });

      await refreshUser();
      router.push("/order-completed");
    } catch (err) {
      console.error("Create order failed", err);
    }
  };

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
          onCreateOrder={handleCreateOrder}
        />
      </div>

      <div className="bg-white p-[5vw] overflow-auto flex-1 pb-[30vw] flex flex-col gap-[3vw]">
        {stove && (
          <>
            {stoveProductInCart ? (
              <StoveSummary stove={stove} cartItems={items} />
            ) : (
              <button
                onClick={handleAddStoveProduct}
                className="p-[3vw] w-full bg-gas-green-700 text-white rounded-xl font-bold shadow active:scale-95 transition"
              >
                Thêm gas từ bếp: {stove.name}
              </button>
            )}
          </>
        )}

        <NormalCartItems items={normalItems} refreshUser={refreshUser} />
      </div>
    </div>
  );
}
