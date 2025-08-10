const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSchoolData() {
  try {
    console.log('🚀 Starting to add school data...\n');

         // Get existing School Years or create them if they don't exist
     console.log('📅 Getting/Creating School Years...');
     const schoolYears = [
       { schoolYearId: 1, schoolyear: '2022-2023', schoolYearCode: '2022-2023' },
       { schoolYearId: 2, schoolyear: '2023-2024', schoolYearCode: '2023-2024' },
       { schoolYearId: 3, schoolyear: '2024-2025', schoolYearCode: '2024-2025' }
     ];

     const createdSchoolYears = [];
     for (const schoolYear of schoolYears) {
       // Try to find existing school year first
       let existing = await prisma.schoolYear.findUnique({
         where: { schoolYearId: schoolYear.schoolYearId }
       });
       
       if (existing) {
         createdSchoolYears.push(existing);
         console.log(`✅ School Year found: ${existing.schoolyear} (ID: ${existing.schoolYearId})`);
       } else {
         const created = await prisma.schoolYear.create({
           data: schoolYear
         });
         createdSchoolYears.push(created);
         console.log(`✅ School Year created: ${created.schoolyear} (ID: ${created.schoolYearId})`);
       }
     }

    console.log('\n📚 Adding Courses...');
    
         // Add Courses for each grade (1-9) with section A
     const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9];
     const createdCourses = [];

     for (let i = 0; i < grades.length; i++) {
       const grade = grades[i];
       const courseData = {
         courseId: `${i + 1}`,
         schoolYearId: 3, // Use 2024-2025 (ID: 3)
         grade: `Grade ${grade}`,
         section: 'A',
         courseName: `ថ្នាក់ទី ${grade}`
       };

       // Check if course already exists
       const existingCourse = await prisma.course.findUnique({
         where: { courseId: courseData.courseId }
       });

       if (existingCourse) {
         createdCourses.push(existingCourse);
         console.log(`✅ Course found: ${existingCourse.courseName} - Section ${existingCourse.section} (ID: ${existingCourse.courseId})`);
       } else {
         const created = await prisma.course.create({
           data: courseData
         });
         createdCourses.push(created);
         console.log(`✅ Course created: ${created.courseName} - Section ${created.section} (ID: ${created.courseId})`);
       }
     }

     // Add additional courses for different school years if needed
     console.log('\n🔄 Adding courses for 2023-2024...');
     for (let i = 0; i < grades.length; i++) {
       const grade = grades[i];
       const courseData = {
         courseId: `${i + 10}`,
         schoolYearId: 2, // 2023-2024 (ID: 2)
         grade: `Grade ${grade}`,
         section: 'A',
         courseName: `ថ្នាក់ទី ${grade}`
       };

       // Check if course already exists
       const existingCourse = await prisma.course.findUnique({
         where: { courseId: courseData.courseId }
       });

       if (existingCourse) {
         createdCourses.push(existingCourse);
         console.log(`✅ Course found: ${existingCourse.courseName} - Section ${existingCourse.section} (ID: ${existingCourse.courseId}) - 2023-2024`);
       } else {
         const created = await prisma.course.create({
           data: courseData
         });
         createdCourses.push(created);
         console.log(`✅ Course created: ${created.courseName} - Section ${created.section} (ID: ${created.courseId}) - 2023-2024`);
       }
     }

     console.log('\n🔄 Adding courses for 2022-2023...');
     for (let i = 0; i < grades.length; i++) {
       const grade = grades[i];
       const courseData = {
         courseId: `${i + 19}`,
         schoolYearId: 1, // 2022-2023 (ID: 1)
         grade: `Grade ${grade}`,
         section: 'A',
         courseName: `ថ្នាក់ទី ${grade}`
       };

       // Check if course already exists
       const existingCourse = await prisma.course.findUnique({
         where: { courseId: courseData.courseId }
       });

       if (existingCourse) {
         createdCourses.push(existingCourse);
         console.log(`✅ Course found: ${existingCourse.courseName} - Section ${existingCourse.section} (ID: ${existingCourse.courseId}) - 2022-2023`);
       } else {
         const created = await prisma.course.create({
           data: courseData
         });
         createdCourses.push(created);
         console.log(`✅ Course created: ${created.courseName} - Section ${created.section} (ID: ${created.courseId}) - 2022-2023`);
       }
     }

    console.log('\n🎉 All school data created successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - School Years: ${createdSchoolYears.length}`);
    console.log(`   - Total Courses: ${createdCourses.length}`);
    console.log(`   - Courses per year: ${grades.length}`);

  } catch (error) {
    console.error('❌ Error creating school data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addSchoolData();
