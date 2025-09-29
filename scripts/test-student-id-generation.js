#!/usr/bin/env node

/**
 * Test Student ID Generation
 * 
 * This script tests the student ID generation to ensure it starts from 1000+
 */

const fetch = require('node-fetch');

async function testStudentIdGeneration() {
  console.log('🧪 Testing Student ID Generation');
  console.log('=' .repeat(40));
  
  try {
    // Test the API endpoint
    console.log('📡 Testing API endpoint: /api/students/next-id');
    
    const response = await fetch('http://localhost:3000/api/students/next-id');
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    const nextId = parseInt(data.nextStudentId);
    
    console.log(`✅ API Response: ${JSON.stringify(data)}`);
    console.log(`🔍 Next Student ID: ${nextId}`);
    
    // Validate the ID
    if (nextId >= 1000) {
      console.log('✅ SUCCESS: Student ID is >= 1000');
      console.log('🎉 Student ID generation is working correctly!');
    } else {
      console.log('❌ FAILURE: Student ID is < 1000');
      console.log('⚠️  Student ID generation needs to be fixed');
      process.exit(1);
    }
    
    // Test multiple calls to ensure consistency
    console.log('\n🔄 Testing multiple ID generations...');
    
    const ids = [];
    for (let i = 0; i < 5; i++) {
      const testResponse = await fetch('http://localhost:3000/api/students/next-id');
      const testData = await testResponse.json();
      const testId = parseInt(testData.nextStudentId);
      ids.push(testId);
      console.log(`   Call ${i + 1}: ${testId}`);
    }
    
    // Check if all IDs are >= 1000
    const allValid = ids.every(id => id >= 1000);
    if (allValid) {
      console.log('✅ All generated IDs are >= 1000');
    } else {
      console.log('❌ Some generated IDs are < 1000');
      process.exit(1);
    }
    
    console.log('\n🎯 Test Results Summary:');
    console.log(`   - API endpoint: Working`);
    console.log(`   - ID range: ${Math.min(...ids)} - ${Math.max(...ids)}`);
    console.log(`   - All IDs >= 1000: ${allValid ? 'Yes' : 'No'}`);
    console.log('\n✅ All tests passed! Student ID generation is ready.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure your Next.js server is running on port 3000');
      console.log('   Run: npm run dev');
    }
    
    process.exit(1);
  }
}

// Run the test
testStudentIdGeneration();
