import type { Prisma } from "@prisma/client";

export const PROMOTION_CONDITION = {
  PRODUCT_TAG: "PRODUCT_TAG",
  CATEGORY: "CATEGORY",
  MIN_SUBTOTAL: "MIN_SUBTOTAL",
  ORDER_TYPE: "ORDER_TYPE",
} as const;

export const PROMOTION_ACTION = {
  DISCOUNT_PERCENT: "DISCOUNT_PERCENT",
  DISCOUNT_AMOUNT: "DISCOUNT_AMOUNT",
  FREE_SHIP: "FREE_SHIP",
  BONUS_POINT: "BONUS_POINT",
} as const;

export const PRODUCT_TAG = {
  BINDABLE: "BINDABLE",
  POINT_EARNABLE: "POINT_EARNABLE",
  POINT_EXCHANGABLE: "POINT_EXCHANGABLE",
  FREE_SHIP: "FREE_SHIP",
  PROMO_ELIGIBLE: "PROMO_ELIGIBLE",
} as const;

export type PromotionConditionType =
  (typeof PROMOTION_CONDITION)[keyof typeof PROMOTION_CONDITION];
export type PromotionActionType =
  (typeof PROMOTION_ACTION)[keyof typeof PROMOTION_ACTION];
export type ProductTag = (typeof PRODUCT_TAG)[keyof typeof PRODUCT_TAG];

export const PROMOTION_CONDITION_TYPES = Object.values(PROMOTION_CONDITION);
export const PROMOTION_ACTION_TYPES = Object.values(PROMOTION_ACTION);
export const PRODUCT_TAGS = Object.values(PRODUCT_TAG);

export type PromotionFull = Prisma.PromotionGetPayload<{
  include: {
    conditions: true;
    actions: true;
  };
}>;

export type PromotionAction = PromotionFull["actions"][number];
export type PromotionCondition = PromotionFull["conditions"][number];

export type PromotionContext = {
  productTags?: ProductTag[];
  categoryId?: string | null;
  categoryName?: string | null;
  subtotal?: number;
  orderType?: string;
  now?: Date;
};

export type OrderDiscountActionType = Extract<
  PromotionActionType,
  "DISCOUNT_PERCENT" | "DISCOUNT_AMOUNT"
>;

export type OrderDiscountAction = Omit<PromotionAction, "type"> & {
  type: OrderDiscountActionType;
};

export type OrderLevelPromotionLike = {
  id: string;
  actions: OrderDiscountAction[];
};

export type PromotionDiscountableProduct = {
  currentPrice: number | null;
  tags: ProductTag[];
  category?: { id?: string | null; name?: string | null } | null;
};

export const toSafeMoney = (value: number) =>
  Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;

export const splitValues = (value?: string | null) =>
  (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const isPromotionActive = (promotion: PromotionFull, now: Date) =>
  promotion.isActive && promotion.startAt <= now && promotion.endAt >= now;

export const isDiscountAction = (
  action: Pick<PromotionAction, "type">,
 ): action is OrderDiscountAction =>
  action.type === PROMOTION_ACTION.DISCOUNT_AMOUNT ||
  action.type === PROMOTION_ACTION.DISCOUNT_PERCENT;

export const isPromotionActionType = (
  value: unknown,
): value is PromotionActionType =>
  typeof value === "string" &&
  (PROMOTION_ACTION_TYPES as readonly string[]).includes(value);

export const isPromotionConditionType = (
  value: unknown,
): value is PromotionConditionType =>
  typeof value === "string" &&
  (PROMOTION_CONDITION_TYPES as readonly string[]).includes(value);

export const isProductTag = (value: unknown): value is ProductTag =>
  typeof value === "string" &&
  (PRODUCT_TAGS as readonly string[]).includes(value);
