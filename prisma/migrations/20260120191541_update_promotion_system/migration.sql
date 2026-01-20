-- CreateEnum
CREATE TYPE "PromotionConditionType" AS ENUM ('PRODUCT_TAG', 'CATEGORY', 'MIN_SUBTOTAL', 'ORDER_TYPE');

-- CreateEnum
CREATE TYPE "PromotionActionType" AS ENUM ('DISCOUNT_PERCENT', 'DISCOUNT_AMOUNT', 'FREE_SHIP', 'BONUS_POINT');

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionCondition" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "type" "PromotionConditionType" NOT NULL,
    "value" TEXT,

    CONSTRAINT "PromotionCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionAction" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "type" "PromotionActionType" NOT NULL,
    "value" INTEGER,
    "maxDiscount" INTEGER,

    CONSTRAINT "PromotionAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderPromotion" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "freeShip" BOOLEAN NOT NULL DEFAULT false,
    "bonusPoint" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OrderPromotion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromotionCondition_promotionId_idx" ON "PromotionCondition"("promotionId");

-- CreateIndex
CREATE INDEX "PromotionAction_promotionId_idx" ON "PromotionAction"("promotionId");

-- CreateIndex
CREATE INDEX "OrderPromotion_orderId_idx" ON "OrderPromotion"("orderId");

-- AddForeignKey
ALTER TABLE "PromotionCondition" ADD CONSTRAINT "PromotionCondition_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionAction" ADD CONSTRAINT "PromotionAction_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderPromotion" ADD CONSTRAINT "OrderPromotion_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderPromotion" ADD CONSTRAINT "OrderPromotion_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
