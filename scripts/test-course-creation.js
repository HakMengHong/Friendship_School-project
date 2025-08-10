const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCourseCreation() {
  try {
    console.log('🧪 Testing course creation...\n');

    // First create a school year
    const schoolYear = await prisma.schoolYear.create({
      data: {
        schoolYearId: 1,
        schoolyear: '2022-2023',
        schoolYearCode: '2022-2023'
      }
    });
    console.log('✅ School Year created:', schoolYear);

    // Try to create a course
    const course = await prisma.course.create({
      data: {
        courseId: '1',
        schoolYearId: 1,
        grade: '1',
        section: 'A',
        courseName: 'ថ្នាក់ទី 1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log('✅ Course created:', course);

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

testCourseCreation();
