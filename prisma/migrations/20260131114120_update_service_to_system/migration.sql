-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('REPAIR', 'INSPECTION', 'CLEANING', 'INSTALLATION');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('PENDING', 'CHECKING', 'FIXING', 'DONE', 'CANNOT_FIX');

-- AlterTable
ALTER TABLE "Stove" ALTER COLUMN "houseImage" SET DEFAULT ARRAY[]::TEXT[];

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

-- CreateIndex
CREATE INDEX "CartServiceItem_cartId_idx" ON "CartServiceItem"("cartId");

-- CreateIndex
CREATE INDEX "CartServiceItem_stoveId_idx" ON "CartServiceItem"("stoveId");

-- CreateIndex
CREATE INDEX "OrderServiceItem_orderId_idx" ON "OrderServiceItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderServiceItem_stoveId_idx" ON "OrderServiceItem"("stoveId");

-- AddForeignKey
ALTER TABLE "CartServiceItem" ADD CONSTRAINT "CartServiceItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartServiceItem" ADD CONSTRAINT "CartServiceItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartServiceItem" ADD CONSTRAINT "CartServiceItem_stoveId_fkey" FOREIGN KEY ("stoveId") REFERENCES "Stove"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderServiceItem" ADD CONSTRAINT "OrderServiceItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderServiceItem" ADD CONSTRAINT "OrderServiceItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderServiceItem" ADD CONSTRAINT "OrderServiceItem_stoveId_fkey" FOREIGN KEY ("stoveId") REFERENCES "Stove"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
