-- AddForeignKey
ALTER TABLE "Stove" ADD CONSTRAINT "Stove_defaultPromoProductId_fkey" FOREIGN KEY ("defaultPromoProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
