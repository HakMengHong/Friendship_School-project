const fetch = require('node-fetch')

async function testFailedLogin() {
  const baseUrl = 'http://localhost:3000'
  const testUsername = 'teacher1'
  const wrongPassword = 'wrongpassword'

  console.log('🧪 Testing Failed Login Functionality')
  console.log('=====================================')
  console.log(`Testing with username: ${testUsername}`)
  console.log(`Wrong password: ${wrongPassword}`)
  console.log('')

  for (let attempt = 1; attempt <= 6; attempt++) {
    console.log(`🔄 Attempt ${attempt}/6`)
    
    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: testUsername,
          password: wrongPassword
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ Login successful (unexpected)')
        break
      } else {
        console.log(`❌ Login failed: ${data.error}`)
        console.log(`   Status: ${response.status}`)
        
        if (attempt >= 3 && attempt < 5) {
          console.log('   ⏰ Account temporarily locked for 15 minutes')
        } else if (attempt === 5) {
          console.log('   🔒 Account permanently deactivated!')
        }
      }
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`)
    }
    
    console.log('')
    
    // Wait 1 second between attempts
    if (attempt < 6) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  console.log('🎯 Test completed!')
  console.log('')
  console.log('📋 Expected Behavior:')
  console.log('- Attempts 1-2: Show remaining attempts')
  console.log('- Attempts 3-4: Temporary lockout (15 minutes)')
  console.log('- Attempt 5: Account permanently deactivated')
  console.log('- Attempt 6: Account inactive error')
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/users')
    if (response.ok) {
      console.log('✅ Server is running')
      await testFailedLogin()
    } else {
      console.log('❌ Server is not responding properly')
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start the development server with: npm run dev')
  }
}

checkServer()
