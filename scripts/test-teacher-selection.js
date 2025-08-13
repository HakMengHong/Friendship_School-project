const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTeacherSelection() {
  console.log('🧪 Testing Teacher Selection');
  console.log('============================\n');

  try {
    // Check current users
    const users = await prisma.user.findMany({
      where: { role: 'teacher' },
      select: {
        userId: true,
        username: true,
        firstname: true,
        lastname: true,
        role: true,
        status: true
      }
    });

    console.log('👥 Teachers in database:');
    console.log('------------------------');
    users.forEach(user => {
      console.log(`ID: ${user.userId}, Name: ${user.firstname} ${user.lastname}, Role: ${user.role}, Status: ${user.status}`);
    });

    // Check if there are any teachers
    if (users.length === 0) {
      console.log('\n⚠️  No teachers found in the database!');
      console.log('This might be why the teacher selection is not working.');
      
      // Check all users
      const allUsers = await prisma.user.findMany({
        select: {
          userId: true,
          username: true,
          firstname: true,
          lastname: true,
          role: true,
          status: true
        }
      });
      
      console.log('\n👥 All users in database:');
      console.log('------------------------');
      allUsers.forEach(user => {
        console.log(`ID: ${user.userId}, Name: ${user.firstname} ${user.lastname}, Role: ${user.role}, Status: ${user.status}`);
      });
    } else {
      console.log(`\n✅ Found ${users.length} teacher(s) in the database`);
    }

    // Check user count
    const totalUsers = await prisma.user.count();
    const totalTeachers = await prisma.user.count({ where: { role: 'teacher' } });
    const totalAdmins = await prisma.user.count({ where: { role: 'admin' } });

    console.log('\n📊 User Statistics:');
    console.log('-------------------');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Teachers: ${totalTeachers}`);
    console.log(`Admins: ${totalAdmins}`);

  } catch (error) {
    console.error('❌ Error testing teacher selection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTeacherSelection();
