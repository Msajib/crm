-- CreateTable
CREATE TABLE "tenant_credentials" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "encrypted_credentials" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_tested_at" TIMESTAMP(3),
    "testStatus" TEXT NOT NULL DEFAULT 'UNTESTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_gates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "gates" JSONB NOT NULL,

    CONSTRAINT "feature_gates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tenant_credentials_tenant_id_idx" ON "tenant_credentials"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_credentials_tenant_id_type_key" ON "tenant_credentials"("tenant_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "feature_gates_tenant_id_key" ON "feature_gates"("tenant_id");
