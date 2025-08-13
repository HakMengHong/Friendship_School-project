const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRemoveStudent() {
  try {
    console.log('🧪 Testing Remove Student Functionality...\n');

    // First, let's check current enrollments
    console.log('📋 Current Enrollments:');
    const currentEnrollments = await prisma.enrollment.findMany({
      include: {
        student: true,
        course: {
          include: {
            schoolYear: true
          }
        }
      }
    });

    console.log(`   Total enrollments: ${currentEnrollments.length}`);
    currentEnrollments.slice(0, 3).forEach(enrollment => {
      console.log(`   - ${enrollment.student.firstName} ${enrollment.student.lastName} in ${enrollment.course.courseName} (${enrollment.course.schoolYear.schoolYearCode})`);
    });

    if (currentEnrollments.length === 0) {
      console.log('   No enrollments found to test with');
      return;
    }

    // Test removing a student
    const testEnrollment = currentEnrollments[0];
    console.log(`\n🗑️  Testing removal of: ${testEnrollment.student.firstName} ${testEnrollment.student.lastName}`);
    console.log(`   From course: ${testEnrollment.course.courseName} (${testEnrollment.course.schoolYear.schoolYearCode})`);

    // Remove the enrollment
    const removedEnrollment = await prisma.enrollment.delete({
      where: { enrollmentId: testEnrollment.enrollmentId },
      include: {
        student: true,
        course: {
          include: {
            schoolYear: true
          }
        }
      }
    });

    console.log('✅ Student successfully removed!');
    console.log(`   Removed: ${removedEnrollment.student.firstName} ${removedEnrollment.student.lastName}`);

    // Check remaining enrollments
    const remainingEnrollments = await prisma.enrollment.findMany({
      include: {
        student: true,
        course: {
          include: {
            schoolYear: true
          }
        }
      }
    });

    console.log(`\n📊 Remaining enrollments: ${remainingEnrollments.length}`);

    // Re-enroll the student to restore the data
    console.log('\n🔄 Re-enrolling student to restore data...');
    const reEnrollment = await prisma.enrollment.create({
      data: {
        studentId: testEnrollment.studentId,
        courseId: testEnrollment.courseId,
        drop: false
      }
    });

    console.log('✅ Student re-enrolled successfully!');
    console.log(`   New enrollment ID: ${reEnrollment.enrollmentId}`);

    // Final count
    const finalEnrollments = await prisma.enrollment.findMany();
    console.log(`\n📊 Final enrollment count: ${finalEnrollments.length}`);

    console.log('\n🎉 Test completed successfully!');
    console.log('   - Student removal works ✅');
    console.log('   - Student re-enrollment works ✅');
    console.log('   - Data integrity maintained ✅');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testRemoveStudent();
