-- CreateTable
CREATE TABLE "SOPComment" (
    "id" TEXT NOT NULL,
    "sopId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "body" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "editedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SOPComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SOPShareLink" (
    "id" TEXT NOT NULL,
    "sopId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SOPShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SOPComment_sopId_idx" ON "SOPComment"("sopId");

-- CreateIndex
CREATE INDEX "SOPComment_authorId_idx" ON "SOPComment"("authorId");

-- CreateIndex
CREATE INDEX "SOPComment_parentId_idx" ON "SOPComment"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "SOPShareLink_sopId_key" ON "SOPShareLink"("sopId");

-- CreateIndex
CREATE UNIQUE INDEX "SOPShareLink_token_key" ON "SOPShareLink"("token");

-- CreateIndex
CREATE INDEX "SOPShareLink_sopId_idx" ON "SOPShareLink"("sopId");

-- AddForeignKey
ALTER TABLE "SOPComment" ADD CONSTRAINT "SOPComment_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "SOP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOPComment" ADD CONSTRAINT "SOPComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOPComment" ADD CONSTRAINT "SOPComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "SOPComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOPShareLink" ADD CONSTRAINT "SOPShareLink_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "SOP"("id") ON DELETE CASCADE ON UPDATE CASCADE;
