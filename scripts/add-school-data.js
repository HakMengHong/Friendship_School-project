const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSchoolData() {
  try {
    console.log('🚀 Starting to add school data...\n');

         // Get existing School Years or create them if they don't exist
     console.log('📅 Getting/Creating School Years...');
     const schoolYears = [
       { schoolYearCode: '2022-2023' },
       { schoolYearCode: '2023-2024' },
       { schoolYearCode: '2024-2025' }
     ];

     const createdSchoolYears = [];
     for (const schoolYear of schoolYears) {
       // Try to find existing school year first
       let existing = await prisma.schoolYear.findUnique({
         where: { schoolYearCode: schoolYear.schoolYearCode }
       });
       
       if (existing) {
         createdSchoolYears.push(existing);
         console.log(`✅ School Year found: ${existing.schoolYearCode} (ID: ${existing.schoolYearId})`);
       } else {
         const created = await prisma.schoolYear.create({
           data: schoolYear
         });
         createdSchoolYears.push(created);
         console.log(`✅ School Year created: ${created.schoolYearCode} (ID: ${created.schoolYearId})`);
       }
     }

    console.log('\n📚 Adding Courses...');
    
         // Add Courses for each grade (1-12) with section A
     const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
     const createdCourses = [];

     for (let i = 0; i < grades.length; i++) {
       const grade = grades[i];
       const courseData = {
         schoolYearId: createdSchoolYears[2].schoolYearId, // Use 2024-2025
         grade: `${grade}`,
         section: 'A',
         courseName: `ថ្នាក់ទី ${grade}`
       };

              // Check if course already exists
       const existingCourse = await prisma.course.findFirst({
         where: { 
           schoolYearId: courseData.schoolYearId,
           grade: courseData.grade,
           section: courseData.section
         }
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
         schoolYearId: createdSchoolYears[1].schoolYearId, // 2023-2024
         grade: `${grade}`,
         section: 'A',
         courseName: `ថ្នាក់ទី ${grade}`
       };

              // Check if course already exists
       const existingCourse = await prisma.course.findFirst({
         where: { 
           schoolYearId: courseData.schoolYearId,
           grade: courseData.grade,
           section: courseData.section
         }
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
         schoolYearId: createdSchoolYears[0].schoolYearId, // 2022-2023
         grade: `${grade}`,
         section: 'A',
         courseName: `ថ្នាក់ទី ${grade}`
       };

              // Check if course already exists
       const existingCourse = await prisma.course.findFirst({
         where: { 
           schoolYearId: courseData.schoolYearId,
           grade: courseData.grade,
           section: courseData.section
         }
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
