/*
  Warnings:

  - You are about to drop the column `details` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `targetId` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `ActivityLog` table. All the data in the column will be lost.
  - The primary key for the `Guardian` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Guardian` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Guardian` table. All the data in the column will be lost.
  - The primary key for the `Student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `birthPlace` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Student` table. All the data in the column will be lost.
  - The `studentId` column on the `Student` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Announcement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Attendance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SchoolYear` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Semester` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Announcement" DROP CONSTRAINT "Announcement_authorId_fkey";

-- DropForeignKey
ALTER TABLE "FamilyInfo" DROP CONSTRAINT "FamilyInfo_studentId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_uploadedBy_fkey";

-- DropForeignKey
ALTER TABLE "Guardian" DROP CONSTRAINT "Guardian_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Scholarship" DROP CONSTRAINT "Scholarship_studentId_fkey";

-- DropForeignKey
ALTER TABLE "_ClassTeacher" DROP CONSTRAINT "_ClassTeacher_B_fkey";

-- DropIndex
DROP INDEX "Student_studentId_key";

-- AlterTable
ALTER TABLE "ActivityLog" DROP COLUMN "details",
DROP COLUMN "targetId",
DROP COLUMN "targetType";

-- AlterTable
ALTER TABLE "FamilyInfo" ADD COLUMN     "canHelpSchool" BOOLEAN DEFAULT false,
ADD COLUMN     "churchName" TEXT,
ADD COLUMN     "durationInKPC" TEXT,
ADD COLUMN     "helpAmount" DOUBLE PRECISION,
ADD COLUMN     "helpFrequency" TEXT,
ADD COLUMN     "knowSchool" TEXT,
ADD COLUMN     "livingCondition" TEXT,
ADD COLUMN     "livingWith" TEXT,
ADD COLUMN     "organizationHelp" TEXT,
ADD COLUMN     "ownHouse" BOOLEAN DEFAULT false,
ADD COLUMN     "religion" TEXT;

-- AlterTable
ALTER TABLE "Guardian" DROP CONSTRAINT "Guardian_pkey",
DROP COLUMN "id",
DROP COLUMN "name",
ADD COLUMN     "believeJesus" BOOLEAN DEFAULT false,
ADD COLUMN     "birthDistrict" TEXT,
ADD COLUMN     "childrenCount" INTEGER,
ADD COLUMN     "church" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "guardianid" SERIAL NOT NULL,
ADD COLUMN     "houseNumber" TEXT,
ADD COLUMN     "income" DOUBLE PRECISION,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "village" TEXT,
ADD CONSTRAINT "Guardian_pkey" PRIMARY KEY ("guardianid");

-- AlterTable
ALTER TABLE "Student" DROP CONSTRAINT "Student_pkey",
DROP COLUMN "address",
DROP COLUMN "birthPlace",
DROP COLUMN "id",
ADD COLUMN     "needsClothes" BOOLEAN DEFAULT false,
ADD COLUMN     "needsMaterials" BOOLEAN DEFAULT false,
ADD COLUMN     "needsTransport" BOOLEAN DEFAULT false,
ADD COLUMN     "previousSchool" TEXT,
ADD COLUMN     "registerToStudy" BOOLEAN DEFAULT false,
ADD COLUMN     "studentBirthDistrict" TEXT,
ADD COLUMN     "studentDistrict" TEXT,
ADD COLUMN     "studentHouseNumber" TEXT,
ADD COLUMN     "studentProvince" TEXT,
ADD COLUMN     "studentVillage" TEXT,
ADD COLUMN     "transferReason" TEXT,
ADD COLUMN     "vaccinated" BOOLEAN DEFAULT false,
DROP COLUMN "studentId",
ADD COLUMN     "studentId" SERIAL NOT NULL,
ADD CONSTRAINT "Student_pkey" PRIMARY KEY ("studentId");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "userId" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("userId");

-- DropTable
DROP TABLE "Announcement";

-- DropTable
DROP TABLE "Attendance";

-- DropTable
DROP TABLE "File";

-- DropTable
DROP TABLE "SchoolYear";

-- DropTable
DROP TABLE "Semester";

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyInfo" ADD CONSTRAINT "FamilyInfo_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassTeacher" ADD CONSTRAINT "_ClassTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
