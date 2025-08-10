/*
  Warnings:

  - The primary key for the `Course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Course` table. All the data in the column will be lost.
  - The primary key for the `Enrollment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `droup` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `droupDate` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `droupSemester` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Enrollment` table. All the data in the column will be lost.
  - The `enrollmentId` column on the `Enrollment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `FamilyInfo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `FamilyInfo` table. All the data in the column will be lost.
  - You are about to drop the column `fatherName` on the `FamilyInfo` table. All the data in the column will be lost.
  - You are about to drop the column `fatherPhone` on the `FamilyInfo` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `FamilyInfo` table. All the data in the column will be lost.
  - You are about to drop the column `motherName` on the `FamilyInfo` table. All the data in the column will be lost.
  - You are about to drop the column `motherPhone` on the `FamilyInfo` table. All the data in the column will be lost.
  - You are about to drop the column `siblings` on the `FamilyInfo` table. All the data in the column will be lost.
  - The primary key for the `Grade` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Grade` table. All the data in the column will be lost.
  - The `gradeId` column on the `Grade` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Guardian` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `Guardian` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Guardian` table. All the data in the column will be lost.
  - You are about to drop the column `guardianid` on the `Guardian` table. All the data in the column will be lost.
  - The primary key for the `Scholarship` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Scholarship` table. All the data in the column will be lost.
  - You are about to drop the column `academicYear` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Student` table. All the data in the column will be lost.
  - The primary key for the `Subject` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Subject` table. All the data in the column will be lost.
  - The `subjectId` column on the `Subject` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `_ClassTeacher` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Class` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[enrollmentCode]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gradeCode]` on the table `Grade` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subjectCode]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `drop` to the `Enrollment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enrollmentCode` to the `Enrollment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gradeCode` to the `Grade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectCode` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_classId_fkey";

-- DropForeignKey
ALTER TABLE "_ClassTeacher" DROP CONSTRAINT "_ClassTeacher_A_fkey";

-- DropIndex
DROP INDEX "Enrollment_enrollmentId_key";

-- DropIndex
DROP INDEX "Grade_gradeId_key";

-- DropIndex
DROP INDEX "Subject_subjectId_key";

-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "details" TEXT;

-- AlterTable
ALTER TABLE "Course" DROP CONSTRAINT "Course_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("courseId");

-- AlterTable
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_pkey",
DROP COLUMN "droup",
DROP COLUMN "droupDate",
DROP COLUMN "droupSemester",
DROP COLUMN "id",
ADD COLUMN     "drop" BOOLEAN NOT NULL,
ADD COLUMN     "dropDate" TIMESTAMP(3),
ADD COLUMN     "dropSemester" TEXT,
ADD COLUMN     "enrollmentCode" TEXT NOT NULL,
DROP COLUMN "enrollmentId",
ADD COLUMN     "enrollmentId" SERIAL NOT NULL,
ALTER COLUMN "courseId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("enrollmentId");

-- AlterTable
ALTER TABLE "FamilyInfo" DROP CONSTRAINT "FamilyInfo_pkey",
DROP COLUMN "address",
DROP COLUMN "fatherName",
DROP COLUMN "fatherPhone",
DROP COLUMN "id",
DROP COLUMN "motherName",
DROP COLUMN "motherPhone",
DROP COLUMN "siblings",
ADD COLUMN     "familyinfoId" SERIAL NOT NULL,
ADD CONSTRAINT "FamilyInfo_pkey" PRIMARY KEY ("familyinfoId");

-- AlterTable
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_pkey",
DROP COLUMN "id",
ADD COLUMN     "gradeCode" TEXT NOT NULL,
DROP COLUMN "gradeId",
ADD COLUMN     "gradeId" SERIAL NOT NULL,
ALTER COLUMN "courseId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Grade_pkey" PRIMARY KEY ("gradeId");

-- AlterTable
ALTER TABLE "Guardian" DROP CONSTRAINT "Guardian_pkey",
DROP COLUMN "address",
DROP COLUMN "email",
DROP COLUMN "guardianid",
ADD COLUMN     "guardianId" SERIAL NOT NULL,
ADD CONSTRAINT "Guardian_pkey" PRIMARY KEY ("guardianId");

-- AlterTable
ALTER TABLE "Scholarship" DROP CONSTRAINT "Scholarship_pkey",
DROP COLUMN "id",
ADD COLUMN     "scholarshipId" SERIAL NOT NULL,
ADD CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("scholarshipId");

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "academicYear",
DROP COLUMN "email",
ADD COLUMN     "schoolYear" TEXT,
ALTER COLUMN "registrationDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_pkey",
DROP COLUMN "id",
ADD COLUMN     "subjectCode" TEXT NOT NULL,
DROP COLUMN "subjectId",
ADD COLUMN     "subjectId" SERIAL NOT NULL,
ADD CONSTRAINT "Subject_pkey" PRIMARY KEY ("subjectId");

-- AlterTable
ALTER TABLE "_ClassTeacher" DROP CONSTRAINT "_ClassTeacher_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ADD CONSTRAINT "_ClassTeacher_AB_pkey" PRIMARY KEY ("A", "B");

-- DropTable
DROP TABLE "Class";

-- CreateTable
CREATE TABLE "SchoolYear" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "schoolyear" TEXT NOT NULL,
    "schoolYearCode" TEXT NOT NULL,
    "schoolYearId" SERIAL NOT NULL,

    CONSTRAINT "SchoolYear_pkey" PRIMARY KEY ("schoolYearId")
);

-- CreateTable
CREATE TABLE "Semester" (
    "semester" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "semesterCode" TEXT NOT NULL,
    "semesterId" SERIAL NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("semesterId")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "session" "AttendanceSession" NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolYear_schoolYearCode_key" ON "SchoolYear"("schoolYearCode");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_semesterCode_key" ON "Semester"("semesterCode");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_enrollmentCode_key" ON "Enrollment"("enrollmentCode");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_gradeCode_key" ON "Grade"("gradeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_subjectCode_key" ON "Subject"("subjectCode");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "SchoolYear"("schoolYearId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("semesterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("subjectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassTeacher" ADD CONSTRAINT "_ClassTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;
