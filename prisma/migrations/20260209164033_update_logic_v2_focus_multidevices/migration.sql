/*
  Warnings:

  - You are about to drop the column `userId` on the `Cart` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stoveId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.
  - Made the column `stoveId` on table `Cart` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_stoveId_fkey";

-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_userId_fkey";

-- DropIndex
DROP INDEX "Cart_userId_key";

-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "userId",
ALTER COLUMN "stoveId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cart_stoveId_key" ON "Cart"("stoveId");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_stoveId_fkey" FOREIGN KEY ("stoveId") REFERENCES "Stove"("id") ON DELETE CASCADE ON UPDATE CASCADE;
