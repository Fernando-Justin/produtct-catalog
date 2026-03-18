-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('ADMIN', 'PO', 'DEV', 'SQUAD_LEAD', 'VIEWER');

-- CreateEnum
CREATE TYPE "StatusGeneral" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "StackType" AS ENUM ('JAVA', 'GO', 'PYTHON', 'REACT', 'NODEJS', 'DOTNET', 'KOTLIN', 'TYPESCRIPT', 'VUE', 'ANGULAR', 'OUTROS');

-- CreateEnum
CREATE TYPE "Environment" AS ENUM ('HOMOLOGACAO', 'PRODUCAO', 'AMBOS');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('HOMOLOGACAO', 'PRODUCAO', 'DESCONTINUADO');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('BACKLOG', 'IN_PROGRESS', 'BLOCKED', 'DONE');

-- CreateEnum
CREATE TYPE "EffortLevel" AS ENUM ('PP', 'P', 'M', 'G', 'GG');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "googleId" TEXT,
    "roleId" TEXT,
    "squadId" TEXT,
    "status" "StatusGeneral" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RoleType" NOT NULL,
    "description" TEXT,
    "status" "StatusGeneral" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "StatusGeneral" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "squads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "purpose" TEXT,
    "observations" TEXT,
    "confluenceUrl" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'HOMOLOGACAO',
    "squadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_stacks" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "stack" "StackType" NOT NULL,
    "environment" "Environment" NOT NULL DEFAULT 'AMBOS',
    "version" TEXT,

    CONSTRAINT "product_stacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_devs" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isLead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_devs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apps" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "purpose" TEXT,
    "observations" TEXT,
    "confluenceUrl" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'HOMOLOGACAO',
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_stacks" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "stack" "StackType" NOT NULL,
    "environment" "Environment" NOT NULL DEFAULT 'AMBOS',
    "version" TEXT,

    CONSTRAINT "app_stacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_environments" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "environment" "Environment" NOT NULL,
    "clusterUrl" TEXT,
    "logsUrl" TEXT,
    "argoUrl" TEXT,
    "datadogUrl" TEXT,
    "grafanaUrl" TEXT,
    "otherLinks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_environments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_links" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_environments" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "environment" "Environment" NOT NULL,
    "clusterUrl" TEXT,
    "logsUrl" TEXT,
    "argoUrl" TEXT,
    "datadogUrl" TEXT,
    "grafanaUrl" TEXT,
    "otherLinks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_environments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_links" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "squadOrContact" TEXT,
    "description" TEXT,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_suggestions" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_items" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "goalIndicator" TEXT,
    "plannedDate" TIMESTAMP(3),
    "effort" "EffortLevel" NOT NULL DEFAULT 'M',
    "status" "ActivityStatus" NOT NULL DEFAULT 'BACKLOG',
    "assigneeId" TEXT,
    "identifier" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmap_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "squads_name_key" ON "squads"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_devs_productId_userId_key" ON "product_devs"("productId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "app_environments_appId_environment_key" ON "app_environments"("appId", "environment");

-- CreateIndex
CREATE UNIQUE INDEX "product_environments_productId_environment_key" ON "product_environments"("productId", "environment");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "squads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "squads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_stacks" ADD CONSTRAINT "product_stacks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_devs" ADD CONSTRAINT "product_devs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_devs" ADD CONSTRAINT "product_devs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apps" ADD CONSTRAINT "apps_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_stacks" ADD CONSTRAINT "app_stacks_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_environments" ADD CONSTRAINT "app_environments_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_links" ADD CONSTRAINT "app_links_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_environments" ADD CONSTRAINT "product_environments_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_links" ADD CONSTRAINT "product_links_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_suggestions" ADD CONSTRAINT "client_suggestions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_items" ADD CONSTRAINT "roadmap_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_items" ADD CONSTRAINT "roadmap_items_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
