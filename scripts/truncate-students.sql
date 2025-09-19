-- SQL Script to Truncate Student Table and Related Data
-- WARNING: This will permanently delete ALL student data!
-- Run this script with caution and ensure you have backups.

-- Disable foreign key checks temporarily (PostgreSQL)
-- Note: PostgreSQL doesn't have a simple way to disable foreign key checks
-- So we need to delete in the correct order

-- 1. Delete grades (references studentId)
DELETE FROM "Grade" WHERE "studentId" IS NOT NULL;

-- 2. Delete attendances (references studentId)
DELETE FROM "Attendance" WHERE "studentId" IS NOT NULL;

-- 3. Delete enrollments (references studentId)
DELETE FROM "Enrollment" WHERE "studentId" IS NOT NULL;

-- 4. Delete scholarships (references studentId)
DELETE FROM "Scholarship" WHERE "studentId" IS NOT NULL;

-- 5. Delete guardians (references studentId)
DELETE FROM "Guardian" WHERE "studentId" IS NOT NULL;

-- 6. Delete family info (references studentId)
DELETE FROM "FamilyInfo" WHERE "studentId" IS NOT NULL;

-- 7. Finally, delete all students
DELETE FROM "Student";

-- Optional: Reset the auto-increment counter for Student table
-- ALTER SEQUENCE "Student_studentId_seq" RESTART WITH 1;

-- Verify the deletion
SELECT COUNT(*) as remaining_students FROM "Student";
SELECT COUNT(*) as remaining_grades FROM "Grade";
SELECT COUNT(*) as remaining_attendances FROM "Attendance";
SELECT COUNT(*) as remaining_enrollments FROM "Enrollment";
SELECT COUNT(*) as remaining_scholarships FROM "Scholarship";
SELECT COUNT(*) as remaining_guardians FROM "Guardian";
SELECT COUNT(*) as remaining_family_info FROM "FamilyInfo";
