-- CreateEnum
CREATE TYPE "DiscountSource" AS ENUM ('BUSINESS_BINDABLE', 'STOVE_PROMO_DISCOUNT', 'PROMOTION_RULE');

-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "userTagsSnapshot" "UserTag"[] DEFAULT ARRAY[]::"UserTag"[];

-- AlterTable
ALTER TABLE "OrderItem"
ADD COLUMN "appliedDiscountSources" "DiscountSource"[] DEFAULT ARRAY[]::"DiscountSource"[],
ADD COLUMN "discountPerUnitSnapshot" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "productTagsSnapshot" "ProductTag"[] DEFAULT ARRAY[]::"ProductTag"[];

-- AlterTable
ALTER TABLE "OrderStoveSnapshot"
ADD COLUMN "appliedDiscountSources" "DiscountSource"[] DEFAULT ARRAY[]::"DiscountSource"[],
ADD COLUMN "discountPerUnitSnapshot" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "productTagsSnapshot" "ProductTag"[] DEFAULT ARRAY[]::"ProductTag"[];
