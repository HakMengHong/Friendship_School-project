const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStudentCount() {
  try {
    const totalCount = await prisma.student.count();
    console.log(`Total students in database: ${totalCount}`);
    
    const studentsByClass = await prisma.student.groupBy({
      by: ['class'],
      _count: {
        studentId: true
      }
    });
    
    console.log('\nStudents by class:');
    studentsByClass.forEach(group => {
      console.log(`  ${group.class}: ${group._count.studentId} students`);
    });
    
    const studentsByYear = await prisma.student.groupBy({
      by: ['schoolYear'],
      _count: {
        studentId: true
      }
    });
    
    console.log('\nStudents by school year:');
    studentsByYear.forEach(group => {
      console.log(`  ${group.schoolYear}: ${group._count.studentId} students`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudentCount();
