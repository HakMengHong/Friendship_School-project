/*
 * Test script to verify ID cards frontend page loads correctly
 * Tests that the page renders without errors
 */

const BASE_URL = 'http://localhost:3000'

async function testIDCardsPageLoad() {
  console.log('🧪 Testing ID Cards Page Load...')
  
  try {
    const response = await fetch(`${BASE_URL}/dashboard/id-cards`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })

    if (response.ok) {
      const html = await response.text()
      
      // Check for key elements
      const hasStudentCard = html.includes('ប័ណ្ណសម្គាល់សិស្ស')
      const hasTeacherCard = html.includes('ប័ណ្ណសម្គាល់គ្រូ')
      const hasGenerateButton = html.includes('បង្កើត')
      const hasNewRoute = html.includes('/api/pdf-generate/generate-id-cards')
      const hasOldRoutes = html.includes('/api/pdf-generate/generate-bulk-student-id-card') || 
                          html.includes('/api/pdf-generate/generate-bulk-teacher-id-cards') ||
                          html.includes('/api/pdf-generate/generate-teacher-id-card')
      
      console.log('✅ ID Cards Page Load: SUCCESS')
      console.log(`   - Status: ${response.status}`)
      console.log(`   - Content-Length: ${html.length} characters`)
      console.log(`   - Has Student Card: ${hasStudentCard ? '✅' : '❌'}`)
      console.log(`   - Has Teacher Card: ${hasTeacherCard ? '✅' : '❌'}`)
      console.log(`   - Has Generate Button: ${hasGenerateButton ? '✅' : '❌'}`)
      console.log(`   - Uses New Route: ${hasNewRoute ? '✅' : '❌'}`)
      console.log(`   - Has Old Routes: ${hasOldRoutes ? '❌ (Should be false)' : '✅'}`)
      
      if (hasStudentCard && hasTeacherCard && hasGenerateButton && hasNewRoute && !hasOldRoutes) {
        console.log('✅ All frontend checks passed!')
        return true
      } else {
        console.log('⚠️  Some frontend checks failed!')
        return false
      }
    } else {
      console.log('❌ ID Cards Page Load: FAILED')
      console.log(`   - Status: ${response.status}`)
      return false
    }
  } catch (error) {
    console.log('❌ ID Cards Page Load: ERROR')
    console.log(`   - Error: ${error.message}`)
    return false
  }
}

async function testAPIEndpointExists() {
  console.log('🧪 Testing API Endpoint Exists...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/pdf-generate/generate-id-cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'student',
        variant: 'single',
        studentIds: [999999] // Non-existent student to test error handling
      })
    })

    // We expect a 400 or 500 error for non-existent student, but the endpoint should exist
    if (response.status === 400 || response.status === 500) {
      console.log('✅ API Endpoint Exists: SUCCESS')
      console.log(`   - Status: ${response.status} (Expected error for non-existent student)`)
      return true
    } else if (response.status === 404) {
      console.log('❌ API Endpoint Exists: FAILED')
      console.log('   - Endpoint not found (404)')
      return false
    } else {
      console.log('✅ API Endpoint Exists: SUCCESS')
      console.log(`   - Status: ${response.status}`)
      return true
    }
  } catch (error) {
    console.log('❌ API Endpoint Exists: ERROR')
    console.log(`   - Error: ${error.message}`)
    return false
  }
}

async function testOldRoutesDeleted() {
  console.log('🧪 Testing Old Routes Are Deleted...')
  
  const oldRoutes = [
    '/api/pdf-generate/generate-bulk-student-id-card',
    '/api/pdf-generate/generate-bulk-student-id-cards-back',
    '/api/pdf-generate/generate-bulk-teacher-id-cards',
    '/api/pdf-generate/generate-teacher-id-card'
  ]
  
  let allDeleted = true
  
  for (const route of oldRoutes) {
    try {
      const response = await fetch(`${BASE_URL}${route}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      })
      
      if (response.status === 404) {
        console.log(`✅ ${route}: DELETED (404)`)
      } else {
        console.log(`❌ ${route}: STILL EXISTS (${response.status})`)
        allDeleted = false
      }
    } catch (error) {
      console.log(`✅ ${route}: DELETED (Connection error)`)
    }
  }
  
  return allDeleted
}

// Run all frontend tests
async function runFrontendTests() {
  console.log('🚀 Starting ID Cards Frontend Tests...\n')
  
  const results = await Promise.all([
    testIDCardsPageLoad(),
    testAPIEndpointExists(),
    testOldRoutesDeleted()
  ])
  
  const successCount = results.filter(Boolean).length
  const totalTests = results.length
  
  console.log('\n📊 Frontend Test Results Summary:')
  console.log(`✅ Passed: ${successCount}/${totalTests}`)
  console.log(`❌ Failed: ${totalTests - successCount}/${totalTests}`)
  
  if (successCount === totalTests) {
    console.log('\n🎉 All Frontend Tests PASSED!')
    console.log('✅ The ID cards page is working correctly!')
  } else {
    console.log('\n⚠️  Some frontend tests failed. Check the errors above.')
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`, { method: 'GET' })
    return response.ok
  } catch (error) {
    return false
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking if server is running...')
  
  const serverRunning = await checkServer()
  if (!serverRunning) {
    console.log('❌ Server is not running!')
    console.log('Please start the development server with: npm run dev')
    console.log('Then run this test again.')
    return
  }
  
  console.log('✅ Server is running!')
  await runFrontendTests()
}

main().catch(console.error)
