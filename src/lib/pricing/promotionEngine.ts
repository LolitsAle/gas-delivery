import {
  type ProductTag,
  type PromotionAction,
  type PromotionCondition,
  PromotionContext,
  PromotionFull,
  isDiscountAction,
  isPromotionActive,
  splitValues,
  toSafeMoney,
} from "@/lib/types/promotion";
import { calculateOrderLevelDiscount } from "./orderPricing";

const doesConditionMatch = (
  condition: PromotionCondition,
  context: PromotionContext,
) => {
  const rawValue = condition.value || "";

  switch (condition.type) {
    case "PRODUCT_TAG": {
      const tags = splitValues(rawValue).filter(
        (tag): tag is ProductTag => !!tag,
      );
      if (!tags.length) return true;
      const productTags = context.productTags || [];
      return tags.some((tag) => productTags.includes(tag));
    }

    case "CATEGORY": {
      const values = splitValues(rawValue).map((item) => item.toLowerCase());
      if (!values.length) return true;
      const categoryId = (context.categoryId || "").toLowerCase();
      const categoryName = (context.categoryName || "").toLowerCase();
      return values.some(
        (value) => value === categoryId || value === categoryName,
      );
    }

    case "MIN_SUBTOTAL": {
      const minSubtotal = Number(rawValue);
      if (!Number.isFinite(minSubtotal) || minSubtotal <= 0) return true;
      return (context.subtotal || 0) >= minSubtotal;
    }

    case "ORDER_TYPE": {
      if (!rawValue) return true;
      return (context.orderType || "").toUpperCase() === rawValue.toUpperCase();
    }

    default:
      return true;
  }
};

export const getMatchedPromotions = (
  promotions: PromotionFull[],
  context: PromotionContext,
) => {
  const now = context.now || new Date();

  return promotions
    .filter((promotion) => isPromotionActive(promotion, now))
    .filter((promotion) =>
      promotion.conditions.every((condition: PromotionCondition) =>
        doesConditionMatch(condition, context),
      ),
    )
    .sort((a, b) => b.priority - a.priority);
};

export const calculatePromotionDiscountPerUnit = ({
  promotions,
  context,
  unitPrice,
}: {
  promotions: PromotionFull[];
  context: PromotionContext;
  unitPrice: number | null | undefined;
}) => {
  const safeUnitPrice = toSafeMoney(unitPrice ?? 0);
  if (safeUnitPrice <= 0) {
    return { discountPerUnit: 0, promotionIds: [] as string[] };
  }

  const matched = getMatchedPromotions(promotions, context);

  let discountPerUnit = 0;

  for (const promotion of matched) {
    for (const action of promotion.actions) {
      if (action.type === "DISCOUNT_AMOUNT") {
        discountPerUnit += toSafeMoney(action.value ?? 0);
      }

      if (action.type === "DISCOUNT_PERCENT") {
        const percent = Number(action.value ?? 0);
        if (!Number.isFinite(percent) || percent <= 0) continue;

        const calculated = Math.floor((safeUnitPrice * percent) / 100);
        const maxDiscount = toSafeMoney(action.maxDiscount ?? 0);

        discountPerUnit +=
          maxDiscount > 0 ? Math.min(calculated, maxDiscount) : calculated;
      }
    }
  }

  return {
    discountPerUnit: Math.min(discountPerUnit, safeUnitPrice),
    promotionIds: matched.map((item) => item.id),
  };
};

export const calculatePromotionBonusPoints = ({
  promotions,
  context,
}: {
  promotions: PromotionFull[];
  context: PromotionContext;
}) => {
  const matched = getMatchedPromotions(promotions, context);
  return matched.reduce((total, promotion) => {
    const bonus = promotion.actions
      .filter((action: PromotionAction) => action.type === "BONUS_POINT")
      .reduce((sum: number, action: PromotionAction) => sum + toSafeMoney(action.value ?? 0), 0);

    return total + bonus;
  }, 0);
};

const toOrderDiscountAction = (action: PromotionAction) => {
  if (!isDiscountAction(action)) return null;

  return {
    type: action.type,
    value: action.value ?? 0,
    maxDiscount: action.maxDiscount ?? 0,
  };
};

const isOrderDiscountAction = (
  action: ReturnType<typeof toOrderDiscountAction>,
): action is NonNullable<ReturnType<typeof toOrderDiscountAction>> =>
  action !== null;

export const calculateOrderLevelPromotionDiscount = ({
  promotions,
  baseAmount,
}: {
  promotions: PromotionFull[];
  baseAmount: number;
}) => {
  return calculateOrderLevelDiscount({
    promotions: promotions.map((promotion) => ({
      id: promotion.id,
      actions: promotion.actions.map(toOrderDiscountAction).filter(isOrderDiscountAction),
    })),
    baseAmount,
  });
};

export type { PromotionContext, PromotionFull } from "@/lib/types/promotion";
