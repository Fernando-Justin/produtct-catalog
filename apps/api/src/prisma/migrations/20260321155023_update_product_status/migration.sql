/*
  Warnings:

  - The values [HOMOLOGACAO,PRODUCAO,DESCONTINUADO] on the enum `ProductStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProductStatus_new" AS ENUM ('ATIVO', 'INATIVO', 'DEPRECIADO', 'PLANEJADO');
ALTER TABLE "apps" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "products" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "products" ALTER COLUMN "status" TYPE "ProductStatus_new" USING ("status"::text::"ProductStatus_new");
ALTER TABLE "apps" ALTER COLUMN "status" TYPE "ProductStatus_new" USING ("status"::text::"ProductStatus_new");
ALTER TYPE "ProductStatus" RENAME TO "ProductStatus_old";
ALTER TYPE "ProductStatus_new" RENAME TO "ProductStatus";
DROP TYPE "ProductStatus_old";
ALTER TABLE "apps" ALTER COLUMN "status" SET DEFAULT 'PLANEJADO';
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'PLANEJADO';
COMMIT;

-- AlterTable
ALTER TABLE "apps" ALTER COLUMN "status" SET DEFAULT 'PLANEJADO';

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'PLANEJADO';
