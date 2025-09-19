const fetch = require('node-fetch');
const fs = require('fs');

async function testStudent326API() {
  try {
    console.log('🧪 Testing Student ម៉េងហុង ហាក់ (ID: 326) via API...\n');
    
    // Test yearly report for this specific student
    const testData = {
      reportType: 'yearly',
      academicYear: '2024-2025',
      class: '32', // Course ID 32 for Grade 9A
      format: 'pdf'
    };
    
    console.log('📋 Test Parameters:');
    console.log(`   Report Type: ${testData.reportType}`);
    console.log(`   Academic Year: ${testData.academicYear}`);
    console.log(`   Class: ${testData.class} (Grade 9A - Course ID 32)`);
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
        const filename = `student-326-yearly-report-${Date.now()}.pdf`;
        fs.writeFileSync(filename, pdfBuffer);
        console.log(`💾 PDF saved as: ${filename}`);
        
        console.log('\n📊 Expected Results for Student ម៉េងហុង ហាក់:');
        console.log('   មធ្យមភាគប្រចាំឆមាស1: 37.7');
        console.log('   មធ្យមភាគប្រចាំឆមាស2: 36.7');
        console.log('   មធ្យមភាគប្រចាំឆ្នាំ: 37.2');
        console.log('\n🔍 Check the server logs above to verify the calculation matches our manual calculation.');
        
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

testStudent326API();
