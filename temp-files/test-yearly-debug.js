const fetch = require('node-fetch');

async function testYearlyDebug() {
  try {
    console.log('🧪 Testing Yearly Report with Debug Output...\n');
    
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
        const fs = require('fs');
        const pdfBuffer = await response.buffer();
        const filename = `test-yearly-debug-${Date.now()}.pdf`;
        fs.writeFileSync(filename, pdfBuffer);
        console.log(`💾 PDF saved as: ${filename}`);
        
      } else {
        // Try to parse as JSON for other responses
        const result = await response.json();
        console.log('✅ Success!');
        console.log(`📄 PDF Generated: ${result.filename}`);
        console.log(`📁 File Path: ${result.filePath}`);
        console.log(`📊 Students Processed: ${result.studentCount || 'Unknown'}`);
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

testYearlyDebug();
