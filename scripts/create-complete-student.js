const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Comprehensive Khmer names database
const khmerNames = {
  male: [
    { firstName: 'សុវណ្ណ', lastName: 'វណ្ណា' },
    { firstName: 'រតនា', lastName: 'សុខា' },
    { firstName: 'បញ្ញា', lastName: 'ធីតា' },
    { firstName: 'វិជ្ជា', lastName: 'រតនា' },
    { firstName: 'សុភា', lastName: 'វណ្ណា' },
    { firstName: 'ចាន់', lastName: 'រតនា' },
    { firstName: 'ធីតា', lastName: 'សុខា' },
    { firstName: 'វិជ្ជា', lastName: 'វណ្ណា' },
    { firstName: 'សុភា', lastName: 'ធីតា' },
    { firstName: 'រតនា', lastName: 'វណ្ណា' },
    { firstName: 'បញ្ញា', lastName: 'សុខា' },
    { firstName: 'ចាន់', lastName: 'ធីតា' },
    { firstName: 'វិជ្ជា', lastName: 'សុខា' },
    { firstName: 'សុភា', lastName: 'រតនា' },
    { firstName: 'រតនា', lastName: 'វណ្ណា' },
    { firstName: 'បញ្ញា', lastName: 'វណ្ណា' },
    { firstName: 'ចាន់', lastName: 'សុខា' },
    { firstName: 'វិជ្ជា', lastName: 'ធីតា' },
    { firstName: 'សុភា', lastName: 'វណ្ណា' },
    { firstName: 'រតនា', lastName: 'ធីតា' },
    { firstName: 'សុខា', lastName: 'វណ្ណា' },
    { firstName: 'ធីតា', lastName: 'សុខា' },
    { firstName: 'រតនា', lastName: 'វណ្ណា' },
    { firstName: 'បញ្ញា', lastName: 'ធីតា' },
    { firstName: 'ចាន់', lastName: 'វណ្ណា' }
  ],
  female: [
    { firstName: 'សុវណ្ណ', lastName: 'វណ្ណា' },
    { firstName: 'រតនា', lastName: 'សុខា' },
    { firstName: 'បញ្ញា', lastName: 'ធីតា' },
    { firstName: 'វិជ្ជា', lastName: 'រតនា' },
    { firstName: 'សុភា', lastName: 'វណ្ណា' },
    { firstName: 'ចាន់', lastName: 'រតនា' },
    { firstName: 'ធីតា', lastName: 'សុខា' },
    { firstName: 'វិជ្ជា', lastName: 'វណ្ណា' },
    { firstName: 'សុភា', lastName: 'ធីតា' },
    { firstName: 'រតនា', lastName: 'វណ្ណា' },
    { firstName: 'បញ្ញា', lastName: 'សុខា' },
    { firstName: 'ចាន់', lastName: 'ធីតា' },
    { firstName: 'វិជ្ជា', lastName: 'សុខា' },
    { firstName: 'សុភា', lastName: 'រតនា' },
    { firstName: 'រតនា', lastName: 'វណ្ណា' },
    { firstName: 'បញ្ញា', lastName: 'វណ្ណា' },
    { firstName: 'ចាន់', lastName: 'សុខា' },
    { firstName: 'វិជ្ជា', lastName: 'ធីតា' },
    { firstName: 'សុភា', lastName: 'វណ្ណា' },
    { firstName: 'រតនា', lastName: 'ធីតា' },
    { firstName: 'សុខា', lastName: 'វណ្ណា' },
    { firstName: 'ធីតា', lastName: 'សុខា' },
    { firstName: 'រតនា', lastName: 'វណ្ណា' },
    { firstName: 'បញ្ញា', lastName: 'ធីតា' },
    { firstName: 'ចាន់', lastName: 'វណ្ណា' }
  ]
};

// Grade options matching the form
const grades = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
  { value: "8", label: "8" },
  { value: "9", label: "9" }
];

const genders = [
  { value: 'male', label: 'ប្រុស' },
  { value: 'female', label: 'ស្រី' }
];

const villages = [
  'ភូមិថ្មី', 'ភូមិចាស់', 'ភូមិកណ្តាល', 'ភូមិខាងកើត', 'ភូមិខាងលិច', 
  'ភូមិខាងជើង', 'ភូមិខាងត្បូង', 'ភូមិព្រៃ', 'ភូមិវាល', 'ភូមិដី'
];

const districts = [
  'ភ្នំពេញ', 'កំពង់ចាម', 'សៀមរាប', 'បាត់ដំបង', 'កំពង់ឆ្នាំង', 
  'កំពត', 'កំពង់ធំ', 'កំពង់ស្ពឺ', 'កំពង់ចាម', 'កំពង់ឆ្នាំង'
];

const provinces = [
  'ភ្នំពេញ', 'កំពង់ចាម', 'សៀមរាប', 'បាត់ដំបង', 'កំពង់ឆ្នាំង', 
  'កំពត', 'កំពង់ធំ', 'កំពង់ស្ពឺ', 'កំពង់ចាម', 'កំពង់ឆ្នាំង'
];

const religions = [
  'គ្រិស្តសាសនា', 'ព្រះពុទ្ធសាសនា', 'ឥស្លាម', 'ហិណ្ឌូ'
];

const healthStatuses = [
  'ល្អ', 'ធម្មតា', 'ត្រូវការថែទាំ', 'មានជំងឺ'
];

const occupations = [
  'គ្រូបង្រៀន', 'អ្នកជំនួញ', 'កសិករ', 'អ្នកធ្វើការ', 'អ្នកជំនាញ', 
  'អ្នកជួញដូរ', 'អ្នកចម្ការ', 'អ្នកជាង', 'អ្នកបើករថយន្ត', 'អ្នករត់ម៉ូតូ'
];

const relations = [
  { value: 'father', label: 'ឪពុក' },
  { value: 'mother', label: 'ម្តាយ' },
  { value: 'guardian', label: 'អាណាព្យាបាល' }
];

const livingConditions = [
  { value: 'good', label: 'ល្អ' },
  { value: 'medium', label: 'មធ្យម' },
  { value: 'poor', label: 'ខ្វះខាត' }
];

const helpFrequencies = [
  { value: 'monthly', label: 'ប្រចាំខែ' },
  { value: 'yearly', label: 'ប្រចាំឆ្នាំ' },
  { value: 'occasionally', label: 'ម្តងម្កាល' }
];

const knowSchoolOptions = [
  'អ្នកគ្រូ', 'មិត្តភក្តិ', 'ផ្សាយពាណិជ្ជកម្ម', 'អ៊ីនធឺណិត', 'គ្រួសារ', 'អ្នកជិតខាង'
];

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

function calculateAge(dob) {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

async function createCompleteStudent() {
  console.log('🎓 Creating Complete Student with All Required Fields');
  console.log('====================================================\n');

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

    // Generate random student data with all required fields
    const gender = getRandomElement(genders);
    const nameData = getRandomElement(khmerNames[gender.value]);
    const grade = getRandomElement(grades);
    const dob = generateRandomDate();
    const age = calculateAge(dob);

    console.log('📝 Generating student data...');
    console.log(`   Name: ${nameData.lastName} ${nameData.firstName}`);
    console.log(`   Gender: ${gender.label}`);
    console.log(`   Grade: ${grade.label}`);
    console.log(`   DOB: ${dob} (Age: ${age})`);

    // Create student data with ALL required fields
    const studentData = {
      // REQUIRED FIELDS (from validation)
      lastName: nameData.lastName,
      firstName: nameData.firstName,
      gender: gender.value,
      dob: new Date(dob),
      class: grade.value, // Use simple number
      schoolYear: schoolYear.schoolYearCode,
      
      // Additional student information
      registerToStudy: true,
      previousSchool: Math.random() > 0.7 ? 'សាលាមុន' : '',
      transferReason: Math.random() > 0.8 ? 'ផ្លាស់ទីលំនៅ' : '',
      
      // Address information
      studentHouseNumber: (Math.floor(Math.random() * 999) + 1).toString(),
      studentVillage: getRandomElement(villages),
      studentDistrict: getRandomElement(districts),
      studentProvince: getRandomElement(provinces),
      studentBirthDistrict: getRandomElement(districts),
      
      // Contact information
      phone: generatePhoneNumber(),
      emergencyContact: generatePhoneNumber(),
      
      // Health and religion
      health: getRandomElement(healthStatuses),
      vaccinated: Math.random() > 0.3, // 70% vaccinated
      religion: getRandomElement(religions),
      
      // School needs
      needsClothes: Math.random() > 0.7, // 30% need clothes
      needsMaterials: Math.random() > 0.6, // 40% need materials
      needsTransport: Math.random() > 0.8, // 20% need transport
      
      // Status and dates
      registrationDate: new Date(),
      status: 'active'
    };

    console.log('👤 Creating student record...');
    const newStudent = await prisma.student.create({
      data: studentData
    });

    console.log(`✅ Student created with ID: ${newStudent.studentId}`);

    // Create guardian data (required for complete student)
    const guardianRelation = getRandomElement(relations);
    const guardianData = {
      firstName: nameData.firstName + ' ' + guardianRelation.label,
      lastName: nameData.lastName,
      relation: guardianRelation.value,
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

    console.log('👨‍👩‍👧‍👦 Creating guardian record...');
    const guardian = await prisma.guardian.create({
      data: guardianData
    });

    console.log(`✅ Guardian created: ${guardian.firstName} ${guardian.lastName}`);

    // Create family info (required for complete student)
    const livingCondition = getRandomElement(livingConditions);
    const helpFrequency = getRandomElement(helpFrequencies);
    const familyInfoData = {
      livingWith: 'ឪពុកម្តាយ',
      ownHouse: Math.random() > 0.4, // 60% own house
      durationInKPC: (Math.floor(Math.random() * 10) + 1).toString(),
      livingCondition: livingCondition.value,
      organizationHelp: Math.random() > 0.7 ? 'អង្គការមិត្តភាព' : '',
      knowSchool: getRandomElement(knowSchoolOptions),
      religion: studentData.religion,
      churchName: studentData.religion === 'គ្រិស្តសាសនា' ? 'ព្រះវិហារមិត្តភាព' : '',
      canHelpSchool: Math.random() > 0.5, // 50% can help
      helpAmount: parseFloat((Math.floor(Math.random() * 500) + 100).toString()),
      helpFrequency: helpFrequency.value,
      studentId: newStudent.studentId
    };

    console.log('🏠 Creating family info record...');
    const familyInfo = await prisma.familyInfo.create({
      data: familyInfoData
    });

    console.log('✅ Family info created');

    // Get the complete student with all relations
    const completeStudent = await prisma.student.findUnique({
      where: { studentId: newStudent.studentId },
      include: {
        guardians: true,
        family: true
      }
    });

    // Display comprehensive summary
    console.log('\n🎉 COMPLETE STUDENT CREATION SUCCESSFUL!');
    console.log('==========================================');
    console.log(`📋 Student ID: ${completeStudent.studentId}`);
    console.log(`👤 Name: ${completeStudent.lastName} ${completeStudent.firstName}`);
    console.log(`👦 Gender: ${gender.label}`);
    console.log(`📅 Date of Birth: ${completeStudent.dob.toISOString().split('T')[0]} (Age: ${age})`);
    console.log(`🎓 Class: ${completeStudent.class}`);
    console.log(`📚 School Year: ${completeStudent.schoolYear}`);
    console.log(`📞 Phone: ${completeStudent.phone}`);
    console.log(`🚨 Emergency Contact: ${completeStudent.emergencyContact}`);
    console.log(`🏠 Address: ${completeStudent.studentHouseNumber}, ${completeStudent.studentVillage}, ${completeStudent.studentDistrict}`);
    console.log(`⛪ Religion: ${completeStudent.religion}`);
    console.log(`💉 Vaccinated: ${completeStudent.vaccinated ? 'Yes' : 'No'}`);
    console.log(`🎒 Needs Clothes: ${completeStudent.needsClothes ? 'Yes' : 'No'}`);
    console.log(`📚 Needs Materials: ${completeStudent.needsMaterials ? 'Yes' : 'No'}`);
    console.log(`🚌 Needs Transport: ${completeStudent.needsTransport ? 'Yes' : 'No'}`);
    
    console.log('\n👨‍👩‍👧‍👦 Guardian Information:');
    completeStudent.guardians.forEach((guardian, index) => {
      console.log(`  ${index + 1}. ${guardian.firstName} ${guardian.lastName}`);
      console.log(`     Relation: ${guardian.relation}`);
      console.log(`     Occupation: ${guardian.occupation}`);
      console.log(`     Phone: ${guardian.phone}`);
      console.log(`     Income: ${guardian.income} Riel`);
      console.log(`     Children Count: ${guardian.childrenCount}`);
      console.log(`     Address: ${guardian.houseNumber}, ${guardian.village}, ${guardian.district}`);
    });

    console.log('\n🏠 Family Information:');
    console.log(`  Living with: ${completeStudent.family.livingWith}`);
    console.log(`  Own house: ${completeStudent.family.ownHouse ? 'Yes' : 'No'}`);
    console.log(`  Duration in KPC: ${completeStudent.family.durationInKPC} years`);
    console.log(`  Living condition: ${livingCondition.label}`);
    console.log(`  Organization help: ${completeStudent.family.organizationHelp || 'None'}`);
    console.log(`  Know school through: ${completeStudent.family.knowSchool}`);
    console.log(`  Religion: ${completeStudent.family.religion}`);
    console.log(`  Church: ${completeStudent.family.churchName || 'None'}`);
    console.log(`  Can help school: ${completeStudent.family.canHelpSchool ? 'Yes' : 'No'}`);
    if (completeStudent.family.canHelpSchool) {
      console.log(`  Help amount: ${completeStudent.family.helpAmount} Riel ${helpFrequency.label}`);
    }

    // Verify the student was created in the database
    const totalStudents = await prisma.student.count();
    console.log(`\n📊 Total students in database: ${totalStudents}`);

    console.log('\n✅ Script completed successfully!');
    console.log('\n🔧 This student has ALL required fields and can be used for:');
    console.log('1. Testing the registration form');
    console.log('2. PDF generation');
    console.log('3. Grade reports');
    console.log('4. Attendance tracking');
    console.log('5. Complete student management features');

  } catch (error) {
    console.error('❌ Error creating complete student:', error);
    
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
createCompleteStudent();
