-- CreateEnum
CREATE TYPE "UserTag" AS ENUM ('BUSINESS');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tags" "UserTag"[] DEFAULT ARRAY[]::"UserTag"[];
