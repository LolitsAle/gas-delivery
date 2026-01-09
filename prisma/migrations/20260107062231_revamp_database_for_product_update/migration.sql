/*
  Warnings:

  - You are about to drop the column `quantity` on the `Product` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('NORMAL', 'EXCHANGE');

-- CreateEnum
CREATE TYPE "GasType" AS ENUM ('GAS_12KG', 'GAS_25KG');

-- CreateEnum
CREATE TYPE "ProductTag" AS ENUM ('POINTS_EXCHANGABLE');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "stoveId" TEXT,
ADD COLUMN     "type" "OrderType" NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pointsEarned" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "quantity",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "pointValue" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tags" "ProductTag"[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "freeShip" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPriceHistory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stove" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "gasType" "GasType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stove_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "ProductPriceHistory_productId_idx" ON "ProductPriceHistory"("productId");

-- CreateIndex
CREATE INDEX "Stove_userId_idx" ON "Stove"("userId");

-- CreateIndex
CREATE INDEX "OrderCoupon_orderId_idx" ON "OrderCoupon"("orderId");

-- CreateIndex
CREATE INDEX "OrderCoupon_couponId_idx" ON "OrderCoupon"("couponId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPriceHistory" ADD CONSTRAINT "ProductPriceHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stove" ADD CONSTRAINT "Stove_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_stoveId_fkey" FOREIGN KEY ("stoveId") REFERENCES "Stove"("id") ON DELETE SET NULL ON UPDATE CASCADE;
