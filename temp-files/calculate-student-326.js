const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function calculateStudent326() {
  try {
    console.log('🧮 Calculating ម៉េងហុង ហាក់ (ID: 326) - Grade 9\n');
    
    // Get grades for 2024-2025
    const grades = await prisma.grade.findMany({
      where: {
        studentId: 326,
        course: {
          schoolYear: {
            schoolYearCode: '2024-2025'
          }
        }
      },
      include: {
        subject: true,
        semester: true
      },
      orderBy: [
        { semester: { semester: 'asc' } },
        { gradeDate: 'asc' }
      ]
    });
    
    // Group by semester
    const semester1Grades = grades.filter(g => g.semester?.semester === 'ឆមាសទី ១');
    const semester2Grades = grades.filter(g => g.semester?.semester === 'ឆមាសទី ២');
    
    console.log('📅 Semester 1 Analysis:');
    const sem1Dates = [...new Set(semester1Grades.map(g => g.gradeDate))].sort();
    console.log(`   All months: ${sem1Dates.join(', ')}`);
    console.log(`   Last month (ឆមាស): ${sem1Dates[sem1Dates.length - 1]}`);
    console.log(`   Previous months (ខែប្រចាំឆមាស): ${sem1Dates.slice(0, -1).join(', ')}`);
    
    console.log('\n📅 Semester 2 Analysis:');
    const sem2Dates = [...new Set(semester2Grades.map(g => g.gradeDate))].sort();
    console.log(`   All months: ${sem2Dates.join(', ')}`);
    console.log(`   Last month (ឆមាស): ${sem2Dates[sem2Dates.length - 1]}`);
    console.log(`   Previous months (ខែប្រចាំឆមាស): ${sem2Dates.slice(0, -1).join(', ')}`);
    
    // Calculate Semester 1 averages
    console.log('\n🧮 Semester 1 Calculations:');
    
    // Last month of semester 1 (02/25)
    const sem1LastMonth = '02/25';
    const sem1LastMonthGrades = semester1Grades.filter(g => g.gradeDate === sem1LastMonth);
    const sem1LastMonthTotal = sem1LastMonthGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0);
    const sem1LastMonthAverage = sem1LastMonthTotal / 8.4; // Grade 9 rule
    
    console.log(`   ឆមាស (Last month ${sem1LastMonth}):`);
    console.log(`     Total: ${sem1LastMonthTotal.toFixed(1)}`);
    console.log(`     Average: ${sem1LastMonthTotal.toFixed(1)} / 8.4 = ${sem1LastMonthAverage.toFixed(1)}`);
    
    // Previous months of semester 1
    const sem1PreviousMonths = sem1Dates.slice(0, -1);
    const monthlyAverages = [];
    
    sem1PreviousMonths.forEach(month => {
      const monthGrades = semester1Grades.filter(g => g.gradeDate === month);
      const monthTotal = monthGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0);
      const monthAverage = monthTotal / 8.4; // Grade 9 rule
      monthlyAverages.push(monthAverage);
      
      console.log(`   ខែប្រចាំឆមាស (Month ${month}):`);
      console.log(`     Total: ${monthTotal.toFixed(1)}`);
      console.log(`     Average: ${monthTotal.toFixed(1)} / 8.4 = ${monthAverage.toFixed(1)}`);
    });
    
    const sem1PreviousMonthsAverage = monthlyAverages.length > 0 
      ? monthlyAverages.reduce((sum, avg) => sum + avg, 0) / monthlyAverages.length 
      : 0;
    
    console.log(`   មធ្យមភាគខែប្រចាំឆមាស (Average of previous months): ${sem1PreviousMonthsAverage.toFixed(1)}`);
    
    // Overall semester 1 average
    const sem1OverallAverage = (sem1LastMonthAverage + sem1PreviousMonthsAverage) / 2;
    console.log(`   មធ្យមភាគប្រចាំឆមាស1: (${sem1LastMonthAverage.toFixed(1)} + ${sem1PreviousMonthsAverage.toFixed(1)}) / 2 = ${sem1OverallAverage.toFixed(1)}`);
    
    // Calculate Semester 2 averages
    console.log('\n🧮 Semester 2 Calculations:');
    
    // Last month of semester 2 (07/25)
    const sem2LastMonth = '07/25';
    const sem2LastMonthGrades = semester2Grades.filter(g => g.gradeDate === sem2LastMonth);
    const sem2LastMonthTotal = sem2LastMonthGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0);
    const sem2LastMonthAverage = sem2LastMonthTotal / 8.4; // Grade 9 rule
    
    console.log(`   ឆមាស (Last month ${sem2LastMonth}):`);
    console.log(`     Total: ${sem2LastMonthTotal.toFixed(1)}`);
    console.log(`     Average: ${sem2LastMonthTotal.toFixed(1)} / 8.4 = ${sem2LastMonthAverage.toFixed(1)}`);
    
    // Previous months of semester 2
    const sem2PreviousMonths = sem2Dates.slice(0, -1);
    const sem2MonthlyAverages = [];
    
    sem2PreviousMonths.forEach(month => {
      const monthGrades = semester2Grades.filter(g => g.gradeDate === month);
      const monthTotal = monthGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0);
      const monthAverage = monthTotal / 8.4; // Grade 9 rule
      sem2MonthlyAverages.push(monthAverage);
      
      console.log(`   ខែប្រចាំឆមាស (Month ${month}):`);
      console.log(`     Total: ${monthTotal.toFixed(1)}`);
      console.log(`     Average: ${monthTotal.toFixed(1)} / 8.4 = ${monthAverage.toFixed(1)}`);
    });
    
    const sem2PreviousMonthsAverage = sem2MonthlyAverages.length > 0 
      ? sem2MonthlyAverages.reduce((sum, avg) => sum + avg, 0) / sem2MonthlyAverages.length 
      : 0;
    
    console.log(`   មធ្យមភាគខែប្រចាំឆមាស (Average of previous months): ${sem2PreviousMonthsAverage.toFixed(1)}`);
    
    // Overall semester 2 average
    const sem2OverallAverage = (sem2LastMonthAverage + sem2PreviousMonthsAverage) / 2;
    console.log(`   មធ្យមភាគប្រចាំឆមាស2: (${sem2LastMonthAverage.toFixed(1)} + ${sem2PreviousMonthsAverage.toFixed(1)}) / 2 = ${sem2OverallAverage.toFixed(1)}`);
    
    // Yearly average
    const yearlyAverage = (sem1OverallAverage + sem2OverallAverage) / 2;
    console.log('\n🎯 Yearly Calculation:');
    console.log(`   មធ្យមភាគប្រចាំឆមាស1: ${sem1OverallAverage.toFixed(1)}`);
    console.log(`   មធ្យមភាគប្រចាំឆមាស2: ${sem2OverallAverage.toFixed(1)}`);
    console.log(`   មធ្យមភាគប្រចាំឆ្នាំ: (${sem1OverallAverage.toFixed(1)} + ${sem2OverallAverage.toFixed(1)}) / 2 = ${yearlyAverage.toFixed(1)}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

calculateStudent326();
