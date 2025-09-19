const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function truncateStudentsSafe() {
  try {
    console.log('🗑️  Student Table Truncation Tool (Safe Mode)\n');

    // First, let's check how many students exist
    const studentCount = await prisma.student.count();
    console.log(`📊 Found ${studentCount} students in the database`);

    if (studentCount === 0) {
      console.log('✅ No students to delete. Database is already empty.');
      rl.close();
      return;
    }

    // Show detailed information about what will be deleted
    console.log('\n📋 Data that will be deleted:');
    
    const gradesCount = await prisma.grade.count();
    const attendancesCount = await prisma.attendance.count();
    const enrollmentsCount = await prisma.enrollment.count();
    const scholarshipsCount = await prisma.scholarship.count();
    const guardiansCount = await prisma.guardian.count();
    const familyInfoCount = await prisma.familyInfo.count();

    console.log(`   - Students: ${studentCount}`);
    console.log(`   - Grades: ${gradesCount}`);
    console.log(`   - Attendances: ${attendancesCount}`);
    console.log(`   - Enrollments: ${enrollmentsCount}`);
    console.log(`   - Scholarships: ${scholarshipsCount}`);
    console.log(`   - Guardians: ${guardiansCount}`);
    console.log(`   - Family Info: ${familyInfoCount}`);

    console.log('\n⚠️  WARNING: This action CANNOT be undone!');
    console.log('All student data and related records will be permanently deleted.');

    // Ask for confirmation
    const confirm1 = await askQuestion('\nAre you sure you want to proceed? (yes/no): ');
    
    if (confirm1.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled by user.');
      rl.close();
      return;
    }

    // Double confirmation
    const confirm2 = await askQuestion('Type "DELETE ALL STUDENTS" to confirm: ');
    
    if (confirm2 !== 'DELETE ALL STUDENTS') {
      console.log('❌ Operation cancelled. Confirmation text did not match.');
      rl.close();
      return;
    }

    console.log('\n🔄 Starting deletion process...');

    // Delete in the correct order to handle foreign key constraints
    // 1. Delete grades
    console.log('Deleting grades...');
    const deletedGrades = await prisma.grade.deleteMany({
      where: {
        studentId: {
          not: undefined
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedGrades.count} grade records`);

    // 2. Delete attendances
    console.log('Deleting attendances...');
    const deletedAttendances = await prisma.attendance.deleteMany({
      where: {
        studentId: {
          not: undefined
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedAttendances.count} attendance records`);

    // 3. Delete enrollments
    console.log('Deleting enrollments...');
    const deletedEnrollments = await prisma.enrollment.deleteMany({
      where: {
        studentId: {
          not: undefined
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedEnrollments.count} enrollment records`);

    // 4. Delete scholarships
    console.log('Deleting scholarships...');
    const deletedScholarships = await prisma.scholarship.deleteMany({
      where: {
        studentId: {
          not: undefined
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedScholarships.count} scholarship records`);

    // 5. Delete guardians
    console.log('Deleting guardians...');
    const deletedGuardians = await prisma.guardian.deleteMany({
      where: {
        studentId: {
          not: undefined
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedGuardians.count} guardian records`);

    // 6. Delete family info
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
    rl.close();
    await prisma.$disconnect();
  }
}

// Run the script
truncateStudentsSafe();
