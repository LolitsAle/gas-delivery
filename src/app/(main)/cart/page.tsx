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
import InfoBanner from "@/components/common/InfoBanner";
import {
  BUSINESS_BINDABLE_DISCOUNT_AMOUNT,
  PROMO_BONUS_POINT_AMOUNT,
  PROMO_DISCOUNT_CASH_AMOUNT,
} from "@/constants/promotion";
import { calculateDiscountedProductPrice } from "@/lib/pricing/productPrice";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

type AppliedPromotionView = {
  id: string;
  label: string;
  promoType: string;
  quantity: number;
  cashAmount: number;
  pointAmount: number;
  giftAmount: number;
};

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
    const serverPricing = stove?.cart?.pricing;
    if (serverPricing) {
      let pointUse = 0;
      items.forEach((item) => {
        if (!item.product || item.parentItemId || !item.payByPoints) return;
        pointUse += (item.product.pointValue ?? 0) * item.quantity;
      });

      return {
        totalMoney: serverPricing.totalPrice,
        totalPointsUse: pointUse,
        totalPointsEarn: serverPricing.bonusPoint,
        discountCash: serverPricing.discountAmount,
        bonusPoints: serverPricing.bonusPoint,
      };
    }

    let subtotal = 0;
    let pointUse = 0;
    let discount = 0;
    let bonus = 0;
    const isBusinessUser = currentUser?.tags?.includes("BUSINESS") ?? false;

    items.forEach((item) => {
      if (!item.product || item.parentItemId) return;

      const qty = item.quantity;
      if (item.payByPoints) {
        pointUse += (item.product.pointValue ?? 0) * qty;
        return;
      }

      const pricing = calculateDiscountedProductPrice({
        unitPrice: item.product.currentPrice ?? 0,
        quantity: qty,
        isBusinessUser,
        isBindableProduct: item.product.tags?.includes("BINDABLE"),
        promotionDiscountPerUnit: item.product.promotionDiscountPerUnit ?? 0,
      });

      subtotal += pricing.originalTotalPrice;
      discount += pricing.totalDiscount;
    });

    if (isStoveActive && stove?.product && stove.defaultProductQuantity) {
      const qty = stove.defaultProductQuantity;
      const stovePricing = calculateDiscountedProductPrice({
        unitPrice: stove.product.currentPrice ?? 0,
        quantity: qty,
        isBusinessUser,
        isBindableProduct: stove.product.tags?.includes("BINDABLE"),
        promotionDiscountPerUnit: stove.product.promotionDiscountPerUnit ?? 0,
        stovePromoDiscountPerUnit:
          stove.defaultPromoChoice === "DISCOUNT_CASH"
            ? PROMO_DISCOUNT_CASH_AMOUNT
            : 0,
      });

      subtotal += stovePricing.originalTotalPrice;
      discount += stovePricing.totalDiscount;

      if (stove.defaultPromoChoice === "BONUS_POINT") {
        bonus = PROMO_BONUS_POINT_AMOUNT * qty;
      }
    }

    return {
      totalMoney: Math.max(subtotal - discount, 0),
      totalPointsUse: pointUse,
      totalPointsEarn: bonus,
      discountCash: discount,
      bonusPoints: bonus,
    };
  }, [items, stove, isStoveActive, currentUser?.tags]);

  const userPoints = currentUser?.points ?? 0;
  const notEnoughPoints = totalPointsUse > userPoints;
  const isBusinessUser = currentUser?.tags?.includes("BUSINESS") ?? false;

  const appliedPromotions = useMemo<AppliedPromotionView[]>(() => {
    if (!stove) return [];

    const promos: AppliedPromotionView[] = [];

    items.forEach((item) => {
      if (!item.product || item.parentItemId || item.payByPoints) return;
      const qty = item.quantity;
      const promotionDiscountPerUnit = item.product.promotionDiscountPerUnit ?? 0;
      const isBindableProduct = item.product.tags?.includes("BINDABLE") ?? false;

      if (promotionDiscountPerUnit > 0) {
        promos.push({
          id: `product-promo-${item.id}`,
          label: item.product.productName,
          promoType: "Khuyến mãi sản phẩm",
          quantity: qty,
          cashAmount: promotionDiscountPerUnit * qty,
          pointAmount: 0,
          giftAmount: 0,
        });
      }

      if (isBusinessUser && isBindableProduct) {
        promos.push({
          id: `business-promo-${item.id}`,
          label: item.product.productName,
          promoType: "Ưu đãi khách hàng kinh doanh",
          quantity: qty,
          cashAmount: BUSINESS_BINDABLE_DISCOUNT_AMOUNT * qty,
          pointAmount: 0,
          giftAmount: 0,
        });
      }
    });

    if (isStoveActive && stove.product && stove.defaultProductQuantity) {
      const qty = stove.defaultProductQuantity;
      const promotionDiscountPerUnit = stove.product.promotionDiscountPerUnit ?? 0;
      const isBindableProduct = stove.product.tags?.includes("BINDABLE") ?? false;

      if (promotionDiscountPerUnit > 0) {
        promos.push({
          id: "stove-product-promo",
          label: stove.product.productName,
          promoType: "Khuyến mãi sản phẩm (điểm giao)",
          quantity: qty,
          cashAmount: promotionDiscountPerUnit * qty,
          pointAmount: 0,
          giftAmount: 0,
        });
      }

      if (isBusinessUser && isBindableProduct) {
        promos.push({
          id: "stove-business-promo",
          label: stove.product.productName,
          promoType: "Ưu đãi khách hàng kinh doanh (điểm giao)",
          quantity: qty,
          cashAmount: BUSINESS_BINDABLE_DISCOUNT_AMOUNT * qty,
          pointAmount: 0,
          giftAmount: 0,
        });
      }

      if (stove.defaultPromoChoice === "DISCOUNT_CASH") {
        promos.push({
          id: "stove-cash-promo",
          label: "Ưu đãi điểm giao",
          promoType: "Giảm tiền",
          quantity: qty,
          cashAmount: PROMO_DISCOUNT_CASH_AMOUNT * qty,
          pointAmount: 0,
          giftAmount: 0,
        });
      }

      if (stove.defaultPromoChoice === "BONUS_POINT") {
        promos.push({
          id: "stove-point-promo",
          label: "Ưu đãi điểm giao",
          promoType: "Điểm thưởng",
          quantity: qty,
          cashAmount: 0,
          pointAmount: PROMO_BONUS_POINT_AMOUNT * qty,
          giftAmount: 0,
        });
      }

      if (stove.defaultPromoChoice === "GIFT_PRODUCT" && stove.promoProduct) {
        promos.push({
          id: "stove-gift-promo",
          label: stove.promoProduct.productName,
          promoType: "Quà tặng điểm giao",
          quantity: qty,
          cashAmount: 0,
          pointAmount: 0,
          giftAmount: qty,
        });
      }
    }

    return promos.filter(
      (promo) => promo.cashAmount > 0 || promo.pointAmount > 0 || promo.giftAmount > 0,
    );
  }, [isBusinessUser, isStoveActive, items, stove]);

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
      showToastSuccess("Đã thêm gas từ điểm giao!");
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
        <Collapsible className="w-full rounded-xl border border-gas-green-200 bg-gas-green-50 px-[3vw] py-[2.5vw]">
          <CollapsibleTrigger asChild>
            <button type="button" className="group flex w-full items-center justify-between text-left">
              <span className="font-semibold text-gas-green-800">
                Khuyến mãi áp dụng: ({appliedPromotions.length})
              </span>
              <ChevronDown className="h-4 w-4 text-gas-green-700 transition-transform group-data-[state=open]:rotate-180" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-2">
            {appliedPromotions.length === 0 ? (
              <p className="text-sm text-gray-600">Hiện chưa có khuyến mãi nào được áp dụng.</p>
            ) : (
              appliedPromotions.map((promo) => (
                <div key={promo.id} className="rounded-lg border bg-white p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-900">{promo.label}</p>
                    <span className="text-xs text-gray-500">SL áp dụng: {promo.quantity}</span>
                  </div>
                  <p className="text-xs text-gray-500">Loại: {promo.promoType}</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs font-medium">
                    {promo.cashAmount > 0 && (
                      <span className="text-green-600">💸 -{promo.cashAmount.toLocaleString()}đ</span>
                    )}
                    {promo.pointAmount > 0 && (
                      <span className="text-gas-orange-600">⭐ +{promo.pointAmount.toLocaleString()} điểm</span>
                    )}
                    {promo.giftAmount > 0 && (
                      <span className="text-blue-600">🎁 {promo.giftAmount} quà</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CollapsibleContent>
        </Collapsible>
        {stove && (
          <>
            {isStoveActive ? (
              <StoveSummary stove={stove} onRemove={handleDeactivateStove} />
            ) : (
              <>
                <button
                  onClick={handleActivateStove}
                  className="p-[3vw] w-full bg-gas-green-700 text-white rounded-xl font-bold shadow active:scale-95 transition"
                >
                  Thêm gas từ điểm giao: {stove.name}
                </button>
                <InfoBanner type="warning">
                  Đơn hàng phải có ít nhất 1 sản phẩm gas để được miễn phí ship.
                  Nhân viên có thể yêu cầu thêm phí ship từ{" "}
                  <strong>10,000đ</strong> đến <strong>20,000đ</strong> nếu mua
                  hàng bình thường.
                </InfoBanner>
              </>
            )}

            <NormalCartItems stove={stove} refreshUser={refreshUser} />
          </>
        )}
      </div>
    </div>
  );
}
