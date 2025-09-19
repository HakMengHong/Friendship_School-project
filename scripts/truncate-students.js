const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function truncateStudents() {
  try {
    console.log('🗑️  Starting Student table truncation...\n');

    // First, let's check how many students exist
    const studentCount = await prisma.student.count();
    console.log(`📊 Found ${studentCount} students in the database`);

    if (studentCount === 0) {
      console.log('✅ No students to delete. Database is already empty.');
      return;
    }

    // Show confirmation prompt
    console.log('\n⚠️  WARNING: This will delete ALL students and their related data!');
    console.log('This includes:');
    console.log('  - Student records');
    console.log('  - Guardian information');
    console.log('  - Family information');
    console.log('  - Scholarship records');
    console.log('  - Grade records');
    console.log('  - Attendance records');
    console.log('  - Enrollment records');
    console.log('\nThis action CANNOT be undone!');

    // In a real scenario, you might want to add a confirmation prompt here
    // For now, we'll proceed with the deletion

    console.log('\n🔄 Starting deletion process...');

    // Delete in the correct order to handle foreign key constraints
    // 1. Delete grades (references studentId)
    console.log('Deleting grades...');
    const deletedGrades = await prisma.grade.deleteMany({
      where: {
        studentId: {
          not: undefined
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedGrades.count} grade records`);

    // 2. Delete attendances (references studentId)
    console.log('Deleting attendances...');
    const deletedAttendances = await prisma.attendance.deleteMany({
      where: {
        studentId: {
          not: undefined
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedAttendances.count} attendance records`);

    // 3. Delete enrollments (references studentId)
    console.log('Deleting enrollments...');
    const deletedEnrollments = await prisma.enrollment.deleteMany({
      where: {
        studentId: {
          not: undefined
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedEnrollments.count} enrollment records`);

    // 4. Delete scholarships (references studentId)
    console.log('Deleting scholarships...');
    const deletedScholarships = await prisma.scholarship.deleteMany({
      where: {
        studentId: {
          not: undefined
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedScholarships.count} scholarship records`);

    // 5. Delete guardians (references studentId)
    console.log('Deleting guardians...');
    const deletedGuardians = await prisma.guardian.deleteMany({
      where: {
        studentId: {
          not: undefined
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedGuardians.count} guardian records`);

    // 6. Delete family info (references studentId)
    console.log('Deleting family information...');
    const deletedFamilyInfo = await prisma.familyInfo.deleteMany({
      where: {
        studentId: {
          not: undefined
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedFamilyInfo.count} family info records`);

    // 7. Finally, delete all students
    console.log('Deleting students...');
    const deletedStudents = await prisma.student.deleteMany();
    console.log(`   ✅ Deleted ${deletedStudents.count} student records`);

    console.log('\n🎉 Student table truncation completed successfully!');
    console.log('\nSummary of deleted records:');
    console.log(`   - Students: ${deletedStudents.count}`);
    console.log(`   - Grades: ${deletedGrades.count}`);
    console.log(`   - Attendances: ${deletedAttendances.count}`);
    console.log(`   - Enrollments: ${deletedEnrollments.count}`);
    console.log(`   - Scholarships: ${deletedScholarships.count}`);
    console.log(`   - Guardians: ${deletedGuardians.count}`);
    console.log(`   - Family Info: ${deletedFamilyInfo.count}`);

    // Verify the deletion
    const remainingStudents = await prisma.student.count();
    console.log(`\n✅ Verification: ${remainingStudents} students remaining in database`);

  } catch (error) {
    console.error('❌ Error during truncation:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
truncateStudents();
