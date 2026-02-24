/*
  Warnings:

  - The values [READY] on the enum `OrderStatus` will be removed.
  - Existing READY orders are migrated to DELIVERING.
*/

ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DELIVERING', 'UNPAID', 'COMPLETED', 'CANCELLED');

ALTER TABLE "Order"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "OrderStatus"
  USING (
    CASE
      WHEN "status"::text = 'READY' THEN 'DELIVERING'
      ELSE "status"::text
    END
  )::"OrderStatus";

DROP TYPE "OrderStatus_old";

ALTER TABLE "Order"
  ALTER COLUMN "status" SET DEFAULT 'PENDING';
