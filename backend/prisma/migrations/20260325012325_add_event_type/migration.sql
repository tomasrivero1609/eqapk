-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SALON', 'VISITA', 'FRANCO');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "eventType" "EventType" NOT NULL DEFAULT 'SALON';
