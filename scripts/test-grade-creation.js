const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testGradeCreation() {
  console.log('🧪 Testing Grade Creation');
  console.log('========================\n');

  try {
    // Test 1: Check if we have the required data
    console.log('1️⃣ Checking required data...');
    
    const students = await prisma.student.findMany({ take: 1 });
    const subjects = await prisma.subject.findMany({ take: 1 });
    const courses = await prisma.course.findMany({ take: 1 });
    const semesters = await prisma.semester.findMany({ take: 1 });
    const users = await prisma.user.findMany({ take: 1 });

    console.log(`✅ Students: ${students.length}`);
    console.log(`✅ Subjects: ${subjects.length}`);
    console.log(`✅ Courses: ${courses.length}`);
    console.log(`✅ Semesters: ${semesters.length}`);
    console.log(`✅ Users: ${users.length}`);

    if (students.length === 0 || subjects.length === 0 || courses.length === 0 || semesters.length === 0) {
      console.log('❌ Missing required data for grade creation');
      return;
    }

    // Test 2: Try to create a grade
    console.log('\n2️⃣ Testing grade creation...');
    
    const testGradeData = {
      studentId: students[0].studentId,
      subjectId: subjects[0].subjectId,
      courseId: courses[0].courseId,
      semesterId: semesters[0].semesterId,
      grade: 85.5,
      gradeComment: 'Test grade',
      userId: users.length > 0 ? users[0].userId : null,
      gradeDate: '12/25'
    };

    console.log('📝 Test grade data:', testGradeData);

    // Check if grade already exists
    const existingGrade = await prisma.grade.findFirst({
      where: {
        studentId: testGradeData.studentId,
        subjectId: testGradeData.subjectId,
        courseId: testGradeData.courseId,
        semesterId: testGradeData.semesterId,
        gradeDate: testGradeData.gradeDate
      }
    });

    if (existingGrade) {
      console.log('⚠️ Grade already exists for this combination, testing update instead...');
      
      const updatedGrade = await prisma.grade.update({
        where: { gradeId: existingGrade.gradeId },
        data: {
          grade: 90.0,
          gradeComment: 'Updated test grade'
        }
      });
      
      console.log('✅ Grade updated successfully:', updatedGrade.gradeId);
    } else {
      const newGrade = await prisma.grade.create({
        data: testGradeData
      });
      
      console.log('✅ Grade created successfully:', newGrade.gradeId);
      
      // Clean up - delete the test grade
      await prisma.grade.delete({
        where: { gradeId: newGrade.gradeId }
      });
      console.log('🧹 Test grade cleaned up');
    }

    // Test 3: Check database constraints
    console.log('\n3️⃣ Checking database constraints...');
    
    const gradeSchema = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Grade'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Grade table schema:');
    gradeSchema.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
    });

  } catch (error) {
    console.error('❌ Error during testing:', error);
    
    if (error.code === 'P2002') {
      console.log('🔍 This is a unique constraint violation');
    } else if (error.code === 'P2003') {
      console.log('🔍 This is a foreign key constraint violation');
    } else if (error.code === 'P2025') {
      console.log('🔍 This is a record not found error');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testGradeCreation();
