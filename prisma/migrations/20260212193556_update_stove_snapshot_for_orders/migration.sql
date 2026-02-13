-- CreateTable
CREATE TABLE "OrderStoveSnapshot" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "stoveName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "note" TEXT,
    "houseImage" TEXT[],
    "productId" TEXT,
    "productName" TEXT,
    "unitPrice" INTEGER,
    "quantity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStoveSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderStoveSnapshot_orderId_key" ON "OrderStoveSnapshot"("orderId");

-- CreateIndex
CREATE INDEX "OrderStoveSnapshot_orderId_idx" ON "OrderStoveSnapshot"("orderId");

-- AddForeignKey
ALTER TABLE "OrderStoveSnapshot" ADD CONSTRAINT "OrderStoveSnapshot_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
