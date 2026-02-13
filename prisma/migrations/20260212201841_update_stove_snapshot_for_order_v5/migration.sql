/*
  Warnings:

  - Added the required column `stoveName` to the `OrderStoveSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderStoveSnapshot" ADD COLUMN     "stoveName" TEXT NOT NULL;
