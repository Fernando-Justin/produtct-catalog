-- CreateTable
CREATE TABLE "product_databases" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "environment" "Environment" NOT NULL,
    "url" TEXT,
    "host" TEXT,
    "database" TEXT,
    "username" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_databases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_databases_productId_environment_key" ON "product_databases"("productId", "environment");

-- AddForeignKey
ALTER TABLE "product_databases" ADD CONSTRAINT "product_databases_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
