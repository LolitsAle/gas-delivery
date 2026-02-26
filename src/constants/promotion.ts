const toPositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

export const PROMO_DISCOUNT_CASH_AMOUNT = toPositiveInt(
  process.env.PROMO_DISCOUNT_CASH_AMOUNT ??
    process.env.NEXT_PUBLIC_PROMO_DISCOUNT_CASH_AMOUNT,
  10000,
);

export const PROMO_BONUS_POINT_AMOUNT = toPositiveInt(
  process.env.PROMO_BONUS_POINT_AMOUNT ??
    process.env.NEXT_PUBLIC_PROMO_BONUS_POINT_AMOUNT,
  1000,
);

export const BUSINESS_BINDABLE_DISCOUNT_AMOUNT = toPositiveInt(
  process.env.BUSINESS_BINDABLE_DISCOUNT_AMOUNT ??
    process.env.NEXT_PUBLIC_BUSINESS_BINDABLE_DISCOUNT_AMOUNT,
  10000,
);

