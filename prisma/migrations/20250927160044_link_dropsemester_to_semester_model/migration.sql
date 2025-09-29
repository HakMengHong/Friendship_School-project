/*
  Warnings:

  - You are about to drop the column `dropSemester` on the `Enrollment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Enrollment" DROP COLUMN "dropSemester",
ADD COLUMN     "dropSemesterId" INTEGER;

-- CreateIndex
CREATE INDEX "Enrollment_dropSemesterId_idx" ON "public"."Enrollment"("dropSemesterId");

-- AddForeignKey
ALTER TABLE "public"."Enrollment" ADD CONSTRAINT "Enrollment_dropSemesterId_fkey" FOREIGN KEY ("dropSemesterId") REFERENCES "public"."Semester"("semesterId") ON DELETE SET NULL ON UPDATE CASCADE;
