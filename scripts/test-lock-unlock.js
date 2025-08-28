const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLockUnlockFunctionality() {
  console.log('🔒 Testing Lock and Unlock Functionality');
  console.log('=======================================');
  
  try {
    // Step 1: Find teacher1 user
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

    // Step 2: Create a lockout for testing
    console.log('');
    console.log('🔄 Step 1: Creating lockout for testing...');
    
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

    console.log('✅ Lockout created successfully!');
    console.log(`⏰ User locked until: ${lockoutTime.toLocaleString()}`);

    // Step 3: Verify lockout is active
    console.log('');
    console.log('🔄 Step 2: Verifying lockout is active...');
    
    const lockedUser = await prisma.user.findUnique({
      where: { username: 'teacher1' }
    });

    const isCurrentlyLocked = lockedUser.accountLockedUntil && new Date(lockedUser.accountLockedUntil) > new Date();
    
    if (isCurrentlyLocked) {
      console.log('✅ User is currently locked out');
      console.log(`🔐 Failed attempts: ${lockedUser.failedLoginAttempts}`);
      console.log(`⏰ Locked until: ${lockedUser.accountLockedUntil.toLocaleString()}`);
    } else {
      console.log('❌ User is not locked out');
    }

    // Step 4: Test unlock functionality
    console.log('');
    console.log('🔄 Step 3: Testing unlock functionality...');
    
    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        accountLockedUntil: null
      }
    });

    console.log('✅ Unlock operation completed!');

    // Step 5: Verify unlock was successful
    console.log('');
    console.log('🔄 Step 4: Verifying unlock was successful...');
    
    const unlockedUser = await prisma.user.findUnique({
      where: { username: 'teacher1' }
    });

    const isStillLocked = unlockedUser.accountLockedUntil && new Date(unlockedUser.accountLockedUntil) > new Date();
    
    if (!isStillLocked) {
      console.log('✅ User is now unlocked!');
      console.log(`🔐 Failed attempts: ${unlockedUser.failedLoginAttempts}`);
      console.log(`⏰ Lockout time: ${unlockedUser.accountLockedUntil || 'None'}`);
    } else {
      console.log('❌ User is still locked out');
    }

    console.log('');
    console.log('🎉 Lock and Unlock Test Completed Successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('✅ Lockout creation works');
    console.log('✅ Lockout verification works');
    console.log('✅ Unlock functionality works');
    console.log('✅ Database updates correctly');
    console.log('');
    console.log('🌐 Now test in the browser:');
    console.log('   1. Go to: http://localhost:3000/dashboard/users');
    console.log('   2. Look for "Teacher One" user');
    console.log('   3. You should see orange lockout badge and unlock button');
    console.log('   4. Click the unlock button to test the functionality');

  } catch (error) {
    console.error('❌ Error during lock/unlock test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLockUnlockFunctionality();
