/*
  Warnings:

  - The `assigneeId` column on the `roadmap_items` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `userId` on the `product_devs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "product_devs" DROP CONSTRAINT "product_devs_userId_fkey";

-- DropForeignKey
ALTER TABLE "roadmap_items" DROP CONSTRAINT "roadmap_items_assigneeId_fkey";

-- AlterTable
ALTER TABLE "product_devs" DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "roadmap_items" DROP COLUMN "assigneeId",
ADD COLUMN     "assigneeId" INTEGER;

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "admissionDate" TIMESTAMP(3),
ADD COLUMN     "bairro" VARCHAR(80),
ADD COLUMN     "cep" CHAR(8),
ADD COLUMN     "cidade" VARCHAR(80),
ADD COLUMN     "complemento" VARCHAR(50),
ADD COLUMN     "cpf" CHAR(11),
ADD COLUMN     "emailCorporate" VARCHAR(100),
ADD COLUMN     "estado" CHAR(2),
ADD COLUMN     "fullName" VARCHAR(150),
ADD COLUMN     "idAppRh" VARCHAR(20),
ADD COLUMN     "logradouro" VARCHAR(150),
ADD COLUMN     "numero" VARCHAR(10),
ADD COLUMN     "observations" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "product_devs_productId_userId_key" ON "product_devs"("productId", "userId");

-- AddForeignKey
ALTER TABLE "product_devs" ADD CONSTRAINT "product_devs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_items" ADD CONSTRAINT "roadmap_items_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
