const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Sample Khmer names for testing
const khmerNames = {
  male: [
    { firstName: 'សុវណ្ណ', lastName: 'វណ្ណា' },
    { firstName: 'រតនា', lastName: 'សុខា' },
    { firstName: 'បញ្ញា', lastName: 'ធីតា' },
    { firstName: 'វិជ្ជា', lastName: 'រតនា' },
    { firstName: 'សុភា', lastName: 'វណ្ណា' }
  ],
  female: [
    { firstName: 'សុវណ្ណ', lastName: 'វណ្ណា' },
    { firstName: 'រតនា', lastName: 'សុខា' },
    { firstName: 'បញ្ញា', lastName: 'ធីតា' },
    { firstName: 'វិជ្ជា', lastName: 'រតនា' },
    { firstName: 'សុភា', lastName: 'វណ្ណា' }
  ]
};

const classes = ['1', '2', '3', '4', '5'];
const genders = ['male', 'female'];
const villages = ['ភូមិថ្មី', 'ភូមិចាស់', 'ភូមិកណ្តាល', 'ភូមិខាងកើត', 'ភូមិខាងលិច'];
const districts = ['ភ្នំពេញ', 'កំពង់ចាម', 'សៀមរាប', 'បាត់ដំបង', 'កំពង់ឆ្នាំង'];
const provinces = ['ភ្នំពេញ', 'កំពង់ចាម', 'សៀមរាប', 'បាត់ដំបង', 'កំពង់ឆ្នាំង'];
const religions = ['គ្រិស្តសាសនា', 'ព្រះពុទ្ធសាសនា', 'ឥស្លាម'];
const healthStatuses = ['ល្អ', 'ធម្មតា', 'ត្រូវការថែទាំ'];
const occupations = ['គ្រូបង្រៀន', 'អ្នកជំនួញ', 'កសិករ', 'អ្នកធ្វើការ', 'អ្នកជំនាញ'];
const relations = ['ឪពុក', 'ម្តាយ', 'អាណាព្យាបាល', 'ជីតា', 'ជីដូន'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomDate(startYear = 2010, endYear = 2015) {
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function generatePhoneNumber() {
  return '0' + Math.floor(Math.random() * 90000000 + 10000000);
}

async function addSingleStudent() {
  console.log('🎓 Adding Single Student');
  console.log('========================\n');

  try {
    // Check if school year exists, create if not
    let schoolYear = await prisma.schoolYear.findFirst({
      where: { schoolYearCode: '2024-2025' }
    });

    if (!schoolYear) {
      console.log('📚 Creating school year 2024-2025...');
      schoolYear = await prisma.schoolYear.create({
        data: {
          schoolYearCode: '2024-2025'
        }
      });
      console.log('✅ School year created:', schoolYear.schoolYearCode);
    } else {
      console.log('✅ School year found:', schoolYear.schoolYearCode);
    }

    // Generate random student data
    const gender = getRandomElement(genders);
    const nameData = getRandomElement(khmerNames[gender]);
    const studentData = {
      firstName: nameData.firstName,
      lastName: nameData.lastName,
      gender: gender,
      dob: new Date(generateRandomDate()),
      class: getRandomElement(classes),
      schoolYear: schoolYear.schoolYearCode,
      registerToStudy: true,
      studentHouseNumber: (Math.floor(Math.random() * 999) + 1).toString(),
      studentVillage: getRandomElement(villages),
      studentDistrict: getRandomElement(districts),
      studentProvince: getRandomElement(provinces),
      studentBirthDistrict: getRandomElement(districts),
      phone: generatePhoneNumber(),
      religion: getRandomElement(religions),
      health: getRandomElement(healthStatuses),
      emergencyContact: generatePhoneNumber(),
      vaccinated: Math.random() > 0.3, // 70% vaccinated
      previousSchool: '',
      transferReason: '',
      needsClothes: Math.random() > 0.7, // 30% need clothes
      needsMaterials: Math.random() > 0.6, // 40% need materials
      needsTransport: Math.random() > 0.8, // 20% need transport
      registrationDate: new Date(),
      status: 'active'
    };

    console.log('📝 Student data to create:', studentData);

    // Create the student
    const newStudent = await prisma.student.create({
      data: studentData
    });

    console.log('✅ Student created successfully!');
    console.log('📊 Student ID:', newStudent.studentId);
    console.log('👤 Student Name:', `${newStudent.lastName} ${newStudent.firstName}`);

    // Create guardian data
    const guardianData = {
      firstName: nameData.firstName + ' ឪពុក',
      lastName: nameData.lastName,
      relation: getRandomElement(relations),
      phone: generatePhoneNumber(),
      occupation: getRandomElement(occupations),
      income: Math.floor(Math.random() * 1000) + 200,
      childrenCount: Math.floor(Math.random() * 5) + 1,
      houseNumber: (Math.floor(Math.random() * 999) + 1).toString(),
      village: getRandomElement(villages),
      district: getRandomElement(districts),
      province: getRandomElement(provinces),
      birthDistrict: getRandomElement(districts),
      believeJesus: studentData.religion === 'គ្រិស្តសាសនា',
      church: studentData.religion === 'គ្រិស្តសាសនា' ? 'ព្រះវិហារមិត្តភាព' : '',
      studentId: newStudent.studentId
    };

    console.log('👨‍👩‍👧‍👦 Creating guardian...');
    const guardian = await prisma.guardian.create({
      data: guardianData
    });

    console.log('✅ Guardian created:', `${guardian.firstName} ${guardian.lastName}`);

    // Create family info
    const familyInfoData = {
      livingWith: 'ឪពុកម្តាយ',
      ownHouse: Math.random() > 0.4, // 60% own house
      durationInKPC: (Math.floor(Math.random() * 10) + 1).toString(),
      livingCondition: getRandomElement(['ល្អ', 'ធម្មតា', 'ខ្វះខាត']),
      organizationHelp: Math.random() > 0.7 ? 'អង្គការមិត្តភាព' : null,
      knowSchool: getRandomElement(['អ្នកគ្រូ', 'មិត្តភក្តិ', 'ផ្សាយពាណិជ្ជកម្ម', 'អ៊ីនធឺណិត']),
      religion: studentData.religion,
      churchName: studentData.religion === 'គ្រិស្តសាសនា' ? 'ព្រះវិហារមិត្តភាព' : '',
      canHelpSchool: Math.random() > 0.5, // 50% can help
      helpAmount: parseFloat((Math.floor(Math.random() * 500) + 100).toString()),
      helpFrequency: getRandomElement(['ប្រចាំខែ', 'ប្រចាំឆ្នាំ', 'ម្តងម្កាល']),
      studentId: newStudent.studentId
    };

    console.log('🏠 Creating family info...');
    const familyInfo = await prisma.familyInfo.create({
      data: familyInfoData
    });

    console.log('✅ Family info created');

    // Get the complete student with relations
    const completeStudent = await prisma.student.findUnique({
      where: { studentId: newStudent.studentId },
      include: {
        guardians: true,
        family: true
      }
    });

    console.log('\n🎉 Student Registration Complete!');
    console.log('================================');
    console.log(`📋 Student ID: ${completeStudent.studentId}`);
    console.log(`👤 Name: ${completeStudent.lastName} ${completeStudent.firstName}`);
    console.log(`👦 Gender: ${completeStudent.gender}`);
    console.log(`📅 Date of Birth: ${completeStudent.dob}`);
    console.log(`🎓 Class: ${completeStudent.class}`);
    console.log(`📚 School Year: ${completeStudent.schoolYear}`);
    console.log(`📞 Phone: ${completeStudent.phone}`);
    console.log(`🏠 Address: ${completeStudent.studentHouseNumber}, ${completeStudent.studentVillage}, ${completeStudent.studentDistrict}`);
    console.log(`⛪ Religion: ${completeStudent.religion}`);
    console.log(`💉 Vaccinated: ${completeStudent.vaccinated ? 'Yes' : 'No'}`);
    
    console.log('\n👨‍👩‍👧‍👦 Guardian Information:');
    completeStudent.guardians.forEach((guardian, index) => {
      console.log(`  ${index + 1}. ${guardian.firstName} ${guardian.lastName}`);
      console.log(`     Relation: ${guardian.relation}`);
      console.log(`     Occupation: ${guardian.occupation}`);
      console.log(`     Phone: ${guardian.phone}`);
      console.log(`     Income: ${guardian.income} Riel`);
    });

    console.log('\n🏠 Family Information:');
    console.log(`  Living with: ${completeStudent.family.livingWith}`);
    console.log(`  Own house: ${completeStudent.family.ownHouse ? 'Yes' : 'No'}`);
    console.log(`  Duration in KPC: ${completeStudent.family.durationInKPC} years`);
    console.log(`  Living condition: ${completeStudent.family.livingCondition}`);
    console.log(`  Can help school: ${completeStudent.family.canHelpSchool ? 'Yes' : 'No'}`);
    if (completeStudent.family.canHelpSchool) {
      console.log(`  Help amount: ${completeStudent.family.helpAmount} Riel ${completeStudent.family.helpFrequency}`);
    }

    // Verify the student was created in the database
    const totalStudents = await prisma.student.count();
    console.log(`\n📊 Total students in database: ${totalStudents}`);

    console.log('\n✅ Script completed successfully!');
    console.log('\n🔧 Next steps:');
    console.log('1. Check the student in the web interface');
    console.log('2. Test the PDF generation for this student');
    console.log('3. Verify all data is displayed correctly');

  } catch (error) {
    console.error('❌ Error adding student:', error);
    
    if (error.code === 'P2002') {
      console.error('💡 This might be a duplicate entry. Try running the script again.');
    }
    
    if (error.code === 'P2003') {
      console.error('💡 Foreign key constraint failed. Check if school year exists.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addSingleStudent();
