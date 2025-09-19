const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugStudent326() {
  try {
    console.log('🔍 Debugging Student ម៉េងហុង ហាក់ (ID: 326) Calculation...\n');
    
    // Get student with all grades
    const student = await prisma.student.findUnique({
      where: { studentId: 326 },
      include: {
        grades: {
          where: {
            course: {
              schoolYear: {
                schoolYearCode: '2024-2025'
              }
            }
          },
          include: {
            subject: true,
            semester: true,
            course: true
          }
        }
      }
    });
    
    if (!student) {
      console.log('❌ Student not found');
      return;
    }
    
    console.log('👤 Student Information:');
    console.log(`   Name: ${student.firstName} ${student.lastName}`);
    console.log(`   Class: ${student.class}`);
    console.log(`   Total grades: ${student.grades.length}`);
    
    // Group by semester
    const semester1Grades = student.grades.filter(g => g.semester?.semester === 'ឆមាសទី ១');
    const semester2Grades = student.grades.filter(g => g.semester?.semester === 'ឆមាសទី ២');
    
    console.log(`\n📅 Semester 1 Grades: ${semester1Grades.length}`);
    console.log(`📅 Semester 2 Grades: ${semester2Grades.length}`);
    
    // Check grade dates
    const sem1Dates = [...new Set(semester1Grades.map(g => g.gradeDate))].sort();
    const sem2Dates = [...new Set(semester2Grades.map(g => g.gradeDate))].sort();
    
    console.log(`\n📅 Semester 1 Dates: ${sem1Dates.join(', ')}`);
    console.log(`📅 Semester 2 Dates: ${sem2Dates.join(', ')}`);
    
    // Calculate semester 1 total (all grades)
    const sem1Total = semester1Grades.reduce((sum, g) => sum + (g.grade || 0), 0);
    const sem1Average = sem1Total / 8.4; // Grade 9 rule
    
    console.log(`\n🧮 Semester 1 Calculation (All Grades):`);
    console.log(`   Total: ${sem1Total.toFixed(1)}`);
    console.log(`   Average: ${sem1Total.toFixed(1)} / 8.4 = ${sem1Average.toFixed(1)}`);
    
    // Calculate semester 2 total (all grades)
    const sem2Total = semester2Grades.reduce((sum, g) => sum + (g.grade || 0), 0);
    const sem2Average = sem2Total / 8.4; // Grade 9 rule
    
    console.log(`\n🧮 Semester 2 Calculation (All Grades):`);
    console.log(`   Total: ${sem2Total.toFixed(1)}`);
    console.log(`   Average: ${sem2Total.toFixed(1)} / 8.4 = ${sem2Average.toFixed(1)}`);
    
    // Yearly calculation
    const yearlyAverage = (sem1Average + sem2Average) / 2;
    console.log(`\n🎯 Yearly Calculation:`);
    console.log(`   (${sem1Average.toFixed(1)} + ${sem2Average.toFixed(1)}) / 2 = ${yearlyAverage.toFixed(1)}`);
    
    // Now let's check what the API is actually doing
    console.log(`\n🔍 Let's check the API calculation...`);
    
    // Test the API
    const response = await fetch('http://localhost:3000/api/pdf-generate/generate-grade-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportType: 'yearly',
        academicYear: '2024-2025',
        class: '32', // Grade 9A course ID
        format: 'pdf'
      })
    });
    
    if (response.ok) {
      console.log('✅ API call successful - check server logs for detailed calculation');
    } else {
      console.log(`❌ API call failed: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugStudent326();
