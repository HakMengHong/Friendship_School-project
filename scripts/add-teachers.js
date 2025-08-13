const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addTeachers() {
  console.log('👥 Adding Teachers to Database');
  console.log('==============================\n');

  try {
    // Sample teachers data
    const teachers = [
      {
        username: 'ហាក់ម៉េងហុង',
        firstname: 'ហាក់',
        lastname: 'ម៉េងហុង',
        role: 'teacher',
        position: 'គ្រូបង្រៀន',
        phonenumber1: '012345678',
        status: 'active'
      },
      {
        username: 'ហេងសុនី',
        firstname: 'ហេង',
        lastname: 'សុនី',
        role: 'teacher',
        position: 'គ្រូបង្រៀន',
        phonenumber1: '012345679',
        status: 'active'
      },
      {
        username: 'វ៉ាន់សុផល',
        firstname: 'វ៉ាន់',
        lastname: 'សុផល',
        role: 'teacher',
        position: 'គ្រូបង្រៀន',
        phonenumber1: '012345680',
        status: 'active'
      },
      {
        username: 'គឹមសុខា',
        firstname: 'គឹម',
        lastname: 'សុខា',
        role: 'teacher',
        position: 'គ្រូបង្រៀន',
        phonenumber1: '012345681',
        status: 'active'
      },
      {
        username: 'ម៉ៅសុធារី',
        firstname: 'ម៉ៅ',
        lastname: 'សុធារី',
        role: 'teacher',
        position: 'គ្រូបង្រៀន',
        phonenumber1: '012345682',
        status: 'active'
      }
    ];

    console.log('📝 Adding teachers...\n');

    for (const teacher of teachers) {
      try {
        // Check if teacher already exists
        const existingTeacher = await prisma.user.findUnique({
          where: { username: teacher.username }
        });

        if (existingTeacher) {
          console.log(`⚠️  Teacher ${teacher.firstname} ${teacher.lastname} already exists`);
          continue;
        }

        // Hash password (default password: 'password')
        const hashedPassword = await bcrypt.hash('password', 10);

        // Create teacher
        const newTeacher = await prisma.user.create({
          data: {
            username: teacher.username,
            password: hashedPassword,
            firstname: teacher.firstname,
            lastname: teacher.lastname,
            role: teacher.role,
            position: teacher.position,
            phonenumber1: teacher.phonenumber1,
            status: teacher.status,
            avatar: `${teacher.firstname.charAt(0)}${teacher.lastname.charAt(0)}`
          }
        });

        console.log(`✅ Added teacher: ${teacher.firstname} ${teacher.lastname} (ID: ${newTeacher.userId})`);
      } catch (error) {
        console.error(`❌ Error adding teacher ${teacher.firstname} ${teacher.lastname}:`, error.message);
      }
    }

    // Show final count
    const teacherCount = await prisma.user.count({ where: { role: 'teacher' } });
    const totalUsers = await prisma.user.count();
    
    console.log('\n📊 Final Database Status:');
    console.log('---------------------------');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Teachers: ${teacherCount}`);

    if (teacherCount > 0) {
      console.log('\n🎉 Teachers added successfully!');
      console.log('Default password for all teachers: password');
    } else {
      console.log('\n⚠️  No teachers were added. Check the errors above.');
    }

  } catch (error) {
    console.error('❌ Error in addTeachers function:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addTeachers();
