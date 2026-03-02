import type {
  ProductTag,
  Promotion,
  PromotionAction,
  PromotionActionType,
  PromotionCondition,
  PromotionConditionType,
} from "@prisma/client";

export type PromotionFull = Promotion & {
  conditions: PromotionCondition[];
  actions: PromotionAction[];
};

export type PromotionContext = {
  productTags?: ProductTag[];
  categoryId?: string | null;
  categoryName?: string | null;
  subtotal?: number;
  orderType?: string;
  now?: Date;
};

export const PROMOTION_CONDITION_TYPES = [
  "PRODUCT_TAG",
  "CATEGORY",
  "MIN_SUBTOTAL",
  "ORDER_TYPE",
] as const satisfies readonly PromotionConditionType[];

export const PROMOTION_ACTION_TYPES = [
  "DISCOUNT_PERCENT",
  "DISCOUNT_AMOUNT",
  "FREE_SHIP",
  "BONUS_POINT",
] as const satisfies readonly PromotionActionType[];

export const PRODUCT_TAGS = [
  "BINDABLE",
  "POINT_EARNABLE",
  "POINT_EXCHANGABLE",
  "FREE_SHIP",
  "PROMO_ELIGIBLE",
] as const satisfies readonly ProductTag[];

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
): action is Pick<OrderDiscountAction, "type"> =>
  action.type === "DISCOUNT_AMOUNT" || action.type === "DISCOUNT_PERCENT";

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
