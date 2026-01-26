-- AlterTable
ALTER TABLE "SOP" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sectionId" TEXT;

-- CreateTable
CREATE TABLE "SOPSection" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SOPSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SOPSection_departmentId_idx" ON "SOPSection"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "SOPSection_departmentId_title_key" ON "SOPSection"("departmentId", "title");

-- CreateIndex
CREATE INDEX "SOP_sectionId_idx" ON "SOP"("sectionId");

-- AddForeignKey
ALTER TABLE "SOP" ADD CONSTRAINT "SOP_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "SOPSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOPSection" ADD CONSTRAINT "SOPSection_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
