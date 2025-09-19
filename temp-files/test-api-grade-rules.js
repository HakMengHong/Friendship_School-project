const fetch = require('node-fetch');

async function testAPIGradeRules() {
  try {
    console.log('🧪 Testing API Grade Calculation Rules...\n');
    
    const testCases = [
      { grade: '5', class: '28', description: 'Grade 5: Average of grades' },
      { grade: '7', class: '30', description: 'Grade 7: Sum / 14' },
      { grade: '9', class: '32', description: 'Grade 9: Sum / 8.4' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📊 Testing ${testCase.description}`);
      
      // Test monthly report
      const monthlyData = {
        reportType: 'monthly',
        academicYear: '2024-2025',
        month: '01',
        year: '2025',
        class: testCase.class,
        format: 'pdf'
      };
      
      console.log(`   📅 Monthly Report (${testCase.grade}):`);
      try {
        const monthlyResponse = await fetch('http://localhost:3000/api/pdf-generate/generate-grade-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(monthlyData)
        });
        
        if (monthlyResponse.ok) {
          console.log(`   ✅ Monthly: ${monthlyResponse.status} OK`);
        } else {
          console.log(`   ❌ Monthly: ${monthlyResponse.status}`);
        }
      } catch (error) {
        console.log(`   ❌ Monthly Error: ${error.message}`);
      }
      
      // Test semester report
      const semesterData = {
        reportType: 'semester',
        academicYear: '2024-2025',
        semester: '1',
        class: testCase.class,
        format: 'pdf'
      };
      
      console.log(`   📚 Semester Report (${testCase.grade}):`);
      try {
        const semesterResponse = await fetch('http://localhost:3000/api/pdf-generate/generate-grade-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(semesterData)
        });
        
        if (semesterResponse.ok) {
          console.log(`   ✅ Semester: ${semesterResponse.status} OK`);
        } else {
          console.log(`   ❌ Semester: ${semesterResponse.status}`);
        }
      } catch (error) {
        console.log(`   ❌ Semester Error: ${error.message}`);
      }
      
      // Test yearly report
      const yearlyData = {
        reportType: 'yearly',
        academicYear: '2024-2025',
        class: testCase.class,
        format: 'pdf'
      };
      
      console.log(`   🎯 Yearly Report (${testCase.grade}):`);
      try {
        const yearlyResponse = await fetch('http://localhost:3000/api/pdf-generate/generate-grade-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(yearlyData)
        });
        
        if (yearlyResponse.ok) {
          console.log(`   ✅ Yearly: ${yearlyResponse.status} OK`);
        } else {
          console.log(`   ❌ Yearly: ${yearlyResponse.status}`);
        }
      } catch (error) {
        console.log(`   ❌ Yearly Error: ${error.message}`);
      }
      
      // Small delay between test cases
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 API Grade Rules Test Completed!');
    console.log('\n📋 Expected Calculation Rules:');
    console.log('   Grade 1-6: Average of grades (sum / number of subjects)');
    console.log('   Grade 7-8: Sum of grades / 14');
    console.log('   Grade 9: Sum of grades / 8.4');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPIGradeRules();
