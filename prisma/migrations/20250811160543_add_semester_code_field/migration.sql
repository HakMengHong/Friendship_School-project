/*
  Warnings:

  - The primary key for the `Course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `semesterCode` on the `Semester` table. All the data in the column will be lost.
  - You are about to drop the column `subjectCode` on the `Subject` table. All the data in the column will be lost.
  - The primary key for the `_ClassTeacher` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[courseId]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_courseId_fkey";

-- DropForeignKey
ALTER TABLE "_ClassTeacher" DROP CONSTRAINT "_ClassTeacher_A_fkey";

-- DropIndex
DROP INDEX "Semester_semesterCode_key";

-- DropIndex
DROP INDEX "Subject_subjectCode_key";

-- AlterTable
ALTER TABLE "Course" DROP CONSTRAINT "Course_pkey",
ALTER COLUMN "courseId" DROP DEFAULT,
ALTER COLUMN "courseId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("courseId");
DROP SEQUENCE "Course_courseId_seq";

-- AlterTable
ALTER TABLE "Enrollment" ALTER COLUMN "courseId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Grade" ALTER COLUMN "courseId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Semester" DROP COLUMN "semesterCode";

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "subjectCode";

-- AlterTable
ALTER TABLE "_ClassTeacher" DROP CONSTRAINT "_ClassTeacher_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ADD CONSTRAINT "_ClassTeacher_AB_pkey" PRIMARY KEY ("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "Course_courseId_key" ON "Course"("courseId");

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassTeacher" ADD CONSTRAINT "_ClassTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;
