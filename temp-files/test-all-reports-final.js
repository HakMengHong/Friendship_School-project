const fetch = require('node-fetch');
const fs = require('fs');

async function testAllReports() {
  try {
    console.log('🧪 Testing All Report Types - Final Verification...\n');
    
    const tests = [
      {
        name: 'Monthly Report',
        data: {
          reportType: 'monthly',
          academicYear: '2024-2025',
          month: '07',
          year: '2025',
          class: '28',
          format: 'pdf'
        }
      },
      {
        name: 'Semester 1 Report',
        data: {
          reportType: 'semester',
          academicYear: '2024-2025',
          semester: '1',
          class: '28',
          format: 'pdf'
        }
      },
      {
        name: 'Semester 2 Report',
        data: {
          reportType: 'semester',
          academicYear: '2024-2025',
          semester: '2',
          class: '28',
          format: 'pdf'
        }
      },
      {
        name: 'Yearly Report',
        data: {
          reportType: 'yearly',
          academicYear: '2024-2025',
          class: '28',
          format: 'pdf'
        }
      }
    ];
    
    for (const test of tests) {
      console.log(`\n📋 Testing ${test.name}...`);
      console.log(`   Parameters:`, JSON.stringify(test.data, null, 2));
      
      try {
        const response = await fetch('http://localhost:3000/api/pdf-generate/generate-grade-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(test.data)
        });
        
        console.log(`   📊 Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          const contentLength = response.headers.get('content-length');
          
          if (contentType && contentType.includes('application/pdf')) {
            console.log(`   ✅ Success! PDF Generated (${contentLength} bytes)`);
            
            // Save the PDF
            const pdfBuffer = await response.buffer();
            const filename = `test-${test.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;
            fs.writeFileSync(filename, pdfBuffer);
            console.log(`   💾 Saved as: ${filename}`);
          } else {
            console.log(`   ❌ Unexpected content type: ${contentType}`);
          }
        } else {
          const error = await response.text();
          console.log(`   ❌ Error: ${error}`);
        }
      } catch (error) {
        console.log(`   ❌ Request failed: ${error.message}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

testAllReports();
