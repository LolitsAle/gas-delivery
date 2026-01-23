/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PhoneOtp_phone_idx";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancelledReason" TEXT,
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "shipperId" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "previewImageUrl" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "passwordHash" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "PhoneOtp_phone_code_idx" ON "PhoneOtp"("phone", "code");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shipperId_fkey" FOREIGN KEY ("shipperId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
