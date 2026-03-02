import type { ProductTag, PromotionDiscountableProduct } from "@/lib/types/promotion";

export type CartType = "NORMAL" | "EXCHANGE";
export type PromoChoiceType = "GIFT_PRODUCT" | "DISCOUNT_CASH" | "BONUS_POINT";

export type User = {
  id: string;
  name?: string | null;
  nickname?: string | null;
  phoneNumber?: string | null;
  points?: number;
  tags?: string[];
  isActive?: boolean;
  isVerified?: boolean;
  address?: string | null;
  addressNote?: string | null;
};

export type Product = PromotionDiscountableProduct & {
  id: string;
  productName: string;
  currentPrice: number;
  pointValue?: number | null;
  previewImageUrl?: string | null;
  [key: string]: unknown;
};

export type Stove = {
  id: string;
  name: string;
  address?: string | null;
  note?: string | null;
  houseImage?: string[];
  defaultPromoChoice?: PromoChoiceType | null;
  defaultProductQuantity?: number;
  [key: string]: unknown;
};

export type Cart = {
  id: string;
  type: CartType;
  isStoveActive?: boolean;
  [key: string]: unknown;
};

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  payByPoints: boolean;
  earnPoints: boolean;
  parentItemId?: string | null;
  type: string;
  [key: string]: unknown;
};

export type { ProductTag };
