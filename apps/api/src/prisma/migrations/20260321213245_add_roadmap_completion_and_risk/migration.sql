-- AlterTable
ALTER TABLE "roadmap_items" ADD COLUMN     "completion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "riskPoint" TEXT;
