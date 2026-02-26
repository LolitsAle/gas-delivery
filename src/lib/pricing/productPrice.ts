import { BUSINESS_BINDABLE_DISCOUNT_AMOUNT } from "@/constants/promotion";

export type ProductDiscountInput = {
  unitPrice: number;
  quantity?: number;
  snapshotDiscountPerUnit?: number;
  isBusinessUser?: boolean;
  isBindableProduct?: boolean;
  promotionDiscountPerUnit?: number;
  stovePromoDiscountPerUnit?: number;
};

export type ProductDiscountBreakdown = {
  quantity: number;
  originalUnitPrice: number;
  discountedUnitPrice: number;
  originalTotalPrice: number;
  discountedTotalPrice: number;
  discountPerUnit: number;
  totalDiscount: number;
};

const toSafeMoney = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value);
};

export const calculateDiscountedProductPrice = ({
  unitPrice,
  quantity = 1,
  snapshotDiscountPerUnit,
  isBusinessUser = false,
  isBindableProduct = false,
  promotionDiscountPerUnit = 0,
  stovePromoDiscountPerUnit = 0,
}: ProductDiscountInput): ProductDiscountBreakdown => {
  const safeUnitPrice = toSafeMoney(unitPrice);
  const safeQuantity =
    Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;

  const explicitSnapshotDiscount = toSafeMoney(snapshotDiscountPerUnit ?? 0);

  if (explicitSnapshotDiscount > 0) {
    const discountPerUnit = Math.min(safeUnitPrice, explicitSnapshotDiscount);
    const discountedUnitPrice = Math.max(safeUnitPrice - discountPerUnit, 0);

    return {
      quantity: safeQuantity,
      originalUnitPrice: safeUnitPrice,
      discountedUnitPrice,
      originalTotalPrice: safeUnitPrice * safeQuantity,
      discountedTotalPrice: discountedUnitPrice * safeQuantity,
      discountPerUnit,
      totalDiscount: discountPerUnit * safeQuantity,
    };
  }

  // Ưu tiên tính discount từ promotion trước.
  const promotionDiscount = toSafeMoney(promotionDiscountPerUnit);
  const businessDiscount =
    isBusinessUser && isBindableProduct
      ? toSafeMoney(BUSINESS_BINDABLE_DISCOUNT_AMOUNT)
      : 0;
  const stoveDiscount = toSafeMoney(stovePromoDiscountPerUnit);

  const discountPerUnit = Math.min(
    safeUnitPrice,
    promotionDiscount + businessDiscount + stoveDiscount,
  );

  const discountedUnitPrice = Math.max(safeUnitPrice - discountPerUnit, 0);

  return {
    quantity: safeQuantity,
    originalUnitPrice: safeUnitPrice,
    discountedUnitPrice,
    originalTotalPrice: safeUnitPrice * safeQuantity,
    discountedTotalPrice: discountedUnitPrice * safeQuantity,
    discountPerUnit,
    totalDiscount: discountPerUnit * safeQuantity,
  };
};

export const formatVND = (value: number) =>
  `${Math.max(0, Math.floor(value)).toLocaleString()}đ`;
