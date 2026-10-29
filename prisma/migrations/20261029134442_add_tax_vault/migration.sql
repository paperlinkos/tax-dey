-- CreateTable
CREATE TABLE "tax_vault" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "partnerId" TEXT NOT NULL,
    "profile" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_vault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vault_income" (
    "id" TEXT NOT NULL,
    "vaultId" TEXT NOT NULL,
    "receivedOn" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "source" TEXT NOT NULL,
    "setAside" DECIMAL(18,2) NOT NULL,
    "breakdown" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vault_income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vault_move" (
    "id" TEXT NOT NULL,
    "vaultId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "incomeId" TEXT,
    "partnerRef" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vault_move_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tax_vault_ownerId_taxYear_key" ON "tax_vault"("ownerId", "taxYear");

-- CreateIndex
CREATE INDEX "vault_income_vaultId_idx" ON "vault_income"("vaultId");

-- CreateIndex
CREATE INDEX "vault_move_vaultId_idx" ON "vault_move"("vaultId");

-- CreateIndex
CREATE UNIQUE INDEX "vault_move_vaultId_incomeId_key" ON "vault_move"("vaultId", "incomeId");

-- AddForeignKey
ALTER TABLE "tax_vault" ADD CONSTRAINT "tax_vault_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vault_income" ADD CONSTRAINT "vault_income_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "tax_vault"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vault_move" ADD CONSTRAINT "vault_move_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "tax_vault"("id") ON DELETE CASCADE ON UPDATE CASCADE;
