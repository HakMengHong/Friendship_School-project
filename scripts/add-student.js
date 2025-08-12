const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const studentsData = [
  // 2023-2024 School Year (7 students)
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
    schoolYear: '2023-2024',
    guardians: [
      {
        firstName: 'សុខ',
        lastName: 'វណ្ណា',
        relation: 'father',
        phone: '012345679',
        occupation: 'អាជីវករ',
        income: 600000,
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
    }
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
    schoolYear: '2023-2024',
    guardians: [
      {
        firstName: 'វណ្ណា',
        lastName: 'រតនា',
        relation: 'father',
        phone: '012345680',
        occupation: 'វិស្វករ',
        income: 1200000,
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
    }
  },
  {
    lastName: 'សុវណ្ណា',
    firstName: 'វណ្ណា',
    gender: 'female',
    dob: new Date('2009-12-05'),
    class: '8',
    phone: '012345681',
    emergencyContact: '098765435',
    previousSchool: 'សាលាបឋមសិក្សាសុវណ្ណា',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2023-2024',
    guardians: [
      {
        firstName: 'វណ្ណា',
        lastName: 'សុវណ្ណា',
        relation: 'father',
        phone: '012345681',
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
      durationInKPC: '5 ឆ្នាំ',
      organizationHelp: 'អង្គការសុវណ្ណា',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារសុវណ្ណា',
      helpAmount: 200000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  },
  {
    lastName: 'មុនីរ័ត្ន',
    firstName: 'សុខ',
    gender: 'male',
    dob: new Date('2012-06-15'),
    class: '5',
    phone: '012345682',
    emergencyContact: '098765436',
    previousSchool: 'សាលាបឋមសិក្សាមុនីរ័ត្ន',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2023-2024',
    guardians: [
      {
        firstName: 'សុខ',
        lastName: 'មុនីរ័ត្ន',
        relation: 'father',
        phone: '012345682',
        occupation: 'វេជ្ជបណ្ឌិត',
        income: 1500000,
        childrenCount: 2
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '4 ឆ្នាំ',
      organizationHelp: 'អង្គការមុនីរ័ត្ន',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារមុនីរ័ត្ន',
      helpAmount: 250000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  },
  {
    lastName: 'ពិភិត្រ',
    firstName: 'វណ្ណា',
    gender: 'male',
    dob: new Date('2011-09-22'),
    class: '6',
    phone: '012345683',
    emergencyContact: '098765437',
    previousSchool: 'សាលាបឋមសិក្សាពិភិត្រ',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2023-2024',
    guardians: [
      {
        firstName: 'វណ្ណា',
        lastName: 'ពិភិត្រ',
        relation: 'father',
        phone: '012345683',
        occupation: 'អ្នកវិញ្ញាបនបត្រ',
        income: 1000000,
        childrenCount: 1
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '6 ឆ្នាំ',
      organizationHelp: 'អង្គការពិភិត្រ',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារពិភិត្រ',
      helpAmount: 180000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  },
  {
    lastName: 'សុភាព',
    firstName: 'វណ្ណា',
    gender: 'female',
    dob: new Date('2010-04-18'),
    class: '7',
    phone: '012345684',
    emergencyContact: '098765438',
    previousSchool: 'សាលាបឋមសិក្សាសុភាព',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2023-2024',
    guardians: [
      {
        firstName: 'វណ្ណា',
        lastName: 'សុភាព',
        relation: 'father',
        phone: '012345684',
        occupation: 'គ្រូ',
        income: 900000,
        childrenCount: 2
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '8 ឆ្នាំ',
      organizationHelp: 'អង្គការសុភាព',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារសុភាព',
      helpAmount: 220000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  },
  {
    lastName: 'វិជ័យ',
    firstName: 'សុខ',
    gender: 'male',
    dob: new Date('2012-11-30'),
    class: '5',
    phone: '012345685',
    emergencyContact: '098765439',
    previousSchool: 'សាលាបឋមសិក្សាវិជ័យ',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2023-2024',
    guardians: [
      {
        firstName: 'សុខ',
        lastName: 'វិជ័យ',
        relation: 'father',
        phone: '012345685',
        occupation: 'អាជីវករ',
        income: 800000,
        childrenCount: 3
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '2 ឆ្នាំ',
      organizationHelp: 'អង្គការវិជ័យ',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារវិជ័យ',
      helpAmount: 160000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  },

  // 2024-2025 School Year (7 students)
  {
    lastName: 'អានន្ត',
    firstName: 'វណ្ណា',
    gender: 'male',
    dob: new Date('2013-01-10'),
    class: '4',
    phone: '012345686',
    emergencyContact: '098765440',
    previousSchool: 'សាលាបឋមសិក្សាអានន្ត',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2024-2025',
    guardians: [
      {
        firstName: 'វណ្ណា',
        lastName: 'អានន្ត',
        relation: 'father',
        phone: '012345686',
        occupation: 'វិស្វករ',
        income: 1100000,
        childrenCount: 2
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '5 ឆ្នាំ',
      organizationHelp: 'អង្គការអានន្ត',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារអានន្ត',
      helpAmount: 190000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  },
  {
    lastName: 'ពិសិដ្ឋ',
    firstName: 'សុខ',
    gender: 'female',
    dob: new Date('2012-07-25'),
    class: '5',
    phone: '012345687',
    emergencyContact: '098765441',
    previousSchool: 'សាលាបឋមសិក្សាពិសិដ្ឋ',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2024-2025',
    guardians: [
      {
        firstName: 'សុខ',
        lastName: 'ពិសិដ្ឋ',
        relation: 'father',
        phone: '012345687',
        occupation: 'គ្រូ',
        income: 950000,
        childrenCount: 1
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '7 ឆ្នាំ',
      organizationHelp: 'អង្គការពិសិដ្ឋ',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារពិសិដ្ឋ',
      helpAmount: 210000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  },
  {
    lastName: 'វិរុណ',
    firstName: 'វណ្ណា',
    gender: 'male',
    dob: new Date('2011-12-08'),
    class: '6',
    phone: '012345688',
    emergencyContact: '098765442',
    previousSchool: 'សាលាបឋមសិក្សាវិរុណ',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2024-2025',
    guardians: [
      {
        firstName: 'វណ្ណា',
        lastName: 'វិរុណ',
        relation: 'father',
        phone: '012345688',
        occupation: 'អ្នកវិញ្ញាបនបត្រ',
        income: 1200000,
        childrenCount: 2
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '4 ឆ្នាំ',
      organizationHelp: 'អង្គការវិរុណ',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារវិរុណ',
      helpAmount: 280000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  },
  {
    lastName: 'សុជាត',
    firstName: 'សុខ',
    gender: 'female',
    dob: new Date('2010-05-14'),
    class: '7',
    phone: '012345689',
    emergencyContact: '098765443',
    previousSchool: 'សាលាបឋមសិក្សាសុជាត',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2024-2025',
    guardians: [
      {
        firstName: 'សុខ',
        lastName: 'សុជាត',
        relation: 'father',
        phone: '012345689',
        occupation: 'វេជ្ជបណ្ឌិត',
        income: 1400000,
        childrenCount: 3
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '6 ឆ្នាំ',
      organizationHelp: 'អង្គការសុជាត',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារសុជាត',
      helpAmount: 320000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  },
  {
    lastName: 'អរុណ',
    firstName: 'វណ្ណា',
    gender: 'male',
    dob: new Date('2012-03-19'),
    class: '5',
    phone: '012345690',
    emergencyContact: '098765444',
    previousSchool: 'សាលាបឋមសិក្សាអរុណ',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2024-2025',
    guardians: [
      {
        firstName: 'វណ្ណា',
        lastName: 'អរុណ',
        relation: 'father',
        phone: '012345690',
        occupation: 'អាជីវករ',
        income: 900000,
        childrenCount: 2
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '3 ឆ្នាំ',
      organizationHelp: 'អង្គការអរុណ',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារអរុណ',
      helpAmount: 170000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  },
  {
    lastName: 'ពិភិត្រ',
    firstName: 'សុខ',
    gender: 'female',
    dob: new Date('2011-08-30'),
    class: '6',
    phone: '012345691',
    emergencyContact: '098765445',
    previousSchool: 'សាលាបឋមសិក្សាពិភិត្រ',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2024-2025',
    guardians: [
      {
        firstName: 'សុខ',
        lastName: 'ពិភិត្រ',
        relation: 'father',
        phone: '012345691',
        occupation: 'គ្រូ',
        income: 1000000,
        childrenCount: 1
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '5 ឆ្នាំ',
      organizationHelp: 'អង្គការពិភិត្រ',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារពិភិត្រ',
      helpAmount: 240000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  },
  {
    lastName: 'វិមល',
    firstName: 'វណ្ណា',
    gender: 'male',
    dob: new Date('2010-11-12'),
    class: '7',
    phone: '012345692',
    emergencyContact: '098765446',
    previousSchool: 'សាលាបឋមសិក្សាវិមល',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2024-2025',
    guardians: [
      {
        firstName: 'វណ្ណា',
        lastName: 'វិមល',
        relation: 'father',
        phone: '012345692',
        occupation: 'វិស្វករ',
        income: 1300000,
        childrenCount: 2
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '8 ឆ្នាំ',
      organizationHelp: 'អង្គការវិមល',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារវិមល',
      helpAmount: 290000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  },

  // 2025-2026 School Year (6 students)
  {
    lastName: 'សុវណ្ណ',
    firstName: 'វណ្ណា',
    gender: 'female',
    dob: new Date('2014-02-28'),
    class: '3',
    phone: '012345693',
    emergencyContact: '098765447',
    previousSchool: 'សាលាបឋមសិក្សាសុវណ្ណ',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2025-2026',
    guardians: [
      {
        firstName: 'វណ្ណា',
        lastName: 'សុវណ្ណ',
        relation: 'father',
        phone: '012345693',
        occupation: 'គ្រូ',
        income: 850000,
        childrenCount: 2
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '4 ឆ្នាំ',
      organizationHelp: 'អង្គការសុវណ្ណ',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារសុវណ្ណ',
      helpAmount: 200000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  },
  {
    lastName: 'វិជ័យ',
    firstName: 'សុខ',
    gender: 'male',
    dob: new Date('2013-06-15'),
    class: '4',
    phone: '012345694',
    emergencyContact: '098765448',
    previousSchool: 'សាលាបឋមសិក្សាវិជ័យ',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2025-2026',
    guardians: [
      {
        firstName: 'សុខ',
        lastName: 'វិជ័យ',
        relation: 'father',
        phone: '012345694',
        occupation: 'អាជីវករ',
        income: 950000,
        childrenCount: 3
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '6 ឆ្នាំ',
      organizationHelp: 'អង្គការវិជ័យ',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារវិជ័យ',
      helpAmount: 180000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  },
  {
    lastName: 'អានន្ត',
    firstName: 'វណ្ណា',
    gender: 'female',
    dob: new Date('2012-09-20'),
    class: '5',
    phone: '012345695',
    emergencyContact: '098765449',
    previousSchool: 'សាលាបឋមសិក្សាអានន្ត',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2025-2026',
    guardians: [
      {
        firstName: 'វណ្ណា',
        lastName: 'អានន្ត',
        relation: 'father',
        phone: '012345695',
        occupation: 'វិស្វករ',
        income: 1100000,
        childrenCount: 1
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '7 ឆ្នាំ',
      organizationHelp: 'អង្គការអានន្ត',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារអានន្ត',
      helpAmount: 260000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  },
  {
    lastName: 'ពិសិដ្ឋ',
    firstName: 'សុខ',
    gender: 'male',
    dob: new Date('2011-12-03'),
    class: '6',
    phone: '012345696',
    emergencyContact: '098765450',
    previousSchool: 'សាលាបឋមសិក្សាពិសិដ្ឋ',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2025-2026',
    guardians: [
      {
        firstName: 'សុខ',
        lastName: 'ពិសិដ្ឋ',
        relation: 'father',
        phone: '012345696',
        occupation: 'គ្រូ',
        income: 900000,
        childrenCount: 2
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '5 ឆ្នាំ',
      organizationHelp: 'អង្គការពិសិដ្ឋ',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារពិសិដ្ឋ',
      helpAmount: 230000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  },
  {
    lastName: 'វិរុណ',
    firstName: 'វណ្ណា',
    gender: 'female',
    dob: new Date('2010-07-17'),
    class: '7',
    phone: '012345697',
    emergencyContact: '098765451',
    previousSchool: 'សាលាបឋមសិក្សាវិរុណ',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2025-2026',
    guardians: [
      {
        firstName: 'វណ្ណា',
        lastName: 'វិរុណ',
        relation: 'father',
        phone: '012345697',
        occupation: 'អ្នកវិញ្ញាបនបត្រ',
        income: 1200000,
        childrenCount: 3
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '9 ឆ្នាំ',
      organizationHelp: 'អង្គការវិរុណ',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារវិរុណ',
      helpAmount: 310000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  },
  {
    lastName: 'សុជាត',
    firstName: 'សុខ',
    gender: 'male',
    dob: new Date('2012-04-25'),
    class: '5',
    phone: '012345698',
    emergencyContact: '098765452',
    previousSchool: 'សាលាបឋមសិក្សាសុជាត',
    transferReason: 'ផ្លាស់ទីលំនៅ',
    schoolYear: '2025-2026',
    guardians: [
      {
        firstName: 'សុខ',
        lastName: 'សុជាត',
        relation: 'father',
        phone: '012345698',
        occupation: 'វេជ្ជបណ្ឌិត',
        income: 1400000,
        childrenCount: 2
      }
    ],
    family: {
      livingWith: 'ឪពុកម្តាយ',
      livingCondition: 'ល្អ',
      ownHouse: true,
      canHelpSchool: true,
      durationInKPC: '6 ឆ្នាំ',
      organizationHelp: 'អង្គការសុជាត',
      knowSchool: 'តាមអាណាព្យាបាល',
      religion: 'គ្រិស្តសាសនា',
      churchName: 'ព្រះវិហារសុជាត',
      helpAmount: 270000,
      helpFrequency: 'រៀងរាល់ខែ'
    }
  }
];

async function addMultipleStudents() {
  try {
    console.log('🌱 Starting to add 20 students...\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < studentsData.length; i++) {
      const studentData = studentsData[i];
      
      try {
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
            schoolYear: studentData.schoolYear,
            
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
            }
          },
          include: {
            guardians: true,
            family: true
          }
        });

        console.log(`✅ Student ${i + 1} created: ${student.lastName} ${student.firstName} (ID: ${student.studentId}) - ${studentData.schoolYear}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error creating student ${i + 1} (${studentData.lastName} ${studentData.firstName}):`, error.message);
        errorCount++;
      }
    }

    console.log('\n🎉 Student creation completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Successfully created: ${successCount} students`);
    console.log(`   - Errors: ${errorCount} students`);
    console.log(`   - Total processed: ${studentsData.length} students`);

    // Display summary by school year
    const schoolYearCounts = {};
    studentsData.forEach(student => {
      const year = student.schoolYear;
      schoolYearCounts[year] = (schoolYearCounts[year] || 0) + 1;
    });

    console.log('\n📅 Students by School Year:');
    Object.entries(schoolYearCounts).forEach(([year, count]) => {
      console.log(`   - ${year}: ${count} students`);
    });

  } catch (error) {
    console.error('❌ Error in addMultipleStudents function:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMultipleStudents();
