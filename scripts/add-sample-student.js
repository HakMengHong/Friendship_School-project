const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const studentsData = [
  {
    lastName: 'វណ្ណា',
    firstName: 'សុខ',
    gender: 'female',
    dob: new Date('2011-03-20'),
    class: '6',
    phone: '012345679',
    emergencyContact: '098765433',
    previousSchool: 'សាលាបឋមសិក្សាវណ្ណា',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    guardians: [
      {
        firstName: 'សុខ',
        lastName: 'វណ្ណា',
        relation: 'father',
        phone: '012345679',
        occupation: 'អាជីវករ',
        income: 600000,
        childrenCount: 2
      },
      {
        firstName: 'វណ្ណា',
        lastName: 'សុខ',
        relation: 'mother',
        phone: '098765433',
        occupation: 'គិលានុបដ្ឋាយិកា',
        income: 700000,
        childrenCount: 2
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '3 ឆ្នាំ',
      organizationHelp: 'អង្គការវណ្ណា',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារវណ្ណា',
      helpAmount: 150000,
      helpFrequency: 'រៀងរាល់ខែ'
    },
    scholarships: [
      {
        type: 'អាហារូបករណ៍សិក្សា',
        amount: 250000,
        sponsor: 'អង្គការវណ្ណា'
      }
    ]
  },
  {
    lastName: 'រតនា',
    firstName: 'វណ្ណា',
    gender: 'female',
    dob: new Date('2010-08-12'),
    class: '7',
    phone: '012345680',
    emergencyContact: '098765434',
    previousSchool: 'សាលាបឋមសិក្សារតនា',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    guardians: [
      {
        firstName: 'វណ្ណា',
        lastName: 'រតនា',
        relation: 'father',
        phone: '012345680',
        occupation: 'វិស្វករ',
        income: 1200000,
        childrenCount: 1
      },
      {
        firstName: 'រតនា',
        lastName: 'វណ្ណា',
        relation: 'mother',
        phone: '098765434',
        occupation: 'គ្រូ',
        income: 900000,
        childrenCount: 1
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '7 ឆ្នាំ',
      organizationHelp: 'អង្គការរតនា',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហាររតនា',
      helpAmount: 300000,
      helpFrequency: 'រៀងរាល់ខែ'
    },
    scholarships: [
      {
        type: 'អាហារូបករណ៍សិក្សា',
        amount: 400000,
        sponsor: 'អង្គការរតនា'
      }
    ]
  },
  {
    lastName: 'សុវណ្ណា',
    firstName: 'រតនា',
    gender: 'male',
    dob: new Date('2009-12-05'),
    class: '8',
    phone: '012345681',
    emergencyContact: '098765435',
    previousSchool: 'សាលាបឋមសិក្សាសុវណ្ណា',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    guardians: [
      {
        firstName: 'រតនា',
        lastName: 'សុវណ្ណា',
        relation: 'father',
        phone: '012345681',
        occupation: 'អ្នកជំនាញកុំព្យូទ័រ',
        income: 1500000,
        childrenCount: 2
      },
      {
        firstName: 'សុវណ្ណា',
        lastName: 'រតនា',
        relation: 'mother',
        phone: '098765435',
        occupation: 'គិលានុបដ្ឋាយិកា',
        income: 1000000,
        childrenCount: 2
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '4 ឆ្នាំ',
      organizationHelp: 'អង្គការសុវណ្ណា',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារសុវណ្ណា',
      helpAmount: 200000,
      helpFrequency: 'រៀងរាល់ខែ'
    },
    scholarships: [
      {
        type: 'អាហារូបករណ៍សិក្សា',
        amount: 350000,
        sponsor: 'អង្គការសុវណ្ណា'
      }
    ]
  },
  {
    lastName: 'វណ្ណា',
    firstName: 'សុវណ្ណា',
    gender: 'female',
    dob: new Date('2011-06-18'),
    class: '6',
    phone: '012345682',
    emergencyContact: '098765436',
    previousSchool: 'សាលាបឋមសិក្សាវណ្ណា',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    guardians: [
      {
        firstName: 'សុវណ្ណា',
        lastName: 'វណ្ណា',
        relation: 'father',
        phone: '012345682',
        occupation: 'អ្នកជំនាញហិរញ្ញវត្ថុ',
        income: 1800000,
        childrenCount: 3
      },
      {
        firstName: 'វណ្ណា',
        lastName: 'សុវណ្ណា',
        relation: 'mother',
        phone: '098765436',
        occupation: 'គ្រូ',
        income: 800000,
        childrenCount: 3
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '6 ឆ្នាំ',
      organizationHelp: 'អង្គការវណ្ណា',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារវណ្ណា',
      helpAmount: 250000,
      helpFrequency: 'រៀងរាល់ខែ'
    },
    scholarships: [
      {
        type: 'អាហារូបករណ៍សិក្សា',
        amount: 300000,
        sponsor: 'អង្គការវណ្ណា'
      }
    ]
  },
  {
    lastName: 'រតនា',
    firstName: 'សុវណ្ណា',
    gender: 'male',
    dob: new Date('2010-02-25'),
    class: '7',
    phone: '012345683',
    emergencyContact: '098765437',
    previousSchool: 'សាលាបឋមសិក្សារតនា',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    guardians: [
      {
        firstName: 'សុវណ្ណា',
        lastName: 'រតនា',
        relation: 'father',
        phone: '012345683',
        occupation: 'អ្នកជំនាញផលិតកម្ម',
        income: 2000000,
        childrenCount: 2
      },
      {
        firstName: 'រតនា',
        lastName: 'សុវណ្ណា',
        relation: 'mother',
        phone: '098765437',
        occupation: 'គិលានុបដ្ឋាយិកា',
        income: 1200000,
        childrenCount: 2
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '5 ឆ្នាំ',
      organizationHelp: 'អង្គការរតនា',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហាររតនា',
      helpAmount: 350000,
      helpFrequency: 'រៀងរាល់ខែ'
    },
    scholarships: [
      {
        type: 'អាហារូបករណ៍សិក្សា',
        amount: 450000,
        sponsor: 'អង្គការរតនា'
      }
    ]
  },
  {
    lastName: 'សុវណ្ណា',
    firstName: 'វណ្ណា',
    gender: 'female',
    dob: new Date('2011-09-30'),
    class: '6',
    phone: '012345684',
    emergencyContact: '098765438',
    previousSchool: 'សាលាបឋមសិក្សាសុវណ្ណា',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    guardians: [
      {
        firstName: 'វណ្ណា',
        lastName: 'សុវណ្ណា',
        relation: 'father',
        phone: '012345684',
        occupation: 'អ្នកជំនាញផ្នែកពាណិជ្ជកម្ម',
        income: 1600000,
        childrenCount: 1
      },
      {
        firstName: 'សុវណ្ណា',
        lastName: 'វណ្ណា',
        relation: 'mother',
        phone: '098765438',
        occupation: 'គ្រូ',
        income: 900000,
        childrenCount: 1
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '8 ឆ្នាំ',
      organizationHelp: 'អង្គការសុវណ្ណា',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារសុវណ្ណា',
      helpAmount: 400000,
      helpFrequency: 'រៀងរាល់ខែ'
    },
    scholarships: [
      {
        type: 'អាហារូបករណ៍សិក្សា',
        amount: 500000,
        sponsor: 'អង្គការសុវណ្ណា'
      }
    ]
  },
  {
    lastName: 'វណ្ណា',
    firstName: 'រតនា',
    gender: 'male',
    dob: new Date('2009-11-08'),
    class: '8',
    phone: '012345685',
    emergencyContact: '098765439',
    previousSchool: 'សាលាបឋមសិក្សាវណ្ណា',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    guardians: [
      {
        firstName: 'រតនា',
        lastName: 'វណ្ណា',
        relation: 'father',
        phone: '012345685',
        occupation: 'អ្នកជំនាញផ្នែកវិទ្យាសាស្ត្រ',
        income: 2200000,
        childrenCount: 2
      },
      {
        firstName: 'វណ្ណា',
        lastName: 'រតនា',
        relation: 'mother',
        phone: '098765439',
        occupation: 'គិលានុបដ្ឋាយិកា',
        income: 1500000,
        childrenCount: 2
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '9 ឆ្នាំ',
      organizationHelp: 'អង្គការវណ្ណា',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារវណ្ណា',
      helpAmount: 500000,
      helpFrequency: 'រៀងរាល់ខែ'
    },
    scholarships: [
      {
        type: 'អាហារូបករណ៍សិក្សា',
        amount: 600000,
        sponsor: 'អង្គការវណ្ណា'
      }
    ]
  },
  {
    lastName: 'រតនា',
    firstName: 'សុវណ្ណា',
    gender: 'female',
    dob: new Date('2010-04-15'),
    class: '7',
    phone: '012345686',
    emergencyContact: '098765440',
    previousSchool: 'សាលាបឋមសិក្សារតនា',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    guardians: [
      {
        firstName: 'សុវណ្ណា',
        lastName: 'រតនា',
        relation: 'father',
        phone: '012345686',
        occupation: 'អ្នកជំនាញផ្នែកវិទ្យាសាស្ត្រ',
        income: 1800000,
        childrenCount: 3
      },
      {
        firstName: 'រតនា',
        lastName: 'សុវណ្ណា',
        relation: 'mother',
        phone: '098765440',
        occupation: 'គ្រូ',
        income: 1100000,
        childrenCount: 3
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '7 ឆ្នាំ',
      organizationHelp: 'អង្គការរតនា',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហាររតនា',
      helpAmount: 300000,
      helpFrequency: 'រៀងរាល់ខែ'
    },
    scholarships: [
      {
        type: 'អាហារូបករណ៍សិក្សា',
        amount: 400000,
        sponsor: 'អង្គការរតនា'
      }
    ]
  },
  {
    lastName: 'សុវណ្ណា',
    firstName: 'វណ្ណា',
    gender: 'male',
    dob: new Date('2011-01-22'),
    class: '6',
    phone: '012345687',
    emergencyContact: '098765441',
    previousSchool: 'សាលាបឋមសិក្សាសុវណ្ណា',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    guardians: [
      {
        firstName: 'វណ្ណា',
        lastName: 'សុវណ្ណា',
        relation: 'father',
        phone: '012345687',
        occupation: 'អ្នកជំនាញផ្នែកវិទ្យាសាស្ត្រ',
        income: 1400000,
        childrenCount: 2
      },
      {
        firstName: 'សុវណ្ណា',
        lastName: 'វណ្ណា',
        relation: 'mother',
        phone: '098765441',
        occupation: 'គិលានុបដ្ឋាយិកា',
        income: 1000000,
        childrenCount: 2
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '6 ឆ្នាំ',
      organizationHelp: 'អង្គការសុវណ្ណា',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារសុវណ្ណា',
      helpAmount: 200000,
      helpFrequency: 'រៀងរាល់ខែ'
    },
    scholarships: [
      {
        type: 'អាហារូបករណ៍សិក្សា',
        amount: 250000,
        sponsor: 'អង្គការសុវណ្ណា'
      }
    ]
  }
];

async function addMultipleStudents() {
  try {
    console.log('Adding 9 more students...');

    for (let i = 0; i < studentsData.length; i++) {
      const studentData = studentsData[i];
      
      const student = await prisma.student.create({
        data: {
          lastName: studentData.lastName,
          firstName: studentData.firstName,
          gender: studentData.gender,
          dob: studentData.dob,
          class: studentData.class,
          registerToStudy: true,
          studentHouseNumber: '123',
          studentVillage: 'ភូមិសុខា',
          studentDistrict: 'ស្រុកសុខា',
          studentProvince: 'ខេត្តសុខា',
          studentBirthDistrict: 'ស្រុកសុខា',
          phone: studentData.phone,
          religion: 'គ្រិស្តសាសនា',
          health: 'ល្អ',
          emergencyContact: studentData.emergencyContact,
          vaccinated: true,
          previousSchool: studentData.previousSchool,
          transferReason: studentData.transferReason,
          needsClothes: true,
          needsMaterials: true,
          needsTransport: false,
          registrationDate: new Date(),
          status: 'active',
          schoolYear: '2024-2025',
          
          // Create guardians
          guardians: {
            create: studentData.guardians.map(guardian => ({
              ...guardian,
              believeJesus: true,
              houseNumber: '123',
              village: 'ភូមិសុខា',
              district: 'ស្រុកសុខា',
              province: 'ខេត្តសុខា',
              birthDistrict: 'ស្រុកសុខា',
              church: 'ព្រះវិហារសុខា'
            }))
          },
          
          // Create family info
          family: {
            create: studentData.family
          },
          
          // Create scholarships
          scholarships: {
            create: studentData.scholarships
          }
        },
        include: {
          guardians: true,
          family: true,
          scholarships: true
        }
      });

      console.log(`✅ Student ${i + 1} created: ${student.lastName} ${student.firstName} (ID: ${student.studentId})`);
    }

    console.log('🎉 All 9 students created successfully!');

  } catch (error) {
    console.error('❌ Error creating students:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMultipleStudents();
