const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStudent326() {
  try {
    console.log('🔍 Checking Student ហាក់​ម៉េងហុង (ID: 326) - Grade 9\n');
    
    // Get student info
    const student = await prisma.student.findUnique({
      where: { studentId: 326 },
      include: {
        enrollments: {
          include: {
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
    console.log(`   Student ID: ${student.studentId}`);
    console.log(`   Class: ${student.class}`);
    console.log(`   Enrollments: ${student.enrollments.length}`);
    
    student.enrollments.forEach((enrollment, index) => {
      console.log(`   Enrollment ${index + 1}: Course ID ${enrollment.courseId} - ${enrollment.course.grade} ${enrollment.course.section}`);
    });
    
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
        semester: true,
        course: {
          include: {
            schoolYear: true
          }
        }
      },
      orderBy: [
        { semester: { semester: 'asc' } },
        { gradeDate: 'asc' }
      ]
    });
    
    console.log(`\n📊 Total Grades Found: ${grades.length}`);
    
    // Group by semester
    const semester1Grades = grades.filter(g => g.semester?.semester === 'ឆមាសទី ១');
    const semester2Grades = grades.filter(g => g.semester?.semester === 'ឆមាសទី ២');
    
    console.log(`\n📅 Semester 1 Grades: ${semester1Grades.length}`);
    if (semester1Grades.length > 0) {
      console.log('   Grade Dates:', [...new Set(semester1Grades.map(g => g.gradeDate))].sort());
      semester1Grades.forEach(grade => {
        console.log(`   ${grade.gradeDate} - ${grade.subject?.subjectName}: ${grade.grade}`);
      });
    }
    
    console.log(`\n📅 Semester 2 Grades: ${semester2Grades.length}`);
    if (semester2Grades.length > 0) {
      console.log('   Grade Dates:', [...new Set(semester2Grades.map(g => g.gradeDate))].sort());
      semester2Grades.forEach(grade => {
        console.log(`   ${grade.gradeDate} - ${grade.subject?.subjectName}: ${grade.grade}`);
      });
    }
    
    // Calculate semester 1 average
    if (semester1Grades.length > 0) {
      const sem1Total = semester1Grades.reduce((sum, grade) => sum + (grade.grade || 0), 0);
      const sem1Average = sem1Total / 8.4; // Grade 9 rule
      console.log(`\n🧮 Semester 1 Calculation:`);
      console.log(`   Total: ${sem1Total.toFixed(1)}`);
      console.log(`   Average: ${sem1Total.toFixed(1)} / 8.4 = ${sem1Average.toFixed(1)}`);
    }
    
    // Calculate semester 2 average
    if (semester2Grades.length > 0) {
      const sem2Total = semester2Grades.reduce((sum, grade) => sum + (grade.grade || 0), 0);
      const sem2Average = sem2Total / 8.4; // Grade 9 rule
      console.log(`\n🧮 Semester 2 Calculation:`);
      console.log(`   Total: ${sem2Total.toFixed(1)}`);
      console.log(`   Average: ${sem2Total.toFixed(1)} / 8.4 = ${sem2Average.toFixed(1)}`);
    }
    
    // Calculate yearly average
    if (semester1Grades.length > 0 && semester2Grades.length > 0) {
      const sem1Total = semester1Grades.reduce((sum, grade) => sum + (grade.grade || 0), 0);
      const sem2Total = semester2Grades.reduce((sum, grade) => sum + (grade.grade || 0), 0);
      const sem1Average = sem1Total / 8.4;
      const sem2Average = sem2Total / 8.4;
      const yearlyAverage = (sem1Average + sem2Average) / 2;
      
      console.log(`\n🎯 Yearly Calculation:`);
      console.log(`   Semester 1 Average: ${sem1Average.toFixed(1)}`);
      console.log(`   Semester 2 Average: ${sem2Average.toFixed(1)}`);
      console.log(`   Yearly Average: (${sem1Average.toFixed(1)} + ${sem2Average.toFixed(1)}) / 2 = ${yearlyAverage.toFixed(1)}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudent326();
