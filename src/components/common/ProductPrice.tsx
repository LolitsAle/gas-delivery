import { cn } from "@/lib/utils";
import {
  calculateDiscountedProductPrice,
  formatVND,
  ProductDiscountInput,
} from "@/lib/pricing/productPrice";

type ProductPriceProps = ProductDiscountInput & {
  className?: string;
  priceClassName?: string;
  oldPriceClassName?: string;
};

export default function ProductPrice({
  className,
  priceClassName,
  oldPriceClassName,
  ...pricing
}: ProductPriceProps) {
  const price = calculateDiscountedProductPrice(pricing);
  const hasDiscount = price.totalDiscount > 0;

  return (
    <div className={cn("flex flex-col", className)}>
      {hasDiscount && (
        <span
          className={cn(
            "text-gray-400 line-through text-xs",
            oldPriceClassName,
          )}
        >
          {formatVND(price.originalTotalPrice)}
        </span>
      )}

      <span className={cn("font-bold", priceClassName)}>
        {formatVND(price.discountedTotalPrice)}
      </span>
    </div>
  );
}

