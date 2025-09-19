const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyTruncation() {
  try {
    console.log('🔍 Verifying truncation results...\n');

    // Check User table
    const users = await prisma.user.findMany({
      select: {
        userId: true,
        username: true,
        firstname: true,
        lastname: true,
        role: true,
        status: true
      }
    });

    console.log(`👥 Users remaining: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.firstname} ${user.lastname} (${user.username}) - ${user.role} - ${user.status}`);
    });

    // Check all other tables
    const tables = [
      { name: 'Student', count: await prisma.student.count() },
      { name: 'Course', count: await prisma.course.count() },
      { name: 'Subject', count: await prisma.subject.count() },
      { name: 'Grade', count: await prisma.grade.count() },
      { name: 'Enrollment', count: await prisma.enrollment.count() },
      { name: 'Attendance', count: await prisma.attendance.count() },
      { name: 'SchoolYear', count: await prisma.schoolYear.count() },
      { name: 'Semester', count: await prisma.semester.count() },
      { name: 'Guardian', count: await prisma.guardian.count() },
      { name: 'FamilyInfo', count: await prisma.familyInfo.count() },
      { name: 'Scholarship', count: await prisma.scholarship.count() },
      { name: 'ActivityLog', count: await prisma.activityLog.count() },
      { name: 'Announcement', count: await prisma.announcement.count() }
    ];

    console.log('\n📊 Other tables:');
    tables.forEach(table => {
      const status = table.count === 0 ? '✅' : '❌';
      console.log(`   ${status} ${table.name}: ${table.count} records`);
    });

    // Summary
    const userCount = users.length;
    const otherTablesEmpty = tables.every(t => t.count === 0);

    console.log('\n📋 Summary:');
    if (userCount > 0 && otherTablesEmpty) {
      console.log('✅ SUCCESS: Truncation completed successfully!');
      console.log(`   - User table preserved: ${userCount} users`);
      console.log('   - All other tables cleared: 0 records each');
    } else {
      console.log('❌ ISSUE: Truncation may not have completed successfully');
      if (userCount === 0) {
        console.log('   - User table was accidentally cleared!');
      }
      if (!otherTablesEmpty) {
        console.log('   - Some tables still contain data');
      }
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTruncation();
