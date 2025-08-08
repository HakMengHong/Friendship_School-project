const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteOldStudents() {
  try {
    console.log('🗑️  Deleting old test students...\n');
    
    // Delete students with IDs 1-22 (the old test students)
    const oldStudentIds = Array.from({length: 22}, (_, i) => i + 1);
    
    let deletedCount = 0;
    
    for (const studentId of oldStudentIds) {
      try {
        console.log(`Processing student ID: ${studentId}...`);
        
        // Delete related records first
        await prisma.scholarship.deleteMany({
          where: { studentId: studentId }
        });
        
        await prisma.guardian.deleteMany({
          where: { studentId: studentId }
        });
        
        await prisma.familyInfo.deleteMany({
          where: { studentId: studentId }
        });
        
        await prisma.attendance.deleteMany({
          where: { studentId: studentId }
        });
        
        // Delete the student
        const deletedStudent = await prisma.student.delete({
          where: { studentId: studentId }
        });
        
        console.log(`✅ Deleted: ${deletedStudent.lastName} ${deletedStudent.firstName} (ID: ${studentId})`);
        deletedCount++;
        
      } catch (error) {
        if (error.code === 'P2025') {
          console.log(`⚠️  Student ID ${studentId} not found (already deleted)`);
        } else {
          console.log(`❌ Error with student ${studentId}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n🎉 Successfully deleted ${deletedCount} old students!`);
    
    // Show remaining students
    console.log('\n📋 Remaining students:');
    const remainingStudents = await prisma.student.findMany({
      select: {
        studentId: true,
        lastName: true,
        firstName: true,
        class: true
      },
      orderBy: {
        studentId: 'asc'
      }
    });
    
    remainingStudents.forEach(student => {
      console.log(`ID: ${student.studentId} | ${student.lastName} ${student.firstName} | Grade: ${student.class}`);
    });
    
    console.log(`\nTotal remaining students: ${remainingStudents.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteOldStudents();
