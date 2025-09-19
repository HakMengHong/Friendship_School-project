const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addTeachers() {
  console.log('👥 Adding Admin User to Database');
  console.log('==================================\n');

  try {
    // Admin user data
    const teachers = [
      {
        username: 'admin',
        firstname: 'Admin',
        lastname: 'User',
        role: 'admin',
        position: 'System Administrator',
        phonenumber1: '012345678',
        status: 'active'
      }
    ];

    console.log('📝 Adding admin user...\n');

    for (const teacher of teachers) {
      try {
        // Check if teacher already exists
        const existingTeacher = await prisma.user.findUnique({
          where: { username: teacher.username }
        });

        if (existingTeacher) {
          console.log(`⚠️  Admin user ${teacher.firstname} ${teacher.lastname} already exists`);
          continue;
        }

        // Hash password (default password: 'password')
        const hashedPassword = await bcrypt.hash('password', 10);

        // Create admin user
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

        console.log(`✅ Added admin user: ${teacher.firstname} ${teacher.lastname} (ID: ${newTeacher.userId})`);
      } catch (error) {
        console.error(`❌ Error adding admin user ${teacher.firstname} ${teacher.lastname}:`, error.message);
      }
    }

    // Show final count
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    const teacherCount = await prisma.user.count({ where: { role: 'teacher' } });
    const totalUsers = await prisma.user.count();
    
    console.log('\n📊 Final Database Status:');
    console.log('---------------------------');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Admin Users: ${adminCount}`);
    console.log(`Teachers: ${teacherCount}`);

    if (adminCount > 0) {
      console.log('\n🎉 Admin user added successfully!');
      console.log('Username: admin');
      console.log('Password: password');
    } else {
      console.log('\n⚠️  No admin user was added. Check the errors above.');
    }

  } catch (error) {
    console.error('❌ Error in addTeachers function:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addTeachers();
