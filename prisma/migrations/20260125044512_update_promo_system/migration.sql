/*
  Warnings:

  - The values [PRODUCT,SERVICE,PART] on the enum `CartItemType` will be removed. If these variants are still used in the database, this will fail.
  - The values [PRODUCT,SERVICE,PART] on the enum `OrderItemType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "PromoChoiceType" AS ENUM ('GIFT_PRODUCT', 'DISCOUNT_CASH', 'BONUS_POINT');

-- AlterEnum
BEGIN;
CREATE TYPE "CartItemType_new" AS ENUM ('GAS', 'NORMAL_PRODUCT', 'PROMO_BONUS', 'POINT_EXCHANGE');
ALTER TABLE "CartItem" ALTER COLUMN "type" TYPE "CartItemType_new" USING ("type"::text::"CartItemType_new");
ALTER TYPE "CartItemType" RENAME TO "CartItemType_old";
ALTER TYPE "CartItemType_new" RENAME TO "CartItemType";
DROP TYPE "public"."CartItemType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrderItemType_new" AS ENUM ('GAS', 'NORMAL_PRODUCT', 'PROMO_BONUS', 'POINT_EXCHANGE');
ALTER TABLE "OrderItem" ALTER COLUMN "type" TYPE "OrderItemType_new" USING ("type"::text::"OrderItemType_new");
ALTER TYPE "OrderItemType" RENAME TO "OrderItemType_old";
ALTER TYPE "OrderItemType_new" RENAME TO "OrderItemType";
DROP TYPE "public"."OrderItemType_old";
COMMIT;

-- DropIndex
DROP INDEX "CartItem_cartId_productId_key";

-- DropIndex
DROP INDEX "OrderItem_orderId_idx";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "parentItemId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "parentItemId" TEXT;

-- AlterTable
ALTER TABLE "Stove" ADD COLUMN     "defaultProductQuantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "defaultPromoChoice" "PromoChoiceType",
ADD COLUMN     "defaultPromoProductId" TEXT;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "CartItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
