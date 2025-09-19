const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function truncateAllTablesExceptUser() {
  try {
    console.log('🗑️ Starting table truncation (keeping User table)...\n');

    // First, let's check current data counts
    console.log('📊 Current data counts:');
    
    const counts = {
      users: await prisma.user.count(),
      students: await prisma.student.count(),
      courses: await prisma.course.count(),
      subjects: await prisma.subject.count(),
      grades: await prisma.grade.count(),
      enrollments: await prisma.enrollment.count(),
      attendances: await prisma.attendance.count(),
      schoolYears: await prisma.schoolYear.count(),
      semesters: await prisma.semester.count(),
      guardians: await prisma.guardian.count(),
      familyInfos: await prisma.familyInfo.count(),
      scholarships: await prisma.scholarship.count(),
      activityLogs: await prisma.activityLog.count(),
      announcements: await prisma.announcement.count()
    };

    Object.entries(counts).forEach(([table, count]) => {
      console.log(`   ${table}: ${count} records`);
    });

    console.log('\n⚠️ WARNING: This will delete ALL data except User table!');
    console.log('Proceeding with truncation...\n');

    // Disable foreign key checks temporarily
    console.log('🔧 Disabling foreign key checks...');
    await prisma.$executeRaw`SET session_replication_role = replica;`;

    // Truncate tables in reverse dependency order to avoid foreign key conflicts
    const tablesToTruncate = [
      'ActivityLog',
      'Announcement', 
      'Attendance',
      'Grade',
      'Enrollment',
      'Scholarship',
      'FamilyInfo',
      'Guardian',
      'Student',
      'Course',
      'Subject',
      'Semester',
      'SchoolYear'
    ];

    for (const table of tablesToTruncate) {
      try {
        console.log(`🗑️ Truncating ${table}...`);
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
        console.log(`✅ ${table} truncated successfully`);
      } catch (error) {
        console.log(`⚠️ Error truncating ${table}: ${error.message}`);
        // Continue with other tables even if one fails
      }
    }

    // Re-enable foreign key checks
    console.log('\n🔧 Re-enabling foreign key checks...');
    await prisma.$executeRaw`SET session_replication_role = DEFAULT;`;

    // Verify the results
    console.log('\n📊 Final data counts:');
    const finalCounts = {
      users: await prisma.user.count(),
      students: await prisma.student.count(),
      courses: await prisma.course.count(),
      subjects: await prisma.subject.count(),
      grades: await prisma.grade.count(),
      enrollments: await prisma.enrollment.count(),
      attendances: await prisma.attendance.count(),
      schoolYears: await prisma.schoolYear.count(),
      semesters: await prisma.semester.count(),
      guardians: await prisma.guardian.count(),
      familyInfos: await prisma.familyInfo.count(),
      scholarships: await prisma.scholarship.count(),
      activityLogs: await prisma.activityLog.count(),
      announcements: await prisma.announcement.count()
    };

    Object.entries(finalCounts).forEach(([table, count]) => {
      const status = table === 'users' ? (count > 0 ? '✅' : '❌') : (count === 0 ? '✅' : '❌');
      console.log(`   ${status} ${table}: ${count} records`);
    });

    // Verify User table is preserved
    if (finalCounts.users > 0) {
      console.log('\n✅ SUCCESS: User table data preserved!');
      console.log(`   ${finalCounts.users} user(s) remain in the database`);
    } else {
      console.log('\n❌ ERROR: User table was accidentally cleared!');
    }

    // Check if all other tables are empty
    const nonUserTables = Object.entries(finalCounts).filter(([table]) => table !== 'users');
    const allEmpty = nonUserTables.every(([, count]) => count === 0);
    
    if (allEmpty) {
      console.log('✅ SUCCESS: All other tables have been cleared!');
    } else {
      console.log('⚠️ WARNING: Some tables still contain data:');
      nonUserTables.forEach(([table, count]) => {
        if (count > 0) {
          console.log(`   - ${table}: ${count} records`);
        }
      });
    }

    console.log('\n🎉 Truncation process completed!');
    console.log('💡 You can now start fresh with your database while keeping your user accounts.');

  } catch (error) {
    console.error('❌ Error during truncation:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

// Run the truncation
if (require.main === module) {
  truncateAllTablesExceptUser();
}

module.exports = { truncateAllTablesExceptUser };
