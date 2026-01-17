/*
  Warnings:

  - You are about to drop the `Coupon` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderCoupon` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderCoupon" DROP CONSTRAINT "OrderCoupon_couponId_fkey";

-- DropForeignKey
ALTER TABLE "OrderCoupon" DROP CONSTRAINT "OrderCoupon_orderId_fkey";

-- AlterTable
ALTER TABLE "Stove" ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT;

-- DropTable
DROP TABLE "Coupon";

-- DropTable
DROP TABLE "OrderCoupon";
