import {
  PromotionActionType,
  PromotionConditionType,
  Promotion,
  PromotionAction,
  PromotionCondition,
  ProductTag,
} from "@prisma/client";

export type PromotionFull = Promotion & {
  conditions: PromotionCondition[];
  actions: PromotionAction[];
};

type PromotionContext = {
  productTags?: ProductTag[];
  categoryId?: string | null;
  categoryName?: string | null;
  subtotal?: number;
  orderType?: string;
  now?: Date;
};

const toSafeMoney = (value: number) =>
  Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;

const splitValues = (value?: string | null) =>
  (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const isPromotionActive = (promotion: PromotionFull, now: Date) =>
  promotion.isActive && promotion.startAt <= now && promotion.endAt >= now;

const doesConditionMatch = (
  condition: PromotionCondition,
  context: PromotionContext,
) => {
  const rawValue = condition.value || "";

  switch (condition.type) {
    case PromotionConditionType.PRODUCT_TAG: {
      const tags = splitValues(rawValue);
      if (!tags.length) return true;
      const productTags = context.productTags || [];
      return tags.some((tag) => productTags.includes(tag as ProductTag));
    }

    case PromotionConditionType.CATEGORY: {
      const values = splitValues(rawValue).map((item) => item.toLowerCase());
      if (!values.length) return true;
      const categoryId = (context.categoryId || "").toLowerCase();
      const categoryName = (context.categoryName || "").toLowerCase();
      return values.some((value) => value === categoryId || value === categoryName);
    }

    case PromotionConditionType.MIN_SUBTOTAL: {
      const minSubtotal = Number(rawValue);
      if (!Number.isFinite(minSubtotal) || minSubtotal <= 0) return true;
      return (context.subtotal || 0) >= minSubtotal;
    }

    case PromotionConditionType.ORDER_TYPE: {
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
      promotion.conditions.every((condition) => doesConditionMatch(condition, context)),
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
  unitPrice: number;
}) => {
  const safeUnitPrice = toSafeMoney(unitPrice);
  if (safeUnitPrice <= 0) return { discountPerUnit: 0, promotionIds: [] as string[] };

  const matched = getMatchedPromotions(promotions, context);

  let discountPerUnit = 0;

  for (const promotion of matched) {
    for (const action of promotion.actions) {
      if (action.type === PromotionActionType.DISCOUNT_AMOUNT) {
        discountPerUnit += toSafeMoney(action.value ?? 0);
      }

      if (action.type === PromotionActionType.DISCOUNT_PERCENT) {
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
      .filter((action) => action.type === PromotionActionType.BONUS_POINT)
      .reduce((sum, action) => sum + toSafeMoney(action.value ?? 0), 0);

    return total + bonus;
  }, 0);
};
