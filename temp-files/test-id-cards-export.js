/*
 * Test script to verify ID cards export functionality
 * Tests the new consolidated /api/pdf-generate/generate-id-cards route
 */

const BASE_URL = 'http://localhost:3000'

// Test data
const testStudentId = 1
const testTeacherId = 1

// Test functions
async function testStudentIDCardExport() {
  console.log('🧪 Testing Student ID Card Export...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/pdf-generate/generate-id-cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'student',
        variant: 'single',
        studentIds: [testStudentId]
      })
    })

    if (response.ok) {
      const blob = await response.blob()
      console.log('✅ Student ID Card Export: SUCCESS')
      console.log(`   - Content-Type: ${response.headers.get('content-type')}`)
      console.log(`   - File Size: ${(blob.size / 1024).toFixed(2)} KB`)
      console.log(`   - Content-Disposition: ${response.headers.get('content-disposition')}`)
      return true
    } else {
      const error = await response.json()
      console.log('❌ Student ID Card Export: FAILED')
      console.log(`   - Status: ${response.status}`)
      console.log(`   - Error: ${error.error || 'Unknown error'}`)
      return false
    }
  } catch (error) {
    console.log('❌ Student ID Card Export: ERROR')
    console.log(`   - Error: ${error.message}`)
    return false
  }
}

async function testTeacherIDCardExport() {
  console.log('🧪 Testing Teacher ID Card Export...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/pdf-generate/generate-id-cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'teacher',
        variant: 'single',
        userIds: [testTeacherId]
      })
    })

    if (response.ok) {
      const blob = await response.blob()
      console.log('✅ Teacher ID Card Export: SUCCESS')
      console.log(`   - Content-Type: ${response.headers.get('content-type')}`)
      console.log(`   - File Size: ${(blob.size / 1024).toFixed(2)} KB`)
      console.log(`   - Content-Disposition: ${response.headers.get('content-disposition')}`)
      return true
    } else {
      const error = await response.json()
      console.log('❌ Teacher ID Card Export: FAILED')
      console.log(`   - Status: ${response.status}`)
      console.log(`   - Error: ${error.error || 'Unknown error'}`)
      return false
    }
  } catch (error) {
    console.log('❌ Teacher ID Card Export: ERROR')
    console.log(`   - Error: ${error.message}`)
    return false
  }
}

async function testBulkStudentIDCardExport() {
  console.log('🧪 Testing Bulk Student ID Card Export...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/pdf-generate/generate-id-cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'student',
        variant: 'bulk',
        studentIds: [1, 2, 3, 4],
        schoolYear: '2024-2025'
      })
    })

    if (response.ok) {
      const blob = await response.blob()
      console.log('✅ Bulk Student ID Card Export: SUCCESS')
      console.log(`   - Content-Type: ${response.headers.get('content-type')}`)
      console.log(`   - File Size: ${(blob.size / 1024).toFixed(2)} KB`)
      console.log(`   - Content-Disposition: ${response.headers.get('content-disposition')}`)
      return true
    } else {
      const error = await response.json()
      console.log('❌ Bulk Student ID Card Export: FAILED')
      console.log(`   - Status: ${response.status}`)
      console.log(`   - Error: ${error.error || 'Unknown error'}`)
      return false
    }
  } catch (error) {
    console.log('❌ Bulk Student ID Card Export: ERROR')
    console.log(`   - Error: ${error.message}`)
    return false
  }
}

async function testStudentIDCardBackExport() {
  console.log('🧪 Testing Student ID Card Back Export...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/pdf-generate/generate-id-cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'student',
        variant: 'back',
        studentIds: [1, 2, 3, 4],
        schoolYear: '2024-2025'
      })
    })

    if (response.ok) {
      const blob = await response.blob()
      console.log('✅ Student ID Card Back Export: SUCCESS')
      console.log(`   - Content-Type: ${response.headers.get('content-type')}`)
      console.log(`   - File Size: ${(blob.size / 1024).toFixed(2)} KB`)
      console.log(`   - Content-Disposition: ${response.headers.get('content-disposition')}`)
      return true
    } else {
      const error = await response.json()
      console.log('❌ Student ID Card Back Export: FAILED')
      console.log(`   - Status: ${response.status}`)
      console.log(`   - Error: ${error.error || 'Unknown error'}`)
      return false
    }
  } catch (error) {
    console.log('❌ Student ID Card Back Export: ERROR')
    console.log(`   - Error: ${error.message}`)
    return false
  }
}

async function testBulkTeacherIDCardExport() {
  console.log('🧪 Testing Bulk Teacher ID Card Export...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/pdf-generate/generate-id-cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'teacher',
        variant: 'bulk',
        userIds: [1, 2, 3, 4],
        schoolYear: '2024-2025'
      })
    })

    if (response.ok) {
      const blob = await response.blob()
      console.log('✅ Bulk Teacher ID Card Export: SUCCESS')
      console.log(`   - Content-Type: ${response.headers.get('content-type')}`)
      console.log(`   - File Size: ${(blob.size / 1024).toFixed(2)} KB`)
      console.log(`   - Content-Disposition: ${response.headers.get('content-disposition')}`)
      return true
    } else {
      const error = await response.json()
      console.log('❌ Bulk Teacher ID Card Export: FAILED')
      console.log(`   - Status: ${response.status}`)
      console.log(`   - Error: ${error.error || 'Unknown error'}`)
      return false
    }
  } catch (error) {
    console.log('❌ Bulk Teacher ID Card Export: ERROR')
    console.log(`   - Error: ${error.message}`)
    return false
  }
}

async function testClassBasedExport() {
  console.log('🧪 Testing Class-based ID Card Export...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/pdf-generate/generate-id-cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'student',
        variant: 'bulk',
        classId: '1A',
        schoolYear: '2024-2025'
      })
    })

    if (response.ok) {
      const blob = await response.blob()
      console.log('✅ Class-based ID Card Export: SUCCESS')
      console.log(`   - Content-Type: ${response.headers.get('content-type')}`)
      console.log(`   - File Size: ${(blob.size / 1024).toFixed(2)} KB`)
      console.log(`   - Content-Disposition: ${response.headers.get('content-disposition')}`)
      return true
    } else {
      const error = await response.json()
      console.log('❌ Class-based ID Card Export: FAILED')
      console.log(`   - Status: ${response.status}`)
      console.log(`   - Error: ${error.error || 'Unknown error'}`)
      return false
    }
  } catch (error) {
    console.log('❌ Class-based ID Card Export: ERROR')
    console.log(`   - Error: ${error.message}`)
    return false
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting ID Cards Export Tests...\n')
  
  const results = await Promise.all([
    testStudentIDCardExport(),
    testTeacherIDCardExport(),
    testBulkStudentIDCardExport(),
    testStudentIDCardBackExport(),
    testBulkTeacherIDCardExport(),
    testClassBasedExport()
  ])
  
  const successCount = results.filter(Boolean).length
  const totalTests = results.length
  
  console.log('\n📊 Test Results Summary:')
  console.log(`✅ Passed: ${successCount}/${totalTests}`)
  console.log(`❌ Failed: ${totalTests - successCount}/${totalTests}`)
  
  if (successCount === totalTests) {
    console.log('\n🎉 All ID Cards Export Tests PASSED!')
    console.log('✅ The consolidated route is working correctly!')
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.')
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
  await runAllTests()
}

main().catch(console.error)
