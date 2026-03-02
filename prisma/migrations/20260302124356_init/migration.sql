-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('REPAIR', 'INSPECTION', 'CLEANING', 'INSTALLATION');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DELIVERING', 'UNPAID', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('NORMAL', 'EXCHANGE');

-- CreateEnum
CREATE TYPE "CartType" AS ENUM ('NORMAL', 'EXCHANGE');

-- CreateEnum
CREATE TYPE "CartItemType" AS ENUM ('GAS', 'NORMAL_PRODUCT', 'PROMO_BONUS', 'POINT_EXCHANGE', 'GIFT_PRODUCT');

-- CreateEnum
CREATE TYPE "OrderItemType" AS ENUM ('GAS', 'NORMAL_PRODUCT', 'PROMO_BONUS', 'POINT_EXCHANGE', 'GIFT_PRODUCT');

-- CreateEnum
CREATE TYPE "ProductTag" AS ENUM ('BINDABLE', 'POINT_EARNABLE', 'POINT_EXCHANGABLE', 'FREE_SHIP', 'PROMO_ELIGIBLE');

-- CreateEnum
CREATE TYPE "DiscountSource" AS ENUM ('BUSINESS_BINDABLE', 'STOVE_PROMO_DISCOUNT', 'PROMOTION_RULE');

-- CreateEnum
CREATE TYPE "PromotionConditionType" AS ENUM ('PRODUCT_TAG', 'CATEGORY', 'MIN_SUBTOTAL', 'ORDER_TYPE');

-- CreateEnum
CREATE TYPE "PromotionActionType" AS ENUM ('DISCOUNT_PERCENT', 'DISCOUNT_AMOUNT', 'FREE_SHIP', 'BONUS_POINT');

-- CreateEnum
CREATE TYPE "PromoChoiceType" AS ENUM ('GIFT_PRODUCT', 'DISCOUNT_CASH', 'BONUS_POINT');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('PENDING', 'CHECKING', 'FIXING', 'DONE', 'CANNOT_FIX');

-- CreateEnum
CREATE TYPE "UserTag" AS ENUM ('BUSINESS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "nickname" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "address" TEXT,
    "addressNote" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tags" "UserTag"[] DEFAULT ARRAY[]::"UserTag"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "replacedByTokenHash" TEXT,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneOtp" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhoneOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tags" "ProductTag"[],

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "currentPrice" INTEGER NOT NULL,
    "pointValue" INTEGER NOT NULL DEFAULT 0,
    "previewImageUrl" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "categoryId" TEXT NOT NULL,
    "tags" "ProductTag"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "category" "ServiceCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stove" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "address" TEXT NOT NULL,
    "note" TEXT,
    "houseImage" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "houseImageCount" INTEGER NOT NULL DEFAULT 0,
    "defaultProductQuantity" INTEGER NOT NULL DEFAULT 1,
    "defaultPromoChoice" "PromoChoiceType",
    "defaultPromoProductId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stove_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "stoveId" TEXT NOT NULL,
    "type" "CartType" NOT NULL DEFAULT 'NORMAL',
    "isStoveActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" "CartItemType" NOT NULL,
    "parentItemId" TEXT,
    "payByPoints" BOOLEAN NOT NULL DEFAULT false,
    "earnPoints" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartServiceItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "stoveId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartServiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stoveId" TEXT NOT NULL,
    "type" "OrderType" NOT NULL DEFAULT 'NORMAL',
    "subtotal" INTEGER NOT NULL,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "shipFee" INTEGER NOT NULL DEFAULT 0,
    "totalPrice" INTEGER NOT NULL,
    "shipperId" TEXT,
    "pointsUsed" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "pointsSettled" BOOLEAN NOT NULL DEFAULT false,
    "userTagsSnapshot" "UserTag"[] DEFAULT ARRAY[]::"UserTag"[],
    "confirmedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledReason" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" INTEGER NOT NULL DEFAULT 0,
    "unitPointPrice" INTEGER DEFAULT 0,
    "productTagsSnapshot" "ProductTag"[] DEFAULT ARRAY[]::"ProductTag"[],
    "discountPerUnitSnapshot" INTEGER NOT NULL DEFAULT 0,
    "appliedDiscountSources" "DiscountSource"[] DEFAULT ARRAY[]::"DiscountSource"[],
    "type" "OrderItemType" NOT NULL,
    "parentItemId" TEXT,
    "payByPoints" BOOLEAN NOT NULL DEFAULT false,
    "earnPoints" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStoveSnapshot" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "stoveName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "note" TEXT,
    "productId" TEXT,
    "productName" TEXT,
    "unitPrice" INTEGER,
    "quantity" INTEGER,
    "productTagsSnapshot" "ProductTag"[] DEFAULT ARRAY[]::"ProductTag"[],
    "discountPerUnitSnapshot" INTEGER NOT NULL DEFAULT 0,
    "appliedDiscountSources" "DiscountSource"[] DEFAULT ARRAY[]::"DiscountSource"[],
    "promoChoice" "PromoChoiceType",
    "promoProductId" TEXT,
    "promoProductName" TEXT,
    "promoProductQuantity" INTEGER,
    "promoProductUnitPrice" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStoveSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderServiceItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "stoveId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "note" TEXT,
    "status" "ServiceStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderServiceItem_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "PhoneOtp_phone_code_idx" ON "PhoneOtp"("phone", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Stove_userId_idx" ON "Stove"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_stoveId_key" ON "Cart"("stoveId");

-- CreateIndex
CREATE INDEX "CartServiceItem_cartId_idx" ON "CartServiceItem"("cartId");

-- CreateIndex
CREATE INDEX "CartServiceItem_stoveId_idx" ON "CartServiceItem"("stoveId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderStoveSnapshot_orderId_key" ON "OrderStoveSnapshot"("orderId");

-- CreateIndex
CREATE INDEX "OrderServiceItem_orderId_idx" ON "OrderServiceItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderServiceItem_stoveId_idx" ON "OrderServiceItem"("stoveId");

-- CreateIndex
CREATE INDEX "PromotionCondition_promotionId_idx" ON "PromotionCondition"("promotionId");

-- CreateIndex
CREATE INDEX "PromotionAction_promotionId_idx" ON "PromotionAction"("promotionId");

-- CreateIndex
CREATE INDEX "OrderPromotion_orderId_idx" ON "OrderPromotion"("orderId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stove" ADD CONSTRAINT "Stove_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stove" ADD CONSTRAINT "Stove_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stove" ADD CONSTRAINT "Stove_defaultPromoProductId_fkey" FOREIGN KEY ("defaultPromoProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_stoveId_fkey" FOREIGN KEY ("stoveId") REFERENCES "Stove"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "CartItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartServiceItem" ADD CONSTRAINT "CartServiceItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartServiceItem" ADD CONSTRAINT "CartServiceItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartServiceItem" ADD CONSTRAINT "CartServiceItem_stoveId_fkey" FOREIGN KEY ("stoveId") REFERENCES "Stove"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shipperId_fkey" FOREIGN KEY ("shipperId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_stoveId_fkey" FOREIGN KEY ("stoveId") REFERENCES "Stove"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStoveSnapshot" ADD CONSTRAINT "OrderStoveSnapshot_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderServiceItem" ADD CONSTRAINT "OrderServiceItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderServiceItem" ADD CONSTRAINT "OrderServiceItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderServiceItem" ADD CONSTRAINT "OrderServiceItem_stoveId_fkey" FOREIGN KEY ("stoveId") REFERENCES "Stove"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionCondition" ADD CONSTRAINT "PromotionCondition_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionAction" ADD CONSTRAINT "PromotionAction_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderPromotion" ADD CONSTRAINT "OrderPromotion_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderPromotion" ADD CONSTRAINT "OrderPromotion_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
