/*
  Warnings:

  - The `houseImage` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "houseImage",
ADD COLUMN     "houseImage" TEXT[];

UPDATE "User"
SET "houseImage" = ARRAY["houseImage"]
WHERE "houseImage" IS NOT NULL;
