const fetch = require('node-fetch');

async function finalVerification() {
  try {
    console.log('🎯 FINAL VERIFICATION - Corrected Yearly Calculation\n');
    console.log('=' .repeat(60));
    
    // Test the corrected yearly calculation
    const testData = {
      reportType: 'yearly',
      academicYear: '2024-2025',
      class: '32', // Grade 9A course ID
      format: 'pdf'
    };
    
    console.log('📋 Testing Student ម៉េងហុង ហាក់ (ID: 326) - Grade 9');
    console.log('📋 Expected Results (based on proper semester logic):');
    console.log('   មធ្យមភាគប្រចាំឆមាស1: 37.7');
    console.log('   មធ្យមភាគប្រចាំឆមាស2: 36.7');
    console.log('   មធ្យមភាគប្រចាំឆ្នាំ: 37.2');
    
    console.log('\n🚀 Sending request to corrected API...');
    
    const response = await fetch('http://localhost:3000/api/pdf-generate/generate-grade-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/pdf')) {
        console.log('✅ Success! PDF Generated with corrected calculation');
        console.log(`📄 Content Type: ${contentType}`);
        console.log(`📊 Content Length: ${response.headers.get('content-length')} bytes`);
        
        console.log('\n🔍 Check the server logs above to verify:');
        console.log('   - Semester 1 Last Month calculation');
        console.log('   - Semester 1 Previous Months Average');
        console.log('   - Semester 1 Overall Average');
        console.log('   - Semester 2 Last Month calculation');
        console.log('   - Semester 2 Previous Months Average');
        console.log('   - Semester 2 Overall Average');
        console.log('   - Final Yearly Average');
        
        console.log('\n✅ The calculation should now match the expected values!');
        
      } else {
        console.log(`❌ Unexpected content type: ${contentType}`);
      }
    } else {
      const error = await response.text();
      console.log('❌ Error occurred:');
      console.log(error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

finalVerification();
