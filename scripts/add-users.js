const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addUsers() {
  console.log('👥 Adding Users to Database');
  console.log('============================\n');

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
        username: 'គឹមសុខណា',
        firstname: 'គឹម',
        lastname: 'សុខណា',
        role: 'teacher',
        position: 'គ្រូបង្រៀន',
        phonenumber1: '012345681',
        status: 'active'
      }
    ];

    // Sample admin users data
    const admins = [
      {
        username: 'admin1',
        firstname: 'អ្នកគ្រប់គ្រង',
        lastname: 'ទី១',
        role: 'admin',
        position: 'អ្នកគ្រប់គ្រងប្រព័ន្ធ',
        phonenumber1: '012345682',
        status: 'active'
      },
      {
        username: 'admin2',
        firstname: 'អ្នកគ្រប់គ្រង',
        lastname: 'ទី២',
        role: 'admin',
        position: 'អ្នកគ្រប់គ្រងប្រព័ន្ធ',
        phonenumber1: '012345683',
        status: 'active'
      },
      {
        username: 'អ្នកគ្រប់គ្រង',
        firstname: 'អ្នកគ្រប់គ្រង',
        lastname: 'គ្រប់គ្រង',
        role: 'admin',
        position: 'អ្នកគ្រប់គ្រងប្រព័ន្ធ',
        phonenumber1: '012345684',
        status: 'active'
      }
    ];

    console.log('👨‍🏫 Adding Teachers...');
    console.log('------------------------');
    
    for (const teacher of teachers) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
          where: { username: teacher.username }
        });

        if (existingUser) {
          console.log(`⚠️  Teacher ${teacher.firstname} ${teacher.lastname} already exists`);
          continue;
        }

        // Create teacher user
        const newTeacher = await prisma.user.create({
          data: {
            username: teacher.username,
            firstname: teacher.firstname,
            lastname: teacher.lastname,
            role: teacher.role,
            position: teacher.position,
            phonenumber1: teacher.phonenumber1,
            status: teacher.status,
            // Set default password for teachers
            password: await bcrypt.hash('teacher123', 10)
          }
        });

        console.log(`✅ Added teacher: ${newTeacher.firstname} ${newTeacher.lastname} (ID: ${newTeacher.userId})`);
      } catch (error) {
        console.error(`❌ Error adding teacher ${teacher.firstname} ${teacher.lastname}:`, error.message);
      }
    }

    console.log('\n👨‍💼 Adding Admin Users...');
    console.log('----------------------------');
    
    for (const admin of admins) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
          where: { username: admin.username }
        });

        if (existingUser) {
          console.log(`⚠️  Admin ${admin.firstname} ${admin.lastname} already exists`);
          continue;
        }

        // Create admin user
        const newAdmin = await prisma.user.create({
          data: {
            username: admin.username,
            firstname: admin.firstname,
            lastname: admin.lastname,
            role: admin.role,
            position: admin.position,
            phonenumber1: admin.phonenumber1,
            status: admin.status,
            // Set default password for admins
            password: await bcrypt.hash('admin123', 10)
          }
        });

        console.log(`✅ Added admin: ${newAdmin.firstname} ${newAdmin.lastname} (ID: ${newAdmin.userId})`);
      } catch (error) {
        console.error(`❌ Error adding admin ${admin.firstname} ${admin.lastname}:`, error.message);
      }
    }

    // Display final statistics
    console.log('\n📊 Final User Statistics:');
    console.log('---------------------------');
    
    const totalUsers = await prisma.user.count();
    const totalTeachers = await prisma.user.count({ where: { role: 'teacher' } });
    const totalAdmins = await prisma.user.count({ where: { role: 'admin' } });

    console.log(`Total Users: ${totalUsers}`);
    console.log(`Teachers: ${totalTeachers}`);
    console.log(`Admins: ${totalAdmins}`);

    console.log('\n🔑 Default Passwords:');
    console.log('----------------------');
    console.log('Teachers: teacher123');
    console.log('Admins: admin123');
    console.log('\n⚠️  Please change these passwords after first login!');

  } catch (error) {
    console.error('❌ Error adding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addUsers();
