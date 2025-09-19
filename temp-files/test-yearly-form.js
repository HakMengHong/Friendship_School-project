const fetch = require('node-fetch');

async function testYearlyFormValidation() {
  try {
    console.log('🧪 Testing Yearly Report Form Validation...\n');
    
    // Test cases for form validation
    const testCases = [
      {
        name: 'Missing Academic Year',
        data: { reportType: 'yearly', class: '28' },
        shouldFail: true
      },
      {
        name: 'Missing Class',
        data: { reportType: 'yearly', academicYear: '2024-2025' },
        shouldFail: true
      },
      {
        name: 'Valid Data',
        data: { reportType: 'yearly', academicYear: '2024-2025', class: '28' },
        shouldFail: false
      },
      {
        name: 'Invalid Academic Year',
        data: { reportType: 'yearly', academicYear: 'invalid-year', class: '28' },
        shouldFail: true
      },
      {
        name: 'Invalid Class',
        data: { reportType: 'yearly', academicYear: '2024-2025', class: '999' },
        shouldFail: true
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📋 Testing: ${testCase.name}`);
      console.log(`   Data: ${JSON.stringify(testCase.data)}`);
      
      try {
        const response = await fetch('http://localhost:3000/api/pdf-generate/generate-grade-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testCase.data)
        });
        
        if (testCase.shouldFail) {
          if (response.status >= 400) {
            console.log(`✅ Expected failure - Status: ${response.status}`);
          } else {
            console.log(`❌ Expected failure but got success - Status: ${response.status}`);
          }
        } else {
          if (response.ok) {
            console.log(`✅ Expected success - Status: ${response.status}`);
          } else {
            const error = await response.text();
            console.log(`❌ Expected success but got failure - Status: ${response.status}`);
            console.log(`   Error: ${error.substring(0, 200)}...`);
          }
        }
      } catch (error) {
        console.log(`❌ Request failed: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Form validation tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

testYearlyFormValidation();
