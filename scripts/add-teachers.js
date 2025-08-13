const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addTeachers() {
  try {
    console.log('👨‍🏫 Adding Sample Teachers...\n');

    const teachers = [
      {
        username: 'sok.meng',
        password: 'password123',
        firstname: 'សុខ',
        lastname: 'ម៉េង',
        role: 'teacher',
        position: 'គ្រូបង្រៀនគណិតវិទ្យា',
        phonenumber1: '012345678',
        status: 'active'
      },
      {
        username: 'mao.sreyni',
        password: 'password123',
        firstname: 'ម៉ៅ',
        lastname: 'ស្រីនី',
        role: 'teacher',
        position: 'គ្រូបង្រៀនភាសាអង់គ្លេស',
        phonenumber1: '012345679',
        status: 'active'
      },
      {
        username: 'vong.sokha',
        password: 'password123',
        firstname: 'វង្ស',
        lastname: 'សុខា',
        role: 'teacher',
        position: 'គ្រូបង្រៀនវិទ្យាសាស្រ្ត',
        phonenumber1: '012345680',
        status: 'active'
      },
      {
        username: 'kim.sopheak',
        password: 'password123',
        firstname: 'គឹម',
        lastname: 'សុភាក្រោម',
        role: 'teacher',
        position: 'គ្រូបង្រៀនភាសាខ្មែរ',
        phonenumber1: '012345681',
        status: 'active'
      },
      {
        username: 'chhem.vanna',
        password: 'password123',
        firstname: 'ឈឹម',
        lastname: 'វណ្ណា',
        role: 'teacher',
        position: 'គ្រូបង្រៀនប្រវត្តិវិទ្យា',
        phonenumber1: '012345682',
        status: 'active'
      }
    ];

    console.log(`📝 Adding ${teachers.length} teachers...\n`);

    for (const teacherData of teachers) {
      try {
        // Check if teacher already exists
        const existingTeacher = await prisma.user.findUnique({
          where: { username: teacherData.username }
        });

        if (existingTeacher) {
          console.log(`   ⚠️  Teacher ${teacherData.username} already exists, skipping...`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(teacherData.password, 10);

        // Create teacher
        const teacher = await prisma.user.create({
          data: {
            username: teacherData.username,
            password: hashedPassword,
            firstname: teacherData.firstname,
            lastname: teacherData.lastname,
            role: teacherData.role,
            position: teacherData.position,
            phonenumber1: teacherData.phonenumber1,
            avatar: `${teacherData.firstname.charAt(0)}${teacherData.lastname.charAt(0)}`,
            status: teacherData.status
          }
        });

        console.log(`   ✅ Added: ${teacher.firstname} ${teacher.lastname} (${teacher.username}) - ${teacher.position}`);
      } catch (error) {
        console.error(`   ❌ Error adding teacher ${teacherData.username}:`, error.message);
      }
    }

    // Verify teachers were added
    const teacherCount = await prisma.user.count({
      where: { role: 'teacher' }
    });

    console.log(`\n🎉 Successfully added teachers!`);
    console.log(`📊 Total teachers in database: ${teacherCount}`);

    // Show all teachers
    const allTeachers = await prisma.user.findMany({
      where: { role: 'teacher' },
      select: {
        username: true,
        firstname: true,
        lastname: true,
        position: true,
        status: true
      }
    });

    console.log('\n👨‍🏫 Current Teachers:');
    allTeachers.forEach(teacher => {
      console.log(`   - ${teacher.firstname} ${teacher.lastname} (${teacher.username}) - ${teacher.position}`);
    });

  } catch (error) {
    console.error('❌ Error adding teachers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addTeachers();
