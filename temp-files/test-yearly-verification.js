const fetch = require('node-fetch');
const fs = require('fs');

async function testYearlyVerification() {
  try {
    console.log('🧪 Testing Yearly Report Calculation Verification...\n');
    
    const testData = {
      reportType: 'yearly',
      academicYear: '2024-2025',
      class: '28', // Grade 5A course ID
      format: 'pdf'
    };
    
    console.log('📋 Test Parameters:');
    console.log(`   Report Type: ${testData.reportType}`);
    console.log(`   Academic Year: ${testData.academicYear}`);
    console.log(`   Class: ${testData.class} (Grade 5A)`);
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
        
        // Save the PDF to a file for inspection
        const pdfBuffer = await response.buffer();
        const filename = `yearly-verification-${Date.now()}.pdf`;
        fs.writeFileSync(filename, pdfBuffer);
        console.log(`💾 PDF saved as: ${filename}`);
        
        console.log('\n📊 Expected Calculation Logic:');
        console.log('   - Semester 1 average: Calculated using grade-specific rules');
        console.log('   - Semester 2 average: Calculated using grade-specific rules');
        console.log('   - Yearly average: (sem1 + sem2) / 2');
        console.log('   - Example: If sem1=37.4 and sem2=36.7, then yearly=(37.4+36.7)/2=37.05');
        
        console.log('\n🔍 Check the server logs above for detailed calculation steps.');
        
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

testYearlyVerification();
