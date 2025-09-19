const fetch = require('node-fetch');

async function testGrade9API() {
  try {
    console.log('🧪 Testing Grade 9 Yearly Report via API...\n');
    
    // Test Grade 9 yearly report
    const testData = {
      reportType: 'yearly',
      academicYear: '2024-2025',
      class: '32', // Grade 9A course ID
      format: 'pdf'
    };
    
    console.log('📋 Test Parameters:');
    console.log(`   Report Type: ${testData.reportType}`);
    console.log(`   Academic Year: ${testData.academicYear}`);
    console.log(`   Class: ${testData.class} (Grade 9A)`);
    console.log(`   Format: ${testData.format}\n`);
    
    console.log('🚀 Sending request to API...');
    
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
        console.log('✅ Success! PDF Generated');
        console.log(`📄 Content Type: ${contentType}`);
        console.log(`📊 Content Length: ${response.headers.get('content-length')} bytes`);
        
        console.log('\n🔍 Check the server logs above to see the calculation details.');
        console.log('📊 Expected for Grade 9:');
        console.log('   - Should use sum / 8.4 for average calculation');
        console.log('   - Values should be around 30-40 range');
        
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

testGrade9API();
