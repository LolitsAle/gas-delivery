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
import {
  dismissToast,
  showToastError,
  showToastLoading,
  showToastSuccess,
} from "@/lib/helper/toast";

export default function CartPage() {
  const { currentUser, refreshUser, activeStoveId } = useCurrentUser();
  const router = useRouter();

  const stove = useMemo(() => {
    if (!currentUser || !activeStoveId) return null;
    return currentUser.stoves.find((s) => s.id === activeStoveId) ?? null;
  }, [currentUser, activeStoveId]);

  const items: CartItemsWithProduct[] = useMemo(() => {
    return stove?.cart?.items ?? [];
  }, [stove?.cart?.items]);
  const cart = stove?.cart ?? null;
  const isStoveActive = cart?.isStoveActive ?? false;

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

    const BASE_EARN_POINT = 1000;
    const CART_BINDABLE_BONUS = 1000; // extra boost cho sản phẩm từ cart

    // 1️⃣ Tính từ cart items
    items.forEach((i) => {
      if (!i.product || i.parentItemId) return;

      const price = i.product.currentPrice ?? 0;
      const exchangePoint = i.product.pointValue ?? 0;
      const qty = i.quantity;
      const bindable = i.product.tags?.includes("BINDABLE");

      if (i.payByPoints) {
        // 🔥 đổi điểm → không tính tiền, không tặng điểm
        pointUse += exchangePoint * qty;
        return;
      }

      // tính tiền
      money += price * qty;

      // 🔥 bindable từ cart → 2000 điểm / sản phẩm
      if (bindable) {
        pointEarn += (BASE_EARN_POINT + CART_BINDABLE_BONUS) * qty;
      }
    });

    // 2️⃣ Gas từ stove (bindable nhưng chỉ 1000 điểm)
    if (isStoveActive && stove?.product && stove.defaultProductQuantity) {
      const qty = stove.defaultProductQuantity;
      const price = stove.product.currentPrice ?? 0;
      const bindable = stove.product.tags?.includes("BINDABLE");

      money += price * qty;

      if (bindable) {
        pointEarn += BASE_EARN_POINT * qty;
      }

      // 3️⃣ Promo theo số lượng gas
      if (stove.defaultPromoChoice === "DISCOUNT_CASH") {
        discount = 10000 * qty;
      }

      if (stove.defaultPromoChoice === "BONUS_POINT") {
        bonus = 1000 * qty;
      }
    }

    return {
      totalMoney: Math.max(money - discount, 0),
      totalPointsUse: pointUse,
      totalPointsEarn: pointEarn + bonus,
      discountCash: discount,
      bonusPoints: bonus,
    };
  }, [items, stove, isStoveActive]);

  const userPoints = currentUser?.points ?? 0;
  const notEnoughPoints = totalPointsUse > userPoints;

  const handleActivateStove = async () => {
    if (!stove) return;

    const loading = showToastLoading("Đang cập nhật giỏ hàng...");

    try {
      await apiFetchAuth("/api/user/me/cart", {
        method: "PATCH",
        body: {
          stoveId: stove.id,
          isStoveActive: true,
        },
      });

      await refreshUser();
      dismissToast(loading);
      showToastSuccess("Đã thêm gas từ bếp!");
    } catch (err) {
      dismissToast(loading);
      showToastError("Cập nhật thất bại!");
    }
  };

  const handleDeactivateStove = async () => {
    if (!stove) return;

    const loading = showToastLoading("Đang cập nhật giỏ hàng...");

    try {
      await apiFetchAuth("/api/user/me/cart", {
        method: "PATCH",
        body: {
          stoveId: stove.id,
          isStoveActive: false,
        },
      });

      await refreshUser();
      dismissToast(loading);
      showToastSuccess("Đã xóa gas khỏi giỏ!");
    } catch (err) {
      dismissToast(loading);
      showToastError("Cập nhật thất bại!");
    }
  };

  const handleCreateOrder = async () => {
    if (!stove) return;

    const canOrder = items.length > 0 || isStoveActive;

    if (!canOrder) {
      showToastError("Không có sản phẩm, không thể đặt hàng...");
      return;
    }

    if (totalPointsUse > userPoints) {
      showToastError("Không đủ điểm để sử dụng.");
      return;
    }

    const loading = showToastLoading("Đang tạo đơn hàng...");

    try {
      await apiFetchAuth("/api/user/me/orders", {
        method: "POST",
        body: {
          stoveId: stove.id,
        },
      });

      dismissToast(loading);
      showToastSuccess("Tạo đơn thành công!");

      await refreshUser();
      router.push("/order-completed");
    } catch (err: any) {
      dismissToast(loading);
      showToastError(err?.message || "Có lỗi xảy ra khi tạo đơn hàng.");
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
            {isStoveActive ? (
              <StoveSummary stove={stove} onRemove={handleDeactivateStove} />
            ) : (
              <button
                onClick={handleActivateStove}
                className="p-[3vw] w-full bg-gas-green-700 text-white rounded-xl font-bold shadow active:scale-95 transition"
              >
                Thêm gas từ bếp: {stove.name}
              </button>
            )}

            <NormalCartItems stove={stove} refreshUser={refreshUser} />
          </>
        )}
      </div>
    </div>
  );
}
