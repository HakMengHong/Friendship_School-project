const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Khmer names for students
const khmerFirstNames = [
  'សុខា', 'វណ្ណា', 'ពិភិត្រ', 'រតនា', 'សុវណ្ណា', 'វិរុណា', 'ពិសិដ្ឋ', 'រត្និកា', 'សុវណ្ណារ៉ា', 'វិរុណារ៉ា',
  'ពិសិដ្ឋា', 'រត្និការ៉ា', 'សុខារ៉ា', 'វណ្ណារ៉ា', 'ពិភិត្រា', 'រតនារ៉ា', 'សុវណ្ណារ៉ា', 'វិរុណារ៉ា', 'ពិសិដ្ឋារ៉ា', 'រត្និការ៉ា'
];

const khmerLastNames = [
  'អ៊ុំ', 'អ៊ុន', 'អ៊ុង', 'អ៊ុត', 'អ៊ុរ', 'អ៊ុល', 'អ៊ុវ', 'អ៊ុស', 'អ៊ុហ', 'អ៊ុឡ',
  'អ៊ុអ', 'អ៊ុឣ', 'អ៊ុឤ', 'អ៊ុឥ', 'អ៊ុឦ', 'អ៊ុឧ', 'អ៊ុឨ', 'អ៊ុឩ', 'អ៊ុឪ', 'អ៊ុឫ'
];

const classes = ['ថ្នាក់ទី 1', 'ថ្នាក់ទី 2', 'ថ្នាក់ទី 3', 'ថ្នាក់ទី 4', 'ថ្នាក់ទី 5', 'ថ្នាក់ទី 6', 'ថ្នាក់ទី 7', 'ថ្នាក់ទី 8', 'ថ្នាក់ទី 9', 'ថ្នាក់ទី 10', 'ថ្នាក់ទី 11', 'ថ្នាក់ទី 12'];
const genders = ['male', 'female'];

async function createSchoolYearAndStudents() {
  console.log('🏫 Creating School Year and Students');
  console.log('====================================\n');

  try {
    // Step 1: Create or update the 2024-2025 school year
    console.log('📅 Step 1: Creating 2024-2025 School Year...');
    
    let schoolYear = await prisma.schoolYear.findFirst({
      where: {
        schoolYearCode: '2024-2025'
      }
    });

    if (!schoolYear) {
      schoolYear = await prisma.schoolYear.create({
        data: {
          schoolYearCode: '2024-2025'
        }
      });
      console.log('✅ Created new school year: 2024-2025');
    } else {
      console.log('✅ School year 2024-2025 already exists');
    }

    // Step 2: Create 20 students
    console.log('\n👥 Step 2: Creating 20 Students...');
    
    const students = [];
    for (let i = 0; i < 20; i++) {
      const firstName = khmerFirstNames[i];
      const lastName = khmerLastNames[i];
      const gender = genders[i % 2]; // Alternate between male and female
      const classLevel = classes[i % classes.length]; // Distribute across classes
      
      // Generate a random date of birth (between 2006-2018 for school age)
      const startYear = 2006;
      const endYear = 2018;
      const birthYear = startYear + Math.floor(Math.random() * (endYear - startYear + 1));
      const birthMonth = Math.floor(Math.random() * 12) + 1;
      const birthDay = Math.floor(Math.random() * 28) + 1;
      const dob = new Date(birthYear, birthMonth - 1, birthDay);

      const student = await prisma.student.create({
        data: {
          firstName: firstName,
          lastName: lastName,
          gender: gender,
          dob: dob,
          class: classLevel,
          phone: `0${Math.floor(Math.random() * 90000000) + 10000000}`, // Random phone number
          registrationDate: new Date(),
          status: 'active',
          religion: 'គ្រិស្តសាសនា',
          health: 'ល្អ',
          emergencyContact: `0${Math.floor(Math.random() * 90000000) + 10000000}`,
          needsClothes: Math.random() > 0.7, // 30% chance
          needsMaterials: Math.random() > 0.8, // 20% chance
          needsTransport: Math.random() > 0.9, // 10% chance
          registerToStudy: true,
          vaccinated: Math.random() > 0.2, // 80% chance
          schoolYear: '2024-2025',
          studentBirthDistrict: 'ភ្នំពេញ',
          studentDistrict: 'ភ្នំពេញ',
          studentProvince: 'ភ្នំពេញ',
          studentVillage: 'ភូមិថ្មី',
          studentHouseNumber: `${Math.floor(Math.random() * 999) + 1}`
        }
      });

      students.push(student);
      console.log(`✅ Created student ${i + 1}/20: ${firstName} ${lastName} (${classLevel})`);
    }

    // Step 3: Create some guardians for the students
    console.log('\n👨‍👩‍👧‍👦 Step 3: Creating Guardians...');
    
    for (let i = 0; i < Math.min(15, students.length); i++) { // Create guardians for first 15 students
      const student = students[i];
      const guardianFirstName = khmerFirstNames[(i + 5) % khmerFirstNames.length];
      const guardianLastName = khmerLastNames[(i + 5) % khmerLastNames.length];
      
      await prisma.guardian.create({
        data: {
          studentId: student.studentId,
          relation: i % 2 === 0 ? 'ឪពុក' : 'ម្តាយ',
          phone: `0${Math.floor(Math.random() * 90000000) + 10000000}`,
          firstName: guardianFirstName,
          lastName: guardianLastName,
          believeJesus: Math.random() > 0.3, // 70% chance
          birthDistrict: 'ភ្នំពេញ',
          district: 'ភ្នំពេញ',
          province: 'ភ្នំពេញ',
          village: 'ភូមិថ្មី',
          houseNumber: `${Math.floor(Math.random() * 999) + 1}`,
          occupation: i % 2 === 0 ? 'អ្នកជំនួញ' : 'គ្រូបង្រៀន',
          income: Math.floor(Math.random() * 1000) + 200, // $200-$1200
          childrenCount: Math.floor(Math.random() * 4) + 1, // 1-4 children
          church: 'ព្រះវិហារមិត្តភាព'
        }
      });
      
      console.log(`✅ Created guardian for ${student.firstName} ${student.lastName}`);
    }

    // Step 4: Create family info for some students
    console.log('\n👨‍👩‍👧‍👦 Step 4: Creating Family Info...');
    
    for (let i = 0; i < Math.min(10, students.length); i++) { // Create family info for first 10 students
      const student = students[i];
      
      await prisma.familyInfo.create({
        data: {
          studentId: student.studentId,
          canHelpSchool: Math.random() > 0.6, // 40% chance
          churchName: 'ព្រះវិហារមិត្តភាព',
          durationInKPC: `${Math.floor(Math.random() * 10) + 1} ឆ្នាំ`,
          helpAmount: Math.floor(Math.random() * 500) + 50, // $50-$550
          helpFrequency: ['ប្រចាំខែ', 'ប្រចាំឆ្នាំ', 'ម្តងម្កាល'][Math.floor(Math.random() * 3)],
          knowSchool: ['អ្នកជិតខាង', 'អ្នកគ្រូ', 'អ្នកមិត្ត'][Math.floor(Math.random() * 3)],
          livingCondition: ['ល្អ', 'មធ្យម', 'ខ្វះខាត'][Math.floor(Math.random() * 3)],
          livingWith: ['ឪពុកម្តាយ', 'ឪពុក', 'ម្តាយ', 'អ៊ំអូ'][Math.floor(Math.random() * 4)],
          organizationHelp: Math.random() > 0.7 ? 'មាន' : null,
          ownHouse: Math.random() > 0.3, // 70% chance
          religion: 'គ្រិស្តសាសនា'
        }
      });
      
      console.log(`✅ Created family info for ${student.firstName} ${student.lastName}`);
    }

    console.log('\n🎉 Successfully created school year and students!');
    console.log('\n📋 Summary:');
    console.log(`- School Year: 2024-2025 ✅`);
    console.log(`- Students Created: ${students.length} ✅`);
    console.log(`- Guardians Created: ${Math.min(15, students.length)} ✅`);
    console.log(`- Family Info Created: ${Math.min(10, students.length)} ✅`);

    // Final database check
    console.log('\n🔍 Final Database Check:');
    const finalStudents = await prisma.student.findMany();
    const finalSchoolYears = await prisma.schoolYear.findMany();
    const finalGuardians = await prisma.guardian.findMany();
    const finalFamilyInfo = await prisma.familyInfo.findMany();
    
    console.log(`- Total Students: ${finalStudents.length}`);
    console.log(`- Total School Years: ${finalSchoolYears.length}`);
    console.log(`- Total Guardians: ${finalGuardians.length}`);
    console.log(`- Total Family Info: ${finalFamilyInfo.length}`);

  } catch (error) {
    console.error('❌ Error creating school year and students:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSchoolYearAndStudents();
