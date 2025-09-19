const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugGrade1To5() {
  try {
    console.log('🔍 Debugging Grade 1-5 Yearly Calculation...\n');
    
    // Test different grade levels 1-5
    const testGrades = ['1', '2', '3', '4', '5'];
    
    for (const grade of testGrades) {
      console.log(`\n📊 Testing Grade ${grade} Students`);
      console.log('-'.repeat(40));
      
      // Find a student with this grade
      const student = await prisma.student.findFirst({
        where: { 
          class: grade,
          enrollments: {
            some: {
              course: {
                schoolYear: {
                  schoolYearCode: '2024-2025'
                }
              }
            }
          }
        },
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
        console.log(`   ❌ No student found for grade ${grade}`);
        continue;
      }
      
      console.log(`   👤 Student: ${student.firstName} ${student.lastName} (ID: ${student.studentId})`);
      console.log(`   📚 Course: ${student.grades[0]?.course.grade} ${student.grades[0]?.course.section} (ID: ${student.grades[0]?.courseId})`);
      console.log(`   📊 Total grades: ${student.grades.length}`);
      
      // Group by semester
      const semester1Grades = student.grades.filter(g => g.semester?.semester === 'ឆមាសទី ១');
      const semester2Grades = student.grades.filter(g => g.semester?.semester === 'ឆមាសទី ២');
      
      console.log(`   📅 Semester 1: ${semester1Grades.length} grades`);
      console.log(`   📅 Semester 2: ${semester2Grades.length} grades`);
      
      if (semester1Grades.length > 0) {
        const sem1Dates = [...new Set(semester1Grades.map(g => g.gradeDate))].sort();
        console.log(`   📅 Semester 1 Dates: ${sem1Dates.join(', ')}`);
        
        // Calculate using the same logic as the API
        const sem1LastMonth = sem1Dates[sem1Dates.length - 1];
        const sem1PreviousMonths = sem1Dates.slice(0, -1);
        
        console.log(`   📅 Last Month: ${sem1LastMonth}`);
        console.log(`   📅 Previous Months: ${sem1PreviousMonths.join(', ')}`);
        
        // Last month calculation
        const sem1LastMonthGrades = semester1Grades.filter(g => g.gradeDate === sem1LastMonth);
        const sem1LastMonthTotal = sem1LastMonthGrades.reduce((sum, g) => sum + (g.grade || 0), 0);
        const sem1LastMonthAverage = sem1LastMonthGrades.length > 0 ? sem1LastMonthTotal / sem1LastMonthGrades.length : 0;
        
        console.log(`   🧮 Last Month (${sem1LastMonth}): ${sem1LastMonthTotal.toFixed(1)} total, ${sem1LastMonthGrades.length} subjects`);
        console.log(`   🧮 Last Month Average: ${sem1LastMonthTotal.toFixed(1)} / ${sem1LastMonthGrades.length} = ${sem1LastMonthAverage.toFixed(1)}`);
        
        // Previous months calculation
        const sem1MonthlyAverages = [];
        sem1PreviousMonths.forEach(month => {
          const monthGrades = semester1Grades.filter(g => g.gradeDate === month);
          const monthTotal = monthGrades.reduce((sum, g) => sum + (g.grade || 0), 0);
          const monthAverage = monthGrades.length > 0 ? monthTotal / monthGrades.length : 0;
          sem1MonthlyAverages.push(monthAverage);
          
          console.log(`   🧮 Month ${month}: ${monthTotal.toFixed(1)} total, ${monthGrades.length} subjects, ${monthAverage.toFixed(1)} average`);
        });
        
        const sem1PreviousMonthsAverage = sem1MonthlyAverages.length > 0 
          ? sem1MonthlyAverages.reduce((sum, avg) => sum + avg, 0) / sem1MonthlyAverages.length 
          : 0;
        
        const sem1OverallAverage = (sem1LastMonthAverage + sem1PreviousMonthsAverage) / 2;
        
        console.log(`   📊 Previous Months Average: ${sem1PreviousMonthsAverage.toFixed(1)}`);
        console.log(`   📊 Semester 1 Overall: (${sem1LastMonthAverage.toFixed(1)} + ${sem1PreviousMonthsAverage.toFixed(1)}) / 2 = ${sem1OverallAverage.toFixed(1)}`);
      }
      
      if (semester2Grades.length > 0) {
        const sem2Dates = [...new Set(semester2Grades.map(g => g.gradeDate))].sort();
        console.log(`   📅 Semester 2 Dates: ${sem2Dates.join(', ')}`);
        
        // Calculate using the same logic as the API
        const sem2LastMonth = sem2Dates[sem2Dates.length - 1];
        const sem2PreviousMonths = sem2Dates.slice(0, -1);
        
        console.log(`   📅 Last Month: ${sem2LastMonth}`);
        console.log(`   📅 Previous Months: ${sem2PreviousMonths.join(', ')}`);
        
        // Last month calculation
        const sem2LastMonthGrades = semester2Grades.filter(g => g.gradeDate === sem2LastMonth);
        const sem2LastMonthTotal = sem2LastMonthGrades.reduce((sum, g) => sum + (g.grade || 0), 0);
        const sem2LastMonthAverage = sem2LastMonthGrades.length > 0 ? sem2LastMonthTotal / sem2LastMonthGrades.length : 0;
        
        console.log(`   🧮 Last Month (${sem2LastMonth}): ${sem2LastMonthTotal.toFixed(1)} total, ${sem2LastMonthGrades.length} subjects`);
        console.log(`   🧮 Last Month Average: ${sem2LastMonthTotal.toFixed(1)} / ${sem2LastMonthGrades.length} = ${sem2LastMonthAverage.toFixed(1)}`);
        
        // Previous months calculation
        const sem2MonthlyAverages = [];
        sem2PreviousMonths.forEach(month => {
          const monthGrades = semester2Grades.filter(g => g.gradeDate === month);
          const monthTotal = monthGrades.reduce((sum, g) => sum + (g.grade || 0), 0);
          const monthAverage = monthGrades.length > 0 ? monthTotal / monthGrades.length : 0;
          sem2MonthlyAverages.push(monthAverage);
          
          console.log(`   🧮 Month ${month}: ${monthTotal.toFixed(1)} total, ${monthGrades.length} subjects, ${monthAverage.toFixed(1)} average`);
        });
        
        const sem2PreviousMonthsAverage = sem2MonthlyAverages.length > 0 
          ? sem2MonthlyAverages.reduce((sum, avg) => sum + avg, 0) / sem2MonthlyAverages.length 
          : 0;
        
        const sem2OverallAverage = (sem2LastMonthAverage + sem2PreviousMonthsAverage) / 2;
        
        console.log(`   📊 Previous Months Average: ${sem2PreviousMonthsAverage.toFixed(1)}`);
        console.log(`   📊 Semester 2 Overall: (${sem2LastMonthAverage.toFixed(1)} + ${sem2PreviousMonthsAverage.toFixed(1)}) / 2 = ${sem2OverallAverage.toFixed(1)}`);
        
        // Yearly calculation
        if (semester1Grades.length > 0) {
          const yearlyAverage = (sem1OverallAverage + sem2OverallAverage) / 2;
          console.log(`   🎯 Yearly Average: (${sem1OverallAverage.toFixed(1)} + ${sem2OverallAverage.toFixed(1)}) / 2 = ${yearlyAverage.toFixed(1)}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugGrade1To5();
