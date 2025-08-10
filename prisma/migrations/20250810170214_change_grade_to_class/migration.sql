/*
  Warnings:

  - You are about to drop the column `grade` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `enrollmentCode` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `credits` on the `Subject` table. All the data in the column will be lost.
  - Added the required column `class` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Enrollment_enrollmentCode_key";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "grade",
ADD COLUMN     "class" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Enrollment" DROP COLUMN "createdAt",
DROP COLUMN "enrollmentCode",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "credits";
