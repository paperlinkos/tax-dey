-- CreateTable
CREATE TABLE "savings_goal" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetKobo" INTEGER NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "frequency" TEXT NOT NULL,
    "preferredKobo" INTEGER,
    "linkedAssessmentId" TEXT,
    "provisional" BOOLEAN NOT NULL DEFAULT false,
    "importKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_contribution" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "providerLabel" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_revision" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "previousKobo" INTEGER NOT NULL,
    "nextKobo" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxpayer_profile" (
    "ownerId" TEXT NOT NULL,
    "legalType" TEXT NOT NULL DEFAULT 'individual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalType" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_member" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'owner',

    CONSTRAINT "workspace_member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "savings_goal_ownerId_idx" ON "savings_goal"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "savings_goal_ownerId_importKey_key" ON "savings_goal"("ownerId", "importKey");

-- CreateIndex
CREATE INDEX "savings_contribution_goalId_idx" ON "savings_contribution"("goalId");

-- CreateIndex
CREATE INDEX "savings_revision_goalId_idx" ON "savings_revision"("goalId");

-- CreateIndex
CREATE UNIQUE INDEX "taxpayer_profile_ownerId_key" ON "taxpayer_profile"("ownerId");

-- CreateIndex
CREATE INDEX "workspace_member_userId_idx" ON "workspace_member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_member_workspaceId_userId_key" ON "workspace_member"("workspaceId", "userId");

-- AddForeignKey
ALTER TABLE "savings_goal" ADD CONSTRAINT "savings_goal_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_contribution" ADD CONSTRAINT "savings_contribution_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "savings_goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_revision" ADD CONSTRAINT "savings_revision_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "savings_goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taxpayer_profile" ADD CONSTRAINT "taxpayer_profile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_member" ADD CONSTRAINT "workspace_member_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_member" ADD CONSTRAINT "workspace_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
