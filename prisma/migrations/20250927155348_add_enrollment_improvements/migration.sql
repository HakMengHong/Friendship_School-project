/*
  Warnings:

  - A unique constraint covering the columns `[studentId,courseId]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Enrollment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dropReason" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Enrollment_studentId_courseId_idx" ON "public"."Enrollment"("studentId", "courseId");

-- CreateIndex
CREATE INDEX "Enrollment_drop_idx" ON "public"."Enrollment"("drop");

-- CreateIndex
CREATE INDEX "Enrollment_dropDate_idx" ON "public"."Enrollment"("dropDate");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_courseId_key" ON "public"."Enrollment"("studentId", "courseId");
