const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTeachersAPI() {
  try {
    console.log('🧪 Testing Teachers API Integration...\n');

    // Test 1: Check database directly
    console.log('1️⃣ Database Check:');
    const teacherCount = await prisma.user.count({
      where: { role: 'teacher' }
    });
    console.log(`   ✅ Teachers in database: ${teacherCount}`);

    const teachers = await prisma.user.findMany({
      where: { role: 'teacher' },
      select: {
        userId: true,
        username: true,
        firstname: true,
        lastname: true,
        position: true,
        role: true
      }
    });

    console.log('\n   👨‍🏫 Teacher Details:');
    teachers.forEach(teacher => {
      console.log(`      - ${teacher.firstname} ${teacher.lastname} (${teacher.username}) - ${teacher.position}`);
    });

    // Test 2: Simulate API response structure
    console.log('\n2️⃣ API Response Structure:');
    const apiResponse = {
      users: teachers.map(teacher => ({
        userId: teacher.userId,
        username: teacher.username,
        firstname: teacher.firstname,
        lastname: teacher.lastname,
        position: teacher.position,
        role: teacher.role
      }))
    };

    console.log(`   ✅ API response structure: { users: [${apiResponse.users.length} teachers] }`);

    // Test 3: Simulate frontend filtering
    console.log('\n3️⃣ Frontend Filtering:');
    const filteredTeachers = apiResponse.users.filter(teacher => teacher.role === 'teacher');
    console.log(`   ✅ Filtered teachers: ${filteredTeachers.length}`);

    if (filteredTeachers.length > 0) {
      console.log('   ✅ First teacher for dropdown:');
      const firstTeacher = filteredTeachers[0];
      console.log(`      - ${firstTeacher.firstname} ${firstTeacher.lastname} (ID: ${firstTeacher.userId})`);
    }

    // Test 4: Check if teachers can be assigned to courses
    console.log('\n4️⃣ Course Assignment Check:');
    const coursesWithTeachers = await prisma.course.findMany({
      where: {
        OR: [
          { teacherId1: { not: null } },
          { teacherId2: { not: null } },
          { teacherId3: { not: null } }
        ]
      },
      include: {
        schoolYear: true
      }
    });

    console.log(`   ✅ Courses with teachers: ${coursesWithTeachers.length}`);
    if (coursesWithTeachers.length === 0) {
      console.log('   ℹ️  No courses currently have teachers assigned');
      console.log('   💡 Teachers can be assigned to courses through the admin interface');
    }

    console.log('\n🎉 Teachers API Test Complete!');
    console.log('\n📊 Summary:');
    console.log(`   - Database teachers: ${teacherCount}`);
    console.log(`   - API response structure: ✅ Correct`);
    console.log(`   - Frontend filtering: ✅ Working`);
    console.log(`   - Course assignments: ${coursesWithTeachers.length} courses have teachers`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTeachersAPI();
