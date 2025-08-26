const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSemesters() {
  console.log('📅 Adding Semesters to Database');
  console.log('================================\n');

  try {
    const semesters = [
      { semester: 'First Semester', semesterCode: 'S1' },
      { semester: 'Second Semester', semesterCode: 'S2' },
      { semester: 'Summer Semester', semesterCode: 'S3' }
    ];

    console.log('📝 Adding semesters...\n');

    for (const semester of semesters) {
      try {
        const existingSemester = await prisma.semester.findFirst({
          where: { semesterCode: semester.semesterCode }
        });

        if (existingSemester) {
          console.log(`⚠️  Semester ${semester.semesterCode} already exists`);
        } else {
          const newSemester = await prisma.semester.create({
            data: semester
          });
          console.log(`✅ Added semester: ${semester.semester} (${semester.semesterCode})`);
        }
      } catch (error) {
        console.error(`❌ Error adding semester ${semester.semesterCode}:`, error.message);
      }
    }

    // Check final status
    const allSemesters = await prisma.semester.findMany();
    console.log(`\n📊 Final Database Status:`);
    console.log(`---------------------------`);
    console.log(`Total Semesters: ${allSemesters.length}`);
    
    for (const semester of allSemesters) {
      console.log(`   - ID: ${semester.semesterId}, Code: ${semester.semesterCode}, Name: ${semester.semester}`);
    }

    console.log('\n🎉 Semesters added successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSemesters();
