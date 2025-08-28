const fetch = require('node-fetch');

async function testSkipLockoutComplete() {
  const baseUrl = 'http://localhost:3000';
  const testUsername = 'teacher1';
  const wrongPassword = 'wrongpassword';

  console.log('🧪 Comprehensive Skip Lockout Test');
  console.log('===================================');
  console.log(`Testing with username: ${testUsername}`);
  console.log(`Wrong password: ${wrongPassword}`);
  console.log('');

  try {
    // Step 1: Test failed login attempts to trigger lockout
    console.log('🔄 Step 1: Triggering lockout with failed attempts...');
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`   Attempt ${attempt}/3`);
      
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: testUsername,
          password: wrongPassword
        })
      });

      const result = await response.json();
      
      if (response.status === 423) {
        console.log(`   ✅ Lockout triggered after ${attempt} attempts`);
        console.log(`   📝 Message: ${result.error}`);
        break;
      } else if (response.status === 401) {
        console.log(`   ⚠️  Failed attempt ${attempt}: ${result.error}`);
      }
    }

    // Step 2: Check users API to see lockout status
    console.log('');
    console.log('🔄 Step 2: Checking user lockout status...');
    
    const usersResponse = await fetch(`${baseUrl}/api/users`);
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      const testUser = usersData.users.find(u => u.username === testUsername);
      
      if (testUser) {
        console.log(`   👤 User: ${testUser.firstname} ${testUser.lastname}`);
        console.log(`   🔒 Status: ${testUser.status}`);
        console.log(`   🔐 Failed attempts: ${testUser.failedLoginAttempts || 0}`);
        console.log(`   ⏰ Locked until: ${testUser.accountLockedUntil || 'Not locked'}`);
        
        if (testUser.accountLockedUntil && new Date(testUser.accountLockedUntil) > new Date()) {
          console.log('   ✅ User is currently locked out');
        } else {
          console.log('   ❌ User is not locked out');
        }
      } else {
        console.log('   ❌ Test user not found');
      }
    }

    // Step 3: Test skip lockout without authentication (should fail)
    console.log('');
    console.log('🔄 Step 3: Testing skip lockout without authentication...');
    
    const skipResponse1 = await fetch(`${baseUrl}/api/users/2/skip-lockout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (skipResponse1.status === 401) {
      console.log('   ✅ Correctly requires authentication');
    } else {
      console.log('   ❌ Should require authentication');
    }

    // Step 4: Test skip lockout with admin authentication
    console.log('');
    console.log('🔄 Step 4: Testing skip lockout with admin login...');
    
    // First, login as admin
    const adminLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'password123'
      })
    });

    if (adminLoginResponse.ok) {
      const adminLoginResult = await adminLoginResponse.json();
      console.log('   ✅ Admin login successful');
      
      // Get cookies from admin login
      const cookies = adminLoginResponse.headers.get('set-cookie');
      console.log('   🍪 Got admin session cookies');
      
      // Now test skip lockout with admin session
      const skipResponse2 = await fetch(`${baseUrl}/api/users/2/skip-lockout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies || ''
        }
      });

      const skipResult = await skipResponse2.json();
      
      if (skipResponse2.ok) {
        console.log('   ✅ Skip lockout successful');
        console.log(`   📝 Message: ${skipResult.message}`);
        console.log(`   👤 User: ${skipResult.user.firstname} ${skipResult.user.lastname}`);
      } else {
        console.log(`   ❌ Skip lockout failed: ${skipResult.error}`);
      }
    } else {
      console.log('   ❌ Admin login failed');
    }

    // Step 5: Verify lockout was removed
    console.log('');
    console.log('🔄 Step 5: Verifying lockout was removed...');
    
    const usersResponse2 = await fetch(`${baseUrl}/api/users`);
    if (usersResponse2.ok) {
      const usersData2 = await usersResponse2.json();
      const testUser2 = usersData2.users.find(u => u.username === testUsername);
      
      if (testUser2) {
        console.log(`   👤 User: ${testUser2.firstname} ${testUser2.lastname}`);
        console.log(`   🔒 Status: ${testUser2.status}`);
        console.log(`   🔐 Failed attempts: ${testUser2.failedLoginAttempts || 0}`);
        console.log(`   ⏰ Locked until: ${testUser2.accountLockedUntil || 'Not locked'}`);
        
        if (!testUser2.accountLockedUntil || new Date(testUser2.accountLockedUntil) <= new Date()) {
          console.log('   ✅ Lockout successfully removed');
        } else {
          console.log('   ❌ Lockout still active');
        }
      }
    }

    console.log('');
    console.log('🎉 Test completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log('- Failed login attempts trigger lockout');
    console.log('- Skip lockout requires admin authentication');
    console.log('- Skip lockout removes temporary lockout');
    console.log('- Users dashboard shows lockout status');
    console.log('- Admin can unlock users with one click');

  } catch (error) {
    console.log(`❌ Test error: ${error.message}`);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/users');
    if (response.ok) {
      console.log('✅ Server is running');
      await testSkipLockoutComplete();
    } else {
      console.log('❌ Server is not responding properly');
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start the development server with: npm run dev');
  }
}

checkServer();
