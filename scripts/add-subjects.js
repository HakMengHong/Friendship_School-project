const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSubjects() {
  try {
    console.log('📚 Starting to add subjects to database...\n');

    // Define all subjects with Khmer names and English codes
    const subjects = [
      { name: 'កុំព្យូទ័រ', code: 'COMP' },
      { name: 'គណិតវិទ្យា', code: 'MATH' },
      { name: 'គំនូរ', code: 'ART' },
      { name: 'គីមីវិទ្យា', code: 'CHEM' },
      { name: 'គេហកិច្ច', code: 'HOME_EC' },
      { name: 'ចំរៀង-របាំ', code: 'MUSIC_DANCE' },
      { name: 'ជីវវិទ្យា', code: 'BIO' },
      { name: 'តែងសេចក្តី', code: 'COMPOSITION' },
      { name: 'ធរណីមាត្រ', code: 'GEOMETRY' },
      { name: 'នព្វន្ត', code: 'ARITHMETIC' },
      { name: 'ប្រវត្តិវិទ្យា', code: 'HISTORY' },
      { name: 'ផែនដីវិទ្យា', code: 'GEOGRAPHY' },
      { name: 'ភាសា​ខ្មែរ', code: 'KHMER' },
      { name: 'ភូមិវិទ្យា', code: 'CIVICS' },
      { name: 'មាត្រាប្រពន្ធ័', code: 'GRAMMAR' },
      { name: 'មេសូត្រ', code: 'POETRY' },
      { name: 'រូបវិទ្យា', code: 'PHYSICS' },
      { name: 'រឿងនិទាន', code: 'STORY' },
      { name: 'រៀនអាន', code: 'READING' },
      { name: 'វិទ្យាសាស្រ្ត', code: 'SCIENCE' },
      { name: 'វិទ្យាសាស្រ្ត​និងសិក្សាសង្គម', code: 'SOCIAL_SCIENCE' },
      { name: 'វេយ្យាករណ៏', code: 'LINGUISTICS' },
      { name: 'សំណេរ', code: 'WRITING' },
      { name: 'សរសេរតាមអាន', code: 'DICTATION' },
      { name: 'សីលធម៌-ពលរដ្ឋវិទ្យា', code: 'MORAL_CIVICS' },
      { name: 'ហត្ថកម្ម', code: 'HANDICRAFT' },
      { name: 'អក្សរផ្ចង់', code: 'CALLIGRAPHY' },
      { name: 'អង់គ្លេស', code: 'ENGLISH' },
      { name: 'អប់រំកាយ', code: 'PHYSICAL_ED' }
    ];

    console.log(`📝 Found ${subjects.length} subjects to add...\n`);

    let addedCount = 0;
    let existingCount = 0;

    for (const subject of subjects) {
      try {
        // Check if subject already exists
        const existingSubject = await prisma.subject.findUnique({
          where: { subjectCode: subject.code }
        });

        if (existingSubject) {
          console.log(`✅ Subject already exists: ${subject.name} (${subject.code})`);
          existingCount++;
        } else {
          // Create new subject
          const createdSubject = await prisma.subject.create({
            data: {
              subjectName: subject.name,
              subjectCode: subject.code
            }
          });
          
          console.log(`➕ Subject created: ${createdSubject.subjectName} (${createdSubject.subjectCode})`);
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
      console.log(`   ${index + 1}. ${subject.subjectName} (${subject.subjectCode})`);
    });

  } catch (error) {
    console.error('❌ Error in addSubjects function:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addSubjects();
