const fetch = require('node-fetch');
const fs = require('fs');

async function testYearlyReportMultiple() {
  try {
    console.log('🧪 Testing Yearly Report with Multiple Classes...\n');
    
    // Test different classes
    const testClasses = [
      { id: '28', name: 'Grade 5A' },
      { id: '29', name: 'Grade 7A' },
      { id: '30', name: 'Grade 9A' }
    ];
    
    for (const testClass of testClasses) {
      console.log(`\n📚 Testing Class: ${testClass.name} (ID: ${testClass.id})`);
      console.log('─'.repeat(50));
      
      const testData = {
        reportType: 'yearly',
        academicYear: '2024-2025',
        class: testClass.id,
        format: 'pdf'
      };
      
      try {
        const response = await fetch('http://localhost:3000/api/pdf-generate/generate-grade-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData)
        });
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/pdf')) {
            const pdfBuffer = await response.buffer();
            const filename = `test-yearly-${testClass.name.replace(' ', '')}-${Date.now()}.pdf`;
            fs.writeFileSync(filename, pdfBuffer);
            
            console.log(`✅ Success! PDF Generated`);
            console.log(`📄 File: ${filename}`);
            console.log(`📊 Size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);
          } else {
            console.log(`❌ Unexpected content type: ${contentType}`);
          }
        } else {
          const error = await response.text();
          console.log(`❌ Error: ${response.status} - ${error}`);
        }
      } catch (error) {
        console.log(`❌ Request failed: ${error.message}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

testYearlyReportMultiple();
