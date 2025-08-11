const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSubjects() {
  try {
    console.log('📚 Starting to add subjects to database...\n');

    // Define all subjects with Khmer names only (no codes since we removed subjectCode)
    const subjects = [
      { name: 'កុំព្យូទ័រ' },
      { name: 'គណិតវិទ្យា' },
      { name: 'គំនូរ' },
      { name: 'គីមីវិទ្យា' },
      { name: 'គេហកិច្ច' },
      { name: 'ចំរៀង-របាំ' },
      { name: 'ជីវវិទ្យា' },
      { name: 'តែងសេចក្តី' },
      { name: 'ធរណីមាត្រ' },
      { name: 'នព្វន្ត' },
      { name: 'ប្រវត្តិវិទ្យា' },
      { name: 'ផែនដីវិទ្យា' },
      { name: 'ភាសា​ខ្មែរ' },
      { name: 'ភូមិវិទ្យា' },
      { name: 'មាត្រាប្រពន្ធ័' },
      { name: 'មេសូត្រ' },
      { name: 'រូបវិទ្យា' },
      { name: 'រឿងនិទាន' },
      { name: 'រៀនអាន' },
      { name: 'វិទ្យាសាស្រ្ត' },
      { name: 'វិទ្យាសាស្រ្ត​និងសិក្សាសង្គម' },
      { name: 'វេយ្យាករណ៏' },
      { name: 'សំណេរ' },
      { name: 'សរសេរតាមអាន' },
      { name: 'សីលធម៌-ពលរដ្ឋវិទ្យា' },
      { name: 'ហត្ថកម្ម' },
      { name: 'អក្សរផ្ចង់' },
      { name: 'អង់គ្លេស' },
      { name: 'អប់រំកាយ' }
    ];

    console.log(`📝 Found ${subjects.length} subjects to add...\n`);

    let addedCount = 0;
    let existingCount = 0;

    for (const subject of subjects) {
      try {
        // Check if subject already exists by name
        const existingSubject = await prisma.subject.findFirst({
          where: { subjectName: subject.name }
        });

        if (existingSubject) {
          console.log(`✅ Subject already exists: ${subject.name}`);
          existingCount++;
        } else {
          // Create new subject with only subjectName
          const createdSubject = await prisma.subject.create({
            data: {
              subjectName: subject.name
            }
          });
          
          console.log(`➕ Subject created: ${createdSubject.subjectName}`);
          addedCount++;
        }
      } catch (error) {
        console.error(`❌ Error adding subject ${subject.name}:`, error.message);
      }
    }

    console.log('\n🎉 Subject addition completed!');
    console.log(`📊 Summary:`);
    console.log(`   - New subjects added: ${addedCount}`);
    console.log(`   - Existing subjects: ${existingCount}`);
    console.log(`   - Total subjects: ${addedCount + existingCount}`);

    // Display all subjects in database
    const allSubjects = await prisma.subject.findMany({
      orderBy: { subjectName: 'asc' }
    });

    console.log('\n📚 All subjects in database:');
    allSubjects.forEach((subject, index) => {
      console.log(`   ${index + 1}. ${subject.subjectName}`);
    });

  } catch (error) {
    console.error('❌ Error in addSubjects function:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addSubjects();
