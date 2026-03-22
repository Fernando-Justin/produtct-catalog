-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANEJADO', 'EM_ANDAMENTO', 'PAUSADO', 'FINALIZADO');

-- AlterTable
ALTER TABLE "roadmap_items" ADD COLUMN     "finishDateAtividade" TIMESTAMP(3),
ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "startDateAtividade" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANEJADO',
    "startDate" TIMESTAMP(3) NOT NULL,
    "forecastDate" TIMESTAMP(3) NOT NULL,
    "finishDate" TIMESTAMP(3),
    "documentationLink" TEXT,
    "poId" INTEGER NOT NULL,
    "riskPoint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_poId_fkey" FOREIGN KEY ("poId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_items" ADD CONSTRAINT "roadmap_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
