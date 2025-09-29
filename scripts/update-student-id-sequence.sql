-- Update Student ID sequence to start from 1000
-- This script ensures that new student IDs will start from 1000

-- Check if there are any existing students
DO $$
DECLARE
    max_student_id INTEGER;
    sequence_name TEXT := 'Student_studentId_seq';
BEGIN
    -- Get the maximum student ID
    SELECT COALESCE(MAX("studentId"), 0) INTO max_student_id FROM "Student";
    
    -- If no students exist or max ID is less than 1000, set sequence to start from 1000
    IF max_student_id < 1000 THEN
        -- Reset the sequence to start from 1000
        EXECUTE format('ALTER SEQUENCE %I RESTART WITH 1000', sequence_name);
        RAISE NOTICE 'Student ID sequence reset to start from 1000';
    ELSE
        -- If there are students with IDs >= 1000, set sequence to max + 1
        EXECUTE format('ALTER SEQUENCE %I RESTART WITH %s', sequence_name, max_student_id + 1);
        RAISE NOTICE 'Student ID sequence set to continue from %', max_student_id + 1;
    END IF;
    
    -- Verify the sequence value
    RAISE NOTICE 'Current sequence value: %', (SELECT last_value FROM "Student_studentId_seq");
END $$;

-- Verify the changes
SELECT 
    'Student ID Sequence Status' as info,
    last_value as current_sequence_value,
    CASE 
        WHEN last_value >= 1000 THEN 'Ready for 1000+ IDs'
        ELSE 'Needs adjustment'
    END as status
FROM "Student_studentId_seq";
