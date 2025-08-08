const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteStudents() {
  try {
    console.log('Current students in database:');
    
    // List all students first
    const allStudents = await prisma.student.findMany({
      select: {
        studentId: true,
        lastName: true,
        firstName: true,
        class: true,
        registrationDate: true
      },
      orderBy: {
        studentId: 'asc'
      }
    });

    allStudents.forEach(student => {
      console.log(`ID: ${student.studentId} | ${student.lastName} ${student.firstName} | Grade: ${student.class} | Registered: ${student.registrationDate.toLocaleDateString()}`);
    });

    console.log('\n=== DELETE OPTIONS ===');
    console.log('1. Delete by specific student ID');
    console.log('2. Delete students older than a certain date');
    console.log('3. Delete all students (DANGEROUS!)');
    console.log('4. Delete students by grade level');
    
    // Example: Delete specific students by ID
    const studentsToDelete = [1, 2, 3]; // Change these IDs to the ones you want to delete
    
    console.log(`\nAttempting to delete students with IDs: ${studentsToDelete.join(', ')}`);
    
    for (const studentId of studentsToDelete) {
      try {
        // First, delete related records
        console.log(`\nDeleting related records for student ${studentId}...`);
        
        // Delete scholarships
        const deletedScholarships = await prisma.scholarship.deleteMany({
          where: { studentId: studentId }
        });
        console.log(`   - Deleted ${deletedScholarships.count} scholarships`);
        
        // Delete guardians
        const deletedGuardians = await prisma.guardian.deleteMany({
          where: { studentId: studentId }
        });
        console.log(`   - Deleted ${deletedGuardians.count} guardians`);
        
        // Delete family info
        const deletedFamily = await prisma.familyInfo.deleteMany({
          where: { studentId: studentId }
        });
        console.log(`   - Deleted ${deletedFamily.count} family records`);
        
        // Delete attendances
        const deletedAttendances = await prisma.attendance.deleteMany({
          where: { studentId: studentId }
        });
        console.log(`   - Deleted ${deletedAttendances.count} attendance records`);
        
        // Now delete the student
        const deletedStudent = await prisma.student.delete({
          where: { studentId: studentId }
        });
        
        console.log(`✅ Successfully deleted student: ${deletedStudent.lastName} ${deletedStudent.firstName} (ID: ${deletedStudent.studentId})`);
        
      } catch (error) {
        if (error.code === 'P2025') {
          console.log(`❌ Student with ID ${studentId} not found`);
        } else {
          console.error(`❌ Error deleting student ${studentId}:`, error.message);
        }
      }
    }

    // Example: Delete students older than a certain date
    // const cutoffDate = new Date('2024-01-01');
    // const oldStudents = await prisma.student.findMany({
    //   where: {
    //     registrationDate: {
    //       lt: cutoffDate
    //     }
    //   }
    // });
    
    // console.log(`\nFound ${oldStudents.length} students registered before ${cutoffDate.toLocaleDateString()}`);
    
    // for (const student of oldStudents) {
    //   await prisma.student.delete({
    //     where: { studentId: student.studentId }
    //   });
    //   console.log(`✅ Deleted old student: ${student.lastName} ${student.firstName}`);
    // }

    // Example: Delete students by grade level
    // const gradeToDelete = '7';
    // const gradeStudents = await prisma.student.findMany({
    //   where: { class: gradeToDelete }
    // });
    
    // console.log(`\nFound ${gradeStudents.length} students in grade ${gradeToDelete}`);
    
    // for (const student of gradeStudents) {
    //   await prisma.student.delete({
    //     where: { studentId: student.studentId }
    //   });
    //   console.log(`✅ Deleted grade ${gradeToDelete} student: ${student.lastName} ${student.firstName}`);
    // }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteStudents();
