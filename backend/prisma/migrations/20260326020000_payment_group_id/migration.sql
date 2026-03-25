-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "groupId" TEXT;

-- CreateIndex
CREATE INDEX "Payment_groupId_idx" ON "Payment"("groupId");
