-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('PHONE_OTP', 'PASSWORD', 'ZALO', 'FACEBOOK');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "authProvider" "AuthProvider" NOT NULL DEFAULT 'PHONE_OTP',
ADD COLUMN "providerUserId" TEXT,
ADD COLUMN "needsPhoneNumber" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "User_authProvider_providerUserId_key" ON "User"("authProvider", "providerUserId");
