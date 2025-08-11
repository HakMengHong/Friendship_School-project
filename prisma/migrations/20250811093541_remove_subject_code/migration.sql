/*
  Warnings:

  - The primary key for the `Course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `courseId` column on the `Course` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `schoolYearCode` on the `SchoolYear` table. All the data in the column will be lost.
  - You are about to drop the column `subjectCode` on the `Subject` table. All the data in the column will be lost.
  - The primary key for the `_ClassTeacher` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `courseId` on the `Enrollment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `courseId` on the `Grade` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_ClassTeacher` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_courseId_fkey";

-- DropForeignKey
ALTER TABLE "_ClassTeacher" DROP CONSTRAINT "_ClassTeacher_A_fkey";

-- DropIndex
DROP INDEX "Course_courseId_key";

-- DropIndex
DROP INDEX "SchoolYear_schoolYearCode_key";

-- DropIndex
DROP INDEX "Subject_subjectCode_key";

-- AlterTable
ALTER TABLE "Course" DROP CONSTRAINT "Course_pkey",
DROP COLUMN "courseId",
ADD COLUMN     "courseId" SERIAL NOT NULL,
ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("courseId");

-- AlterTable
ALTER TABLE "Enrollment" DROP COLUMN "courseId",
ADD COLUMN     "courseId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Grade" DROP COLUMN "courseId",
ADD COLUMN     "courseId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SchoolYear" DROP COLUMN "schoolYearCode";

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "subjectCode";

-- AlterTable
ALTER TABLE "_ClassTeacher" DROP CONSTRAINT "_ClassTeacher_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
ADD CONSTRAINT "_ClassTeacher_AB_pkey" PRIMARY KEY ("A", "B");

-- DropTable
DROP TABLE "File";

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassTeacher" ADD CONSTRAINT "_ClassTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;
