-- CreateTable
CREATE TABLE "SOPCommentEdit" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SOPCommentEdit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SOPCommentEdit_commentId_idx" ON "SOPCommentEdit"("commentId");

-- AddForeignKey
ALTER TABLE "SOPCommentEdit" ADD CONSTRAINT "SOPCommentEdit_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "SOPComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
