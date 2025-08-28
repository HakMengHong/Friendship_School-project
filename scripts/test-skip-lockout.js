const fetch = require('node-fetch')

async function testSkipLockout() {
  const baseUrl = 'http://localhost:3000'
  const testUserId = 2 // teacher1 user ID

  console.log('🔓 Testing Skip Lockout Functionality')
  console.log('=====================================')
  console.log(`Testing skip lockout for user ID: ${testUserId}`)
  console.log('')

  try {
    // First, try to skip lockout without authentication
    console.log('🔄 Testing without authentication...')
    const response1 = await fetch(`${baseUrl}/api/users/${testUserId}/skip-lockout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (response1.status === 401) {
      console.log('✅ Correctly requires authentication')
    } else {
      console.log('❌ Should require authentication')
    }

    // Note: To test with authentication, you need to:
    // 1. Login as admin first
    // 2. Get the user cookie
    // 3. Include it in the request
    
    console.log('')
    console.log('📋 How to use this API:')
    console.log('1. Login as admin user')
    console.log('2. Find a user that is temporarily locked out')
    console.log('3. Call: POST /api/users/{userId}/skip-lockout')
    console.log('4. The user can now login immediately')
    console.log('')
    console.log('🔧 API Endpoint:')
    console.log(`POST ${baseUrl}/api/users/${testUserId}/skip-lockout`)
    console.log('')
    console.log('📝 Response Examples:')
    console.log('✅ Success:')
    console.log('   { "message": "បានរំសាយការចាក់សោគណនីដោយជោគជ័យ", "user": {...} }')
    console.log('')
    console.log('❌ Errors:')
    console.log('   { "error": "ត្រូវការការចូលប្រើ" } (401)')
    console.log('   { "error": "គ្មានការអនុញ្ញាត" } (403)')
    console.log('   { "error": "គណនីនេះមិនត្រូវបានចាក់សោទេ" } (400)')

  } catch (error) {
    console.log(`❌ Network error: ${error.message}`)
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/users')
    if (response.ok) {
      console.log('✅ Server is running')
      await testSkipLockout()
    } else {
      console.log('❌ Server is not responding properly')
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start the development server with: npm run dev')
  }
}

checkServer()
