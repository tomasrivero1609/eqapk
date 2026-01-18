/*
  Warnings:

  - The values [MXN] on the enum `Currency` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Currency_new" AS ENUM ('ARS', 'USD');
ALTER TABLE "public"."Event" ALTER COLUMN "currency" DROP DEFAULT;
ALTER TABLE "public"."Payment" ALTER COLUMN "currency" DROP DEFAULT;
ALTER TABLE "Event" ALTER COLUMN "currency" TYPE "Currency_new" USING ("currency"::text::"Currency_new");
ALTER TABLE "Payment" ALTER COLUMN "currency" TYPE "Currency_new" USING ("currency"::text::"Currency_new");
ALTER TYPE "Currency" RENAME TO "Currency_old";
ALTER TYPE "Currency_new" RENAME TO "Currency";
DROP TYPE "public"."Currency_old";
ALTER TABLE "Event" ALTER COLUMN "currency" SET DEFAULT 'ARS';
ALTER TABLE "Payment" ALTER COLUMN "currency" SET DEFAULT 'ARS';
COMMIT;

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "currency" SET DEFAULT 'ARS';

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "currency" SET DEFAULT 'ARS';
