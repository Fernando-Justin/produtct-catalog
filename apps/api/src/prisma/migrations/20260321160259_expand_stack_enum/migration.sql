/*
  Warnings:

  - The values [GO,KOTLIN,VUE,ANGULAR] on the enum `StackType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StackType_new" AS ENUM ('JAVA', 'GO_LANG', 'PYTHON', 'REACT', 'NODEJS', 'DOTNET', 'RUST', 'TYPESCRIPT', 'PHP', 'SPRING_BOOT', 'GIN', 'FAST_API', 'NEXT_JS', 'EXPRESS', 'NEST_JS', 'ASP_NET_CORE', 'LARAVEL', 'SYMFONY', 'POSTGRESQL', 'MYSQL', 'ORACLE', 'SQL_SERVER', 'NOSQL', 'MONGODB', 'REDIS', 'KEYDB', 'OUTROS');
ALTER TABLE "product_stacks" ALTER COLUMN "stack" TYPE "StackType_new" USING ("stack"::text::"StackType_new");
ALTER TABLE "app_stacks" ALTER COLUMN "stack" TYPE "StackType_new" USING ("stack"::text::"StackType_new");
ALTER TYPE "StackType" RENAME TO "StackType_old";
ALTER TYPE "StackType_new" RENAME TO "StackType";
DROP TYPE "StackType_old";
COMMIT;
