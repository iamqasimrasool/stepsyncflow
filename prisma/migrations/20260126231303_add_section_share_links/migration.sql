-- CreateTable
CREATE TABLE "SOPSectionShareLink" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SOPSectionShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SOPSectionShareLink_sectionId_key" ON "SOPSectionShareLink"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "SOPSectionShareLink_token_key" ON "SOPSectionShareLink"("token");

-- CreateIndex
CREATE INDEX "SOPSectionShareLink_sectionId_idx" ON "SOPSectionShareLink"("sectionId");

-- AddForeignKey
ALTER TABLE "SOPSectionShareLink" ADD CONSTRAINT "SOPSectionShareLink_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "SOPSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
