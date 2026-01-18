-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "exchangeRateDate" TIMESTAMP(3),
ADD COLUMN     "platesCovered" INTEGER,
ADD COLUMN     "pricePerDishAtPayment" DOUBLE PRECISION;
