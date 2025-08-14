/*
  Warnings:

  - The primary key for the `Attendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `date` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Attendance` table. All the data in the column will be lost.
  - Added the required column `attendanceDate` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseId` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_pkey",
DROP COLUMN "date",
DROP COLUMN "id",
ADD COLUMN     "attendanceDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "attendanceId" SERIAL NOT NULL,
ADD COLUMN     "courseId" INTEGER NOT NULL,
ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY ("attendanceId");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;
