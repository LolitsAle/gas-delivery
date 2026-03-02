export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  DELIVERING: "DELIVERING",
  UNPAID: "UNPAID",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const CART_TYPE = {
  NORMAL: "NORMAL",
  EXCHANGE: "EXCHANGE",
} as const;

export type CartType = (typeof CART_TYPE)[keyof typeof CART_TYPE];

export const CART_ITEM_TYPE = {
  GAS: "GAS",
  NORMAL_PRODUCT: "NORMAL_PRODUCT",
  PROMO_BONUS: "PROMO_BONUS",
  POINT_EXCHANGE: "POINT_EXCHANGE",
  GIFT_PRODUCT: "GIFT_PRODUCT",
} as const;

export type CartItemType = (typeof CART_ITEM_TYPE)[keyof typeof CART_ITEM_TYPE];

export const PROMO_CHOICE_TYPE = {
  GIFT_PRODUCT: "GIFT_PRODUCT",
  DISCOUNT_CASH: "DISCOUNT_CASH",
  BONUS_POINT: "BONUS_POINT",
} as const;

export type PromoChoiceType =
  (typeof PROMO_CHOICE_TYPE)[keyof typeof PROMO_CHOICE_TYPE];

export const DISCOUNT_SOURCE = {
  BUSINESS_BINDABLE: "BUSINESS_BINDABLE",
  STOVE_PROMO_DISCOUNT: "STOVE_PROMO_DISCOUNT",
  PROMOTION_RULE: "PROMOTION_RULE",
} as const;

export type DiscountSource =
  (typeof DISCOUNT_SOURCE)[keyof typeof DISCOUNT_SOURCE];
