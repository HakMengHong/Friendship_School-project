const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Sample Khmer names for testing
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
    { firstName: 'រតនា', lastName: 'ធីតា' }
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
    { firstName: 'រតនា', lastName: 'ធីតា' }
  ]
};

const targetGrades = ['5', '7', '9'];
const genders = ['male', 'female'];
const villages = ['ភូមិថ្មី', 'ភូមិចាស់', 'ភូមិកណ្តាល', 'ភូមិខាងកើត', 'ភូមិខាងលិច', 'ភូមិខាងជើង', 'ភូមិខាងត្បូង'];
const districts = ['ភ្នំពេញ', 'កំពង់ចាម', 'សៀមរាប', 'បាត់ដំបង', 'កំពង់ឆ្នាំង', 'កំពត', 'កំពង់ធំ', 'កំពង់ស្ពឺ'];
const provinces = ['ភ្នំពេញ', 'កំពង់ចាម', 'សៀមរាប', 'បាត់ដំបង', 'កំពង់ឆ្នាំង', 'កំពត', 'កំពង់ធំ', 'កំពង់ស្ពឺ'];
const religions = ['គ្រិស្តសាសនា', 'ព្រះពុទ្ធសាសនា', 'ឥស្លាម'];
const healthStatuses = ['ល្អ', 'ធម្មតា', 'ត្រូវការថែទាំ'];
const occupations = ['គ្រូបង្រៀន', 'អ្នកជំនួញ', 'កសិករ', 'អ្នកធ្វើការ', 'អ្នកជំនាញ', 'អ្នកជួញដូរ', 'អ្នកចម្ការ', 'អ្នកជាង'];
const relations = ['ឪពុក', 'ម្តាយ', 'អាណាព្យាបាល', 'ជីតា', 'ជីដូន', 'បងប្រុស', 'បងស្រី'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomDate(startYear = 2010, endYear = 2015) {
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
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

function generatePhoneNumber() {
  return '0' + Math.floor(Math.random() * 90000000 + 10000000);
}

async function addBulkStudents() {
  console.log('🎓 Adding Bulk Students for Grades 5, 7, 9');
  console.log('==========================================\n');

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

    const expectedStudents = targetGrades.length * 20; // 3 grades * 20 students = 60 students
    let createdCount = 0;

    console.log(`📊 Creating ${expectedStudents} students (20 for each grade: 5, 7, 9)`);
    console.log('📚 School Year: 2024-2025\n');

    // Create courses for each grade
    console.log('📚 Creating courses for each grade...');
    const courses = [];
    for (const grade of targetGrades) {
      const courseData = {
        schoolYearId: schoolYear.schoolYearId,
        grade: grade,
        section: 'A',
        courseName: `ថ្នាក់ទី ${grade} A`
      };
      
      const course = await prisma.course.create({
        data: courseData
      });
      courses.push(course);
      console.log(`✅ Created course: ${course.courseName} (ID: ${course.courseId})`);
    }
    console.log('');

    for (const grade of targetGrades) {
      console.log(`\n🎓 Creating 20 students for ${grade}...`);
      console.log('='.repeat(50));

      for (let i = 1; i <= 20; i++) {
        try {
          // Generate random student data
          const gender = getRandomElement(genders);
          const nameData = getRandomElement(khmerNames[gender]);
          const dob = generateRandomDate();
          const age = calculateAge(dob);
          
          const studentData = {
            firstName: nameData.firstName,
            lastName: nameData.lastName,
            gender: gender,
            dob: dob,
            class: grade,
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
            previousSchool: Math.random() > 0.7 ? `សាលាបឋមសិក្សា ${getRandomElement(villages)}` : null,
            transferReason: Math.random() > 0.8 ? getRandomElement(['ផ្លាស់ទីលំនៅ', 'ចង់រៀននៅសាលាមិត្តភាព', 'គ្រួសារមានបញ្ហា']) : null,
            needsClothes: Math.random() > 0.7, // 30% need clothes
            needsMaterials: Math.random() > 0.6, // 40% need materials
            needsTransport: Math.random() > 0.8, // 20% need transport
            registrationDate: new Date(),
            status: 'active'
          };

          // Create the student
          const newStudent = await prisma.student.create({
            data: studentData
          });

          // Create guardian data - more realistic names
          const guardianNames = {
            father: [
              { firstName: 'ចាន់', lastName: 'រតនា' },
              { firstName: 'សុខា', lastName: 'វណ្ណា' },
              { firstName: 'ធីតា', lastName: 'សុខា' },
              { firstName: 'វិជ្ជា', lastName: 'រតនា' },
              { firstName: 'បញ្ញា', lastName: 'វណ្ណា' }
            ],
            mother: [
              { firstName: 'សុវណ្ណ', lastName: 'វណ្ណា' },
              { firstName: 'រតនា', lastName: 'សុខា' },
              { firstName: 'បញ្ញា', lastName: 'ធីតា' },
              { firstName: 'វិជ្ជា', lastName: 'រតនា' },
              { firstName: 'សុភា', lastName: 'វណ្ណា' }
            ]
          };
          
          const relation = getRandomElement(relations);
          const isFather = relation === 'ឪពុក';
          const guardianNameData = getRandomElement(isFather ? guardianNames.father : guardianNames.mother);
          
          const guardianData = {
            firstName: guardianNameData.firstName,
            lastName: guardianNameData.lastName,
            relation: relation,
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
            church: studentData.religion === 'គ្រិស្តសាសនា' ? 'ព្រះវិហារមិត្តភាព' : null,
            studentId: newStudent.studentId
          };

          // Create primary guardian
          await prisma.guardian.create({
            data: guardianData
          });

          // Create secondary guardian (30% chance)
          if (Math.random() > 0.7) {
            const secondaryRelation = getRandomElement(['ម្តាយ', 'ឪពុក', 'អាណាព្យាបាល', 'ជីតា', 'ជីដូន']);
            const isSecondaryFather = secondaryRelation === 'ឪពុក';
            const secondaryGuardianNameData = getRandomElement(isSecondaryFather ? guardianNames.father : guardianNames.mother);
            
            const secondaryGuardianData = {
              firstName: secondaryGuardianNameData.firstName,
              lastName: secondaryGuardianNameData.lastName,
              relation: secondaryRelation,
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
              church: studentData.religion === 'គ្រិស្តសាសនា' ? 'ព្រះវិហារមិត្តភាព' : null,
              studentId: newStudent.studentId
            };

            await prisma.guardian.create({
              data: secondaryGuardianData
            });
          }

          // Create family info
          const familyInfoData = {
            livingWith: getRandomElement(['ឪពុកម្តាយ', 'ឪពុក', 'ម្តាយ', 'ជីតាជីដូន', 'អាណាព្យាបាល']),
            ownHouse: Math.random() > 0.4, // 60% own house
            durationInKPC: (Math.floor(Math.random() * 10) + 1).toString() + ' ឆ្នាំ',
            livingCondition: getRandomElement(['ល្អ', 'ធម្មតា', 'ខ្វះខាត']),
            organizationHelp: Math.random() > 0.7 ? getRandomElement(['អង្គការមិត្តភាព', 'អង្គការកាតូលិក', 'អង្គការព្រះពុទ្ធសាសនា']) : null,
            knowSchool: getRandomElement(['អ្នកគ្រូ', 'មិត្តភក្តិ', 'ផ្សាយពាណិជ្ជកម្ម', 'អ៊ីនធឺណិត', 'អ្នកជិតខាង']),
            religion: studentData.religion,
            churchName: studentData.religion === 'គ្រិស្តសាសនា' ? getRandomElement(['ព្រះវិហារមិត្តភាព', 'ព្រះវិហារកាតូលិក', 'ព្រះវិហារព្រះពុទ្ធសាសនា']) : null,
            canHelpSchool: Math.random() > 0.5, // 50% can help
            helpAmount: Math.random() > 0.5 ? parseFloat((Math.floor(Math.random() * 500) + 100).toString()) : null,
            helpFrequency: Math.random() > 0.5 ? getRandomElement(['ប្រចាំខែ', 'ប្រចាំឆ្នាំ', 'ម្តងម្កាល']) : null,
            studentId: newStudent.studentId
          };

          // Create family info
          await prisma.familyInfo.create({
            data: familyInfoData
          });

          // Create scholarship data (20% chance)
          if (Math.random() > 0.8) {
            const scholarshipData = {
              studentId: newStudent.studentId,
              type: getRandomElement(['អាហារូបករណ៍ពេញលេញ', 'អាហារូបករណ៍ផ្នែក', 'ជំនួយសិក្សា', 'ជំនួយឧបត្ថម្ភ']),
              amount: Math.floor(Math.random() * 1000) + 100,
              sponsor: getRandomElement(['អង្គការមិត្តភាព', 'អង្គការកាតូលិក', 'អង្គការព្រះពុទ្ធសាសនា', 'អ្នកឧបត្ថម្ភឯកជន'])
            };

            await prisma.scholarship.create({
              data: scholarshipData
            });
          }

          // Create enrollment for the student
          const course = courses.find(c => c.grade === grade);
          if (course) {
            const enrollmentData = {
              studentId: newStudent.studentId,
              courseId: course.courseId,
              drop: false
            };

            await prisma.enrollment.create({
              data: enrollmentData
            });
          }

          createdCount++;
          const studentAge = calculateAge(newStudent.dob);
          console.log(`✅ Student ${i}/20: ${newStudent.lastName} ${newStudent.firstName} (ID: ${newStudent.studentId}, Age: ${studentAge}, Grade: ${grade})`);

        } catch (error) {
          console.error(`❌ Error creating student ${i} for ${grade}:`, error.message);
          // Continue with next student
        }
      }

      console.log(`\n🎉 Completed ${grade}: 20 students created`);
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 BULK STUDENT CREATION COMPLETED!');
    console.log('='.repeat(60));
    console.log(`📊 Total students created: ${createdCount}`);
    console.log(`📚 School Year: 2024-2025`);
    console.log(`🎓 Grades: ${targetGrades.join(', ')}`);
    console.log(`👥 Students per grade: 20`);

    // Verify the students were created in the database
    const totalStudents = await prisma.student.count();
    const studentsByGrade = await prisma.student.groupBy({
      by: ['class'],
      where: {
        schoolYear: '2024-2025'
      },
      _count: {
        studentId: true
      }
    });

    const totalGuardians = await prisma.guardian.count();
    const totalFamilyInfo = await prisma.familyInfo.count();
    const totalScholarships = await prisma.scholarship.count();
    const totalEnrollments = await prisma.enrollment.count();
    const totalCourses = await prisma.course.count();

    console.log(`\n📊 Database Summary:`);
    console.log(`   Total students in database: ${totalStudents}`);
    console.log(`   Total guardians: ${totalGuardians}`);
    console.log(`   Total family info records: ${totalFamilyInfo}`);
    console.log(`   Total scholarships: ${totalScholarships}`);
    console.log(`   Total enrollments: ${totalEnrollments}`);
    console.log(`   Total courses: ${totalCourses}`);
    console.log(`   Students for 2024-2025:`);
    studentsByGrade.forEach(group => {
      console.log(`     Grade ${group.class}: ${group._count.studentId} students`);
    });

    console.log('\n🔧 Next steps:');
    console.log('1. Check the students in the web interface');
    console.log('2. Test the PDF generation for different grades');
    console.log('3. Verify all data is displayed correctly');
    console.log('4. Test grade reports and attendance features');

  } catch (error) {
    console.error('❌ Error in bulk student creation:', error);
    
    if (error.code === 'P2002') {
      console.error('💡 This might be a duplicate entry. Some students may already exist.');
    }
    
    if (error.code === 'P2003') {
      console.error('💡 Foreign key constraint failed. Check if school year exists.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addBulkStudents();
