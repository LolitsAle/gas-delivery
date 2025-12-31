/*
  Warnings:

  - You are about to drop the column `token` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `RefreshToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tokenHash` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "RefreshToken_token_key";

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "token",
DROP COLUMN "updatedAt",
ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "replacedByTokenHash" TEXT,
ADD COLUMN     "tokenHash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sessionVersion" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
