declare module "@prisma/client" {
  export type Role = "USER" | "ADMIN" | "STAFF";
  export type UserTag = "BUSINESS";

  export type ProductTag =
    | "BINDABLE"
    | "POINT_EARNABLE"
    | "POINT_EXCHANGABLE"
    | "FREE_SHIP"
    | "PROMO_ELIGIBLE";

  export type PromotionConditionType =
    | "PRODUCT_TAG"
    | "CATEGORY"
    | "MIN_SUBTOTAL"
    | "ORDER_TYPE";

  export type PromotionActionType =
    | "DISCOUNT_PERCENT"
    | "DISCOUNT_AMOUNT"
    | "FREE_SHIP"
    | "BONUS_POINT";

  export type PromoChoiceType = "GIFT_PRODUCT" | "DISCOUNT_CASH" | "BONUS_POINT";
  export type CartType = "NORMAL" | "EXCHANGE";
  export type CartItemType =
    | "GAS"
    | "NORMAL_PRODUCT"
    | "PROMO_BONUS"
    | "POINT_EXCHANGE"
    | "GIFT_PRODUCT";
  export type DiscountSource =
    | "BUSINESS_BINDABLE"
    | "STOVE_PROMO_DISCOUNT"
    | "PROMOTION_RULE";
  export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "DELIVERING"
    | "UNPAID"
    | "COMPLETED"
    | "CANCELLED";

  export interface User { [key: string]: unknown }
  export interface Product { [key: string]: unknown }
  export interface Stove { [key: string]: unknown }
  export interface Cart { [key: string]: unknown }
  export interface CartItem { [key: string]: unknown }
  export interface Category { [key: string]: unknown }

  export namespace Prisma {
    type PromotionGetPayload<T> = any;
    type PromotionInclude = any;
    type PromotionActionCreateWithoutPromotionInput = { type: PromotionActionType };
    type PromotionConditionCreateWithoutPromotionInput = { type: PromotionConditionType };
  }

  export class PrismaClient {
    constructor(...args: any[]);
    [key: string]: any;
  }
}
