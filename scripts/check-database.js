const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...\n');

    // Check school years
    console.log('📅 Checking school years...');
    const schoolYears = await prisma.schoolYear.findMany();
    console.log('School Years count:', schoolYears.length);
    if (schoolYears.length > 0) {
      schoolYears.forEach(sy => {
        console.log(`   - ID: ${sy.schoolYearId}, Code: ${sy.schoolYearCode}`);
      });
    } else {
      console.log('   No school years found');
    }

    // Check courses
    console.log('\n📚 Checking courses...');
    const courses = await prisma.course.findMany();
    console.log('Courses count:', courses.length);
    if (courses.length > 0) {
      courses.forEach(c => {
        console.log(`   - ID: ${c.courseId}, Grade: ${c.grade}, Year: ${c.schoolYearId}`);
      });
    } else {
      console.log('   No courses found');
    }

    console.log('\n✅ Database check completed');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
