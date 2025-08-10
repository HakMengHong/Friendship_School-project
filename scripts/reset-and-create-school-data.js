const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetAndCreateSchoolData() {
  try {
    console.log('🚀 Starting to reset and recreate school data...\n');

    // First, delete existing courses and school years
    console.log('🗑️  Deleting existing data...');
    
    // Delete courses first (due to foreign key constraints)
    const deletedCourses = await prisma.course.deleteMany({});
    console.log(`✅ Deleted ${deletedCourses.count} existing courses`);
    
    // Delete school years
    const deletedSchoolYears = await prisma.schoolYear.deleteMany({});
    console.log(`✅ Deleted ${deletedSchoolYears.count} existing school years`);

    console.log('\n📅 Creating School Years with specific IDs...');
    const schoolYears = [
      { schoolYearId: 1, schoolyear: '2022-2023', schoolYearCode: '2022-2023' },
      { schoolYearId: 2, schoolyear: '2023-2024', schoolYearCode: '2023-2024' },
      { schoolYearId: 3, schoolyear: '2024-2025', schoolYearCode: '2024-2025' }
    ];

    const createdSchoolYears = [];
    for (const schoolYear of schoolYears) {
      const created = await prisma.schoolYear.create({
        data: schoolYear
      });
      createdSchoolYears.push(created);
      console.log(`✅ School Year created: ${created.schoolyear} (ID: ${created.schoolYearId})`);
    }

    console.log('\n📚 Creating Courses with sequential IDs...');
    
    // Add Courses for each grade (1-9) with section A for 2024-2025
    const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const createdCourses = [];

    // 2024-2025 courses (IDs 1-9)
    for (let i = 0; i < grades.length; i++) {
      const grade = grades[i];
             const courseData = {
         courseId: `${i + 1}`,
         schoolYearId: 3, // 2024-2025
         grade: grade.toString(),
         section: 'A',
         courseName: `ថ្នាក់ទី ${grade}`,
         createdAt: new Date(),
         updatedAt: new Date()
       };

      const created = await prisma.course.create({
        data: courseData
      });
      createdCourses.push(created);
      console.log(`✅ Course created: ${created.courseName} - Section ${created.section} (ID: ${created.courseId}) - 2024-2025`);
    }

    // 2023-2024 courses (IDs 10-18)
    console.log('\n🔄 Adding courses for 2023-2024...');
    for (let i = 0; i < grades.length; i++) {
      const grade = grades[i];
             const courseData = {
         courseId: `${i + 10}`,
         schoolYearId: 2, // 2023-2024
         grade: grade.toString(),
         section: 'A',
         courseName: `ថ្នាក់ទី ${grade}`,
         createdAt: new Date(),
         updatedAt: new Date()
       };

      const created = await prisma.course.create({
        data: courseData
      });
      createdCourses.push(created);
      console.log(`✅ Course created: ${created.courseName} - Section ${created.section} (ID: ${created.courseId}) - 2023-2024`);
    }

    // 2022-2023 courses (IDs 19-27)
    console.log('\n🔄 Adding courses for 2022-2023...');
    for (let i = 0; i < grades.length; i++) {
      const grade = grades[i];
             const courseData = {
         courseId: `${i + 19}`,
         schoolYearId: 1, // 2022-2023
         grade: grade.toString(),
         section: 'A',
         courseName: `ថ្នាក់ទី ${grade}`,
         createdAt: new Date(),
         updatedAt: new Date()
       };

      const created = await prisma.course.create({
        data: courseData
      });
      createdCourses.push(created);
      console.log(`✅ Course created: ${created.courseName} - Section ${created.section} (ID: ${created.courseId}) - 2022-2023`);
    }

    console.log('\n🎉 All school data reset and recreated successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - School Years: ${createdSchoolYears.length} (IDs: 1, 2, 3)`);
    console.log(`   - Total Courses: ${createdCourses.length} (IDs: 1-27)`);
    console.log(`   - Courses per year: ${grades.length}`);

  } catch (error) {
    console.error('❌ Error resetting and creating school data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resetAndCreateSchoolData();
