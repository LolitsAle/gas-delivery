/*
  Warnings:

  - You are about to drop the column `houseImage` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `houseImageCount` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stove" ADD COLUMN     "houseImage" TEXT[],
ADD COLUMN     "houseImageCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "houseImage",
DROP COLUMN "houseImageCount";
