const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCourses() {
  console.log('📚 Adding Sample Courses with Teachers');
  console.log('=====================================\n');

  try {
    // Get existing school years
    const schoolYears = await prisma.schoolYear.findMany();
    if (schoolYears.length === 0) {
      console.log('❌ No school years found! Please add school years first.');
      return;
    }

    // Get existing teachers
    const teachers = await prisma.user.findMany({
      where: { role: 'teacher' }
    });
    if (teachers.length === 0) {
      console.log('❌ No teachers found! Please add teachers first.');
      return;
    }

    console.log(`📅 Found ${schoolYears.length} school years`);
    console.log(`👨‍🏫 Found ${teachers.length} teachers`);

    // Sample courses data
    const courses = [
      {
        courseName: 'ថ្នាក់ទី 1A',
        grade: '1',
        section: 'A',
        schoolYearId: schoolYears[0].schoolYearId,
        teacherIds: [teachers[0].userId]
      },
      {
        courseName: 'ថ្នាក់ទី 1B',
        grade: '1',
        section: 'B',
        schoolYearId: schoolYears[0].schoolYearId,
        teacherIds: [teachers[1].userId]
      },
      {
        courseName: 'ថ្នាក់ទី 2A',
        grade: '2',
        section: 'A',
        schoolYearId: schoolYears[0].schoolYearId,
        teacherIds: [teachers[2].userId]
      },
      {
        courseName: 'ថ្នាក់ទី 2B',
        grade: '2',
        section: 'B',
        schoolYearId: schoolYears[0].schoolYearId,
        teacherIds: [teachers[3].userId]
      },
      {
        courseName: 'ថ្នាក់ទី 3A',
        grade: '3',
        section: 'A',
        schoolYearId: schoolYears[0].schoolYearId,
        teacherIds: [teachers[0].userId]
      },
      {
        courseName: 'ថ្នាក់ទី 4A',
        grade: '4',
        section: 'A',
        schoolYearId: schoolYears[0].schoolYearId,
        teacherIds: [teachers[1].userId]
      },
      {
        courseName: 'ថ្នាក់ទី 5A',
        grade: '5',
        section: 'A',
        schoolYearId: schoolYears[0].schoolYearId,
        teacherIds: [teachers[2].userId]
      },
      {
        courseName: 'ថ្នាក់ទី 6A',
        grade: '6',
        section: 'A',
        schoolYearId: schoolYears[0].schoolYearId,
        teacherIds: [teachers[3].userId]
      }
    ];

    console.log('\n📚 Adding Courses...');
    console.log('----------------------');

    for (const courseData of courses) {
      try {
        // Check if course already exists
        const existingCourse = await prisma.course.findFirst({
          where: {
            courseName: courseData.courseName,
            schoolYearId: courseData.schoolYearId
          }
        });

        if (existingCourse) {
          console.log(`⚠️  Course ${courseData.courseName} already exists`);
          continue;
        }

        // Create course
        const newCourse = await prisma.course.create({
          data: {
            courseName: courseData.courseName,
            grade: courseData.grade,
            section: courseData.section,
            schoolYearId: courseData.schoolYearId
          }
        });

        // Connect teachers to the course
        if (courseData.teacherIds.length > 0) {
          await prisma.course.update({
            where: { courseId: newCourse.courseId },
            data: {
              teachers: {
                connect: courseData.teacherIds.map(id => ({ userId: id }))
              }
            }
          });
        }

        console.log(`✅ Added course: ${newCourse.courseName} (ID: ${newCourse.courseId})`);
      } catch (error) {
        console.error(`❌ Error adding course ${courseData.courseName}:`, error.message);
      }
    }

    // Display final statistics
    console.log('\n📊 Final Course Statistics:');
    console.log('----------------------------');
    
    const totalCourses = await prisma.course.count();
    const coursesWithTeachers = await prisma.course.count({
      where: {
        teachers: {
          some: {}
        }
      }
    });

    console.log(`Total Courses: ${totalCourses}`);
    console.log(`Courses with Teachers: ${coursesWithTeachers}`);

  } catch (error) {
    console.error('❌ Error adding courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addCourses();
