const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testGradeCalculations() {
  try {
    console.log('🧪 Testing Grade Calculation Rules for All Grade Levels...\n');
    
    // Test different grade levels
    const testCases = [
      { grade: '1', description: 'Grade 1-6: Average of grades' },
      { grade: '5', description: 'Grade 1-6: Average of grades' },
      { grade: '7', description: 'Grade 7-8: Sum / 14' },
      { grade: '8', description: 'Grade 7-8: Sum / 14' },
      { grade: '9', description: 'Grade 9: Sum / 8.4' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📊 Testing ${testCase.description} (Grade ${testCase.grade})`);
      
      // Find a student with this grade
      const student = await prisma.student.findFirst({
        where: { class: testCase.grade },
        include: {
          enrollments: {
            include: {
              course: {
                include: {
                  schoolYear: true
                }
              }
            }
          }
        }
      });
      
      if (!student) {
        console.log(`   ❌ No student found for grade ${testCase.grade}`);
        continue;
      }
      
      console.log(`   👤 Student: ${student.firstName} ${student.lastName} (ID: ${student.studentId})`);
      
      // Get course for 2024-2025
      const course = student.enrollments.find(e => 
        e.course.schoolYear.schoolYearCode === '2024-2025'
      )?.course;
      
      if (!course) {
        console.log(`   ❌ No course found for grade ${testCase.grade} in 2024-2025`);
        continue;
      }
      
      console.log(`   📚 Course: ${course.grade} ${course.section} (ID: ${course.courseId})`);
      
      // Get grades for this course
      const grades = await prisma.grade.findMany({
        where: {
          studentId: student.studentId,
          courseId: course.courseId
        },
        include: {
          subject: true,
          semester: true
        }
      });
      
      if (grades.length === 0) {
        console.log(`   ❌ No grades found for this student`);
        continue;
      }
      
      console.log(`   📊 Total grades: ${grades.length}`);
      
      // Test monthly calculation
      const monthlyGrades = grades.filter(g => g.gradeDate === '01/25'); // January 2025
      if (monthlyGrades.length > 0) {
        const monthlyTotal = monthlyGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0);
        const gradeNum = parseInt(testCase.grade);
        let monthlyAverage;
        
        if (gradeNum >= 1 && gradeNum <= 6) {
          monthlyAverage = monthlyGrades.length > 0 ? monthlyTotal / monthlyGrades.length : 0;
          console.log(`   📅 Monthly (${monthlyGrades.length} subjects): ${monthlyTotal.toFixed(1)} / ${monthlyGrades.length} = ${monthlyAverage.toFixed(1)}`);
        } else if (gradeNum >= 7 && gradeNum <= 8) {
          monthlyAverage = monthlyTotal / 14;
          console.log(`   📅 Monthly (${monthlyGrades.length} subjects): ${monthlyTotal.toFixed(1)} / 14 = ${monthlyAverage.toFixed(1)}`);
        } else if (gradeNum === 9) {
          monthlyAverage = monthlyTotal / 8.4;
          console.log(`   📅 Monthly (${monthlyGrades.length} subjects): ${monthlyTotal.toFixed(1)} / 8.4 = ${monthlyAverage.toFixed(1)}`);
        }
      }
      
      // Test semester calculation
      const semester1Grades = grades.filter(g => g.semester?.semester === 'ឆមាសទី ១');
      if (semester1Grades.length > 0) {
        const sem1Total = semester1Grades.reduce((sum, grade) => sum + (grade.grade || 0), 0);
        const gradeNum = parseInt(testCase.grade);
        let sem1Average;
        
        if (gradeNum >= 1 && gradeNum <= 6) {
          sem1Average = semester1Grades.length > 0 ? sem1Total / semester1Grades.length : 0;
          console.log(`   📚 Semester 1 (${semester1Grades.length} grades): ${sem1Total.toFixed(1)} / ${semester1Grades.length} = ${sem1Average.toFixed(1)}`);
        } else if (gradeNum >= 7 && gradeNum <= 8) {
          sem1Average = sem1Total / 14;
          console.log(`   📚 Semester 1 (${semester1Grades.length} grades): ${sem1Total.toFixed(1)} / 14 = ${sem1Average.toFixed(1)}`);
        } else if (gradeNum === 9) {
          sem1Average = sem1Total / 8.4;
          console.log(`   📚 Semester 1 (${semester1Grades.length} grades): ${sem1Total.toFixed(1)} / 8.4 = ${sem1Average.toFixed(1)}`);
        }
      }
      
      // Test yearly calculation
      const semester2Grades = grades.filter(g => g.semester?.semester === 'ឆមាសទី ២');
      if (semester1Grades.length > 0 && semester2Grades.length > 0) {
        const sem1Total = semester1Grades.reduce((sum, grade) => sum + (grade.grade || 0), 0);
        const sem2Total = semester2Grades.reduce((sum, grade) => sum + (grade.grade || 0), 0);
        const gradeNum = parseInt(testCase.grade);
        
        let sem1Average, sem2Average;
        
        if (gradeNum >= 1 && gradeNum <= 6) {
          sem1Average = semester1Grades.length > 0 ? sem1Total / semester1Grades.length : 0;
          sem2Average = semester2Grades.length > 0 ? sem2Total / semester2Grades.length : 0;
        } else if (gradeNum >= 7 && gradeNum <= 8) {
          sem1Average = sem1Total / 14;
          sem2Average = sem2Total / 14;
        } else if (gradeNum === 9) {
          sem1Average = sem1Total / 8.4;
          sem2Average = sem2Total / 8.4;
        }
        
        const yearlyAverage = (sem1Average + sem2Average) / 2;
        console.log(`   🎯 Yearly: (${sem1Average.toFixed(1)} + ${sem2Average.toFixed(1)}) / 2 = ${yearlyAverage.toFixed(1)}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGradeCalculations();
