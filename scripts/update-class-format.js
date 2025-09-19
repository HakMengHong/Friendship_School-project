const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateClassFormat() {
  console.log('🔄 Updating Class Format in Student Table');
  console.log('==========================================\n');

  try {
    // First, let's see what class values currently exist
    console.log('📊 Current class values in database:');
    const currentClasses = await prisma.student.groupBy({
      by: ['class'],
      _count: {
        studentId: true
      }
    });

    currentClasses.forEach(group => {
      console.log(`   ${group.class}: ${group._count.studentId} students`);
    });

    console.log('\n🔄 Starting class format update...\n');

    // Update class values from Khmer format to simple numbers
    const classMappings = {
      'ថ្នាក់ទី 1': '1',
      'ថ្នាក់ទី 2': '2', 
      'ថ្នាក់ទី 3': '3',
      'ថ្នាក់ទី 4': '4',
      'ថ្នាក់ទី 5': '5',
      'ថ្នាក់ទី 6': '6',
      'ថ្នាក់ទី 7': '7',
      'ថ្នាក់ទី 8': '8',
      'ថ្នាក់ទី 9': '9'
    };

    let totalUpdated = 0;

    for (const [khmerClass, simpleClass] of Object.entries(classMappings)) {
      const updateResult = await prisma.student.updateMany({
        where: {
          class: khmerClass
        },
        data: {
          class: simpleClass
        }
      });

      if (updateResult.count > 0) {
        console.log(`✅ Updated ${updateResult.count} students from "${khmerClass}" to "${simpleClass}"`);
        totalUpdated += updateResult.count;
      }
    }

    console.log(`\n🎉 Class format update completed!`);
    console.log(`📊 Total students updated: ${totalUpdated}`);

    // Show updated class distribution
    console.log('\n📊 Updated class values:');
    const updatedClasses = await prisma.student.groupBy({
      by: ['class'],
      _count: {
        studentId: true
      }
    });

    updatedClasses.forEach(group => {
      console.log(`   Class ${group.class}: ${group._count.studentId} students`);
    });

    console.log('\n✅ All class values have been updated to simple numbers!');

  } catch (error) {
    console.error('❌ Error updating class format:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateClassFormat();
