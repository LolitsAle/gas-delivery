import { OrderLevelPromotionLike, toSafeMoney } from "@/lib/types/promotion";

export type { OrderDiscountAction, OrderLevelPromotionLike } from "@/lib/types/promotion";

export const calculateOrderLevelDiscount = ({
  promotions,
  baseAmount,
}: {
  promotions: OrderLevelPromotionLike[];
  baseAmount: number;
}) => {
  const safeBaseAmount = toSafeMoney(baseAmount);

  if (safeBaseAmount <= 0) {
    return {
      totalDiscount: 0,
      perPromotionDiscount: [] as Array<{
        promotionId: string;
        discountAmount: number;
      }>,
    };
  }

  const perPromotionDiscount = promotions.map((promotion) => {
    let discountAmount = 0;

    for (const action of promotion.actions) {
      if (action.type === "DISCOUNT_AMOUNT") {
        discountAmount += toSafeMoney(action.value ?? 0);
      }

      if (action.type === "DISCOUNT_PERCENT") {
        const percent = Number(action.value ?? 0);
        if (!Number.isFinite(percent) || percent <= 0) continue;

        const computed = Math.floor((safeBaseAmount * percent) / 100);
        const maxDiscount = toSafeMoney(action.maxDiscount ?? 0);

        discountAmount +=
          maxDiscount > 0 ? Math.min(computed, maxDiscount) : computed;
      }
    }

    return {
      promotionId: promotion.id,
      discountAmount: Math.min(discountAmount, safeBaseAmount),
    };
  });

  return {
    totalDiscount: Math.min(
      perPromotionDiscount.reduce((sum, item) => sum + item.discountAmount, 0),
      safeBaseAmount,
    ),
    perPromotionDiscount,
  };
};

export const calculateCheckoutTotals = ({
  itemsSubtotal,
  itemDiscountTotal,
  orderPromotions,
  shippingFee = 0,
  serviceFee = 0,
}: {
  itemsSubtotal: number;
  itemDiscountTotal: number;
  orderPromotions: OrderLevelPromotionLike[];
  shippingFee?: number;
  serviceFee?: number;
}) => {
  const safeItemsSubtotal = toSafeMoney(itemsSubtotal);
  const safeItemDiscountTotal = Math.min(
    toSafeMoney(itemDiscountTotal),
    safeItemsSubtotal,
  );

  const subtotalAfterItemDiscount = Math.max(
    safeItemsSubtotal - safeItemDiscountTotal,
    0,
  );

  const { totalDiscount: orderDiscountTotal, perPromotionDiscount } =
    calculateOrderLevelDiscount({
      promotions: orderPromotions,
      baseAmount: subtotalAfterItemDiscount,
    });

  const totalDiscount = Math.min(
    safeItemDiscountTotal + orderDiscountTotal,
    safeItemsSubtotal,
  );

  const totalPrice = Math.max(
    safeItemsSubtotal -
      totalDiscount +
      toSafeMoney(shippingFee) +
      toSafeMoney(serviceFee),
    0,
  );

  return {
    itemsSubtotal: safeItemsSubtotal,
    itemDiscountTotal: safeItemDiscountTotal,
    subtotalAfterItemDiscount,
    orderDiscountTotal,
    totalDiscount,
    totalPrice,
    perPromotionDiscount,
  };
};
