/*
  Warnings:

  - You are about to drop the column `houseImage` on the `OrderStoveSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `OrderStoveSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `stoveName` on the `OrderStoveSnapshot` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "OrderStoveSnapshot_orderId_idx";

-- AlterTable
ALTER TABLE "OrderStoveSnapshot" DROP COLUMN "houseImage",
DROP COLUMN "productName",
DROP COLUMN "stoveName",
ADD COLUMN     "promoChoice" "PromoChoiceType",
ADD COLUMN     "promoProductId" TEXT,
ADD COLUMN     "promoProductQuantity" INTEGER,
ADD COLUMN     "promoProductUnitPrice" INTEGER DEFAULT 0;
