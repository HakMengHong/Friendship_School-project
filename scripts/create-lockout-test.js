const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createLockoutTest() {
  console.log('🔒 Creating Lockout Test');
  console.log('========================');
  
  try {
    // Find teacher1 user
    const user = await prisma.user.findUnique({
      where: { username: 'teacher1' }
    });

    if (!user) {
      console.log('❌ teacher1 user not found');
      return;
    }

    console.log(`👤 Found user: ${user.firstname} ${user.lastname}`);
    console.log(`🔒 Current status: ${user.status}`);
    console.log(`🔐 Current failed attempts: ${user.failedLoginAttempts || 0}`);
    console.log(`⏰ Current lockout: ${user.accountLockedUntil || 'None'}`);

    // Set up a temporary lockout for testing
    const lockoutTime = new Date();
    lockoutTime.setMinutes(lockoutTime.getMinutes() + 30); // 30 minutes from now

    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        failedLoginAttempts: 3,
        lastFailedLogin: new Date(),
        accountLockedUntil: lockoutTime
      }
    });

    console.log('✅ Lockout test created successfully!');
    console.log(`⏰ User will be locked until: ${lockoutTime.toLocaleString()}`);
    console.log('');
    console.log('🔍 Now go to your users dashboard and you should see:');
    console.log('   - Orange lockout badge in status column');
    console.log('   - Unlock button (🔓) in actions column');
    console.log('   - Failed attempts counter');
    console.log('');
    console.log('🌐 Dashboard URL: http://localhost:3000/dashboard/users');

  } catch (error) {
    console.error('❌ Error creating lockout test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createLockoutTest();
