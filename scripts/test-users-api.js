const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUsersAPI() {
  console.log('🧪 Testing Users API');
  console.log('===================\n');

  try {
    // Test 1: Check database directly
    console.log('1️⃣ Checking database directly...');
    
    const dbUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Database users count: ${dbUsers.length}`);
    
    if (dbUsers.length > 0) {
      console.log('📋 Sample user from database:');
      const sampleUser = dbUsers[0];
      console.log(`  - userId: ${sampleUser.userId}`);
      console.log(`  - username: ${sampleUser.username}`);
      console.log(`  - firstname: ${sampleUser.firstname}`);
      console.log(`  - lastname: ${sampleUser.lastname}`);
      console.log(`  - role: ${sampleUser.role}`);
      console.log(`  - status: ${sampleUser.status}`);
    }

    // Test 2: Check teachers specifically
    console.log('\n2️⃣ Checking teachers...');
    
    const teachers = dbUsers.filter(user => user.role === 'teacher' && user.status === 'active');
    console.log(`✅ Active teachers count: ${teachers.length}`);
    
    if (teachers.length > 0) {
      console.log('📋 Sample teacher:');
      const sampleTeacher = teachers[0];
      console.log(`  - ${sampleTeacher.firstname} ${sampleTeacher.lastname} (${sampleTeacher.username})`);
    }

    // Test 3: Check admins specifically
    console.log('\n3️⃣ Checking admins...');
    
    const admins = dbUsers.filter(user => user.role === 'admin' && user.status === 'active');
    console.log(`✅ Active admins count: ${admins.length}`);
    
    if (admins.length > 0) {
      console.log('📋 Sample admin:');
      const sampleAdmin = admins[0];
      console.log(`  - ${sampleAdmin.firstname} ${sampleAdmin.lastname} (${sampleAdmin.username})`);
    }

    // Test 4: Simulate API response structure
    console.log('\n4️⃣ Simulating API response structure...');
    
    const transformedUsers = dbUsers.map(user => ({
      userid: user.userId,
      username: user.username,
      password: '', // Don't send password
      firstname: user.firstname,
      lastname: user.lastname,
      phonenumber1: user.phonenumber1,
      phonenumber2: user.phonenumber2,
      role: user.role,
      avatar: user.avatar,
      position: user.position,
      photo: user.photo,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      status: user.status
    }));

    const apiResponse = { users: transformedUsers };
    
    console.log('✅ API response structure:');
    console.log(`  - Has 'users' property: ${apiResponse.hasOwnProperty('users')}`);
    console.log(`  - 'users' is array: ${Array.isArray(apiResponse.users)}`);
    console.log(`  - 'users' length: ${apiResponse.users.length}`);
    
    // Test 5: Simulate frontend filtering
    console.log('\n5️⃣ Simulating frontend filtering...');
    
    const teacherUsers = apiResponse.users.filter(user => 
      user.role === 'teacher' && user.status === 'active'
    );
    
    console.log(`✅ Filtered teachers count: ${teacherUsers.length}`);
    
    if (teacherUsers.length > 0) {
      console.log('📋 Filtered teacher sample:');
      const sampleFilteredTeacher = teacherUsers[0];
      console.log(`  - ${sampleFilteredTeacher.firstname} ${sampleFilteredTeacher.lastname}`);
      console.log(`  - userid: ${sampleFilteredTeacher.userid}`);
      console.log(`  - role: ${sampleFilteredTeacher.role}`);
      console.log(`  - status: ${sampleFilteredTeacher.status}`);
    }

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUsersAPI();
