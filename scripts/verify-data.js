const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyData() {
  try {
    console.log('🔍 Verifying created data...\n');

    // Check school years
    console.log('📅 School Years:');
    const schoolYears = await prisma.schoolYear.findMany({
      orderBy: { schoolYearId: 'asc' }
    });
    schoolYears.forEach(sy => {
      console.log(`   - ID: ${sy.schoolYearId}, Year: ${sy.schoolyear}, Code: ${sy.schoolYearCode}`);
    });

    // Check courses by school year
    console.log('\n📚 Courses by School Year:');
    
    for (const schoolYear of schoolYears) {
      console.log(`\n   ${schoolYear.schoolyear} (ID: ${schoolYear.schoolYearId}):`);
      const courses = await prisma.course.findMany({
        where: { schoolYearId: schoolYear.schoolYearId },
        orderBy: { courseId: 'asc' }
      });
      
      courses.forEach(c => {
        console.log(`     - Course ID: ${c.courseId}, Grade: "${c.grade}", Section: ${c.section}, Name: ${c.courseName}`);
      });
    }

    console.log('\n✅ Data verification completed');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();
