-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "lastAdjustmentAt" TIMESTAMP(3),
ADD COLUMN     "quarterlyAdjustmentEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quarterlyAdjustmentPercent" DOUBLE PRECISION NOT NULL DEFAULT 0;
