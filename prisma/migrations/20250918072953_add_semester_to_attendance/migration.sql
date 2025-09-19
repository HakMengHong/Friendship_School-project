-- AlterTable
ALTER TABLE "public"."Attendance" ADD COLUMN     "semesterId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "public"."Semester"("semesterId") ON DELETE SET NULL ON UPDATE CASCADE;
