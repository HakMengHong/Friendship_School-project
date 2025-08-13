const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCourses() {
  console.log('📚 Checking Courses in Database');
  console.log('===============================\n');

  try {
    // Check all courses
    const courses = await prisma.course.findMany({
      include: {
        schoolYear: true,
        teachers: true
      }
    });

    console.log('📚 All Courses:');
    console.log('----------------');
    if (courses.length === 0) {
      console.log('❌ No courses found in the database!');
    } else {
      courses.forEach(course => {
        console.log(`ID: ${course.courseId}`);
        console.log(`  Name: ${course.courseName}`);
        console.log(`  Grade: ${course.grade}`);
        console.log(`  Section: ${course.section}`);
        console.log(`  School Year: ${course.schoolYear?.schoolYearCode || 'N/A'}`);
        console.log(`  Teachers: ${course.teachers.map(t => `${t.firstname} ${t.lastname}`).join(', ') || 'None'}`);
        console.log('  ---');
      });
    }

    // Check school years
    const schoolYears = await prisma.schoolYear.findMany();
    console.log('\n📅 School Years:');
    console.log('----------------');
    if (schoolYears.length === 0) {
      console.log('❌ No school years found!');
    } else {
      schoolYears.forEach(year => {
        console.log(`ID: ${year.schoolYearId}, Code: ${year.schoolYearCode}`);
      });
    }

    // Check teachers
    const teachers = await prisma.user.findMany({
      where: { role: 'teacher' }
    });
    console.log('\n👨‍🏫 Teachers:');
    console.log('--------------');
    if (teachers.length === 0) {
      console.log('❌ No teachers found!');
    } else {
      teachers.forEach(teacher => {
        console.log(`ID: ${teacher.userId}, Name: ${teacher.firstname} ${teacher.lastname}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
checkCourses();
