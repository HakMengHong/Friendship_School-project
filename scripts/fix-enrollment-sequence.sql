-- Fix enrollment auto-increment sequence
-- This script resets the sequence to be in sync with the actual data

-- First, let's see what the current max enrollmentId is
SELECT MAX("enrollmentId") FROM "Enrollment";

-- Reset the sequence to the correct value
-- Replace 'Enrollment_enrollmentId_seq' with your actual sequence name if different
SELECT setval('"Enrollment_enrollmentId_seq"', COALESCE((SELECT MAX("enrollmentId") FROM "Enrollment"), 1), true);

-- Verify the fix
SELECT currval('"Enrollment_enrollmentId_seq"');

