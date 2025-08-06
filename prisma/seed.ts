import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password', 10)

  // Create users
  const users = [
    {
      username: "នាយកសាលា",
      password: hashedPassword,
      firstname: "នាយក",
      lastname: "សាលា",
      role: "admin",
      position: "នាយកសាលា",
      avatar: "NS",
      phonenumber1: "012345678",
      status: "active"
    },
    {
      username: "ហាក់ម៉េងហុង",
      password: hashedPassword,
      firstname: "ហាក់",
      lastname: "ម៉េងហុង",
      role: "teacher",
      position: "គ្រូបន្ទុកថ្នាក់ទី ១",
      avatar: "HM",
      phonenumber1: "012345679",
      status: "active"
    },
    {
      username: "ហេងសុនី",
      password: hashedPassword,
      firstname: "ហេង",
      lastname: "សុនី",
      role: "teacher",
      position: "គ្រូបន្ទុកថ្នាក់ទី ២",
      avatar: "HS",
      phonenumber1: "012345680",
      status: "active"
    },
    {
      username: "ស្រួយស៊ីណាត",
      password: hashedPassword,
      firstname: "ស្រួយ",
      lastname: "ស៊ីណាត",
      role: "teacher",
      position: "គ្រូបន្ទុកថ្នាក់ទី ៣",
      avatar: "SS",
      phonenumber1: "012345681",
      status: "active"
    },
    {
      username: "វ៉ាន់សុផល",
      password: hashedPassword,
      firstname: "វ៉ាន់",
      lastname: "សុផល",
      role: "teacher",
      position: "គ្រូបន្ទុកថ្នាក់ទី ៤",
      avatar: "VS",
      phonenumber1: "012345682",
      status: "active"
    },
    {
      username: "គឹមសុខា",
      password: hashedPassword,
      firstname: "គឹម",
      lastname: "សុខា",
      role: "teacher",
      position: "គ្រូបន្ទុកថ្នាក់ទី ៥",
      avatar: "KS",
      phonenumber1: "012345683",
      status: "active"
    },
    {
      username: "ម៉ៅសុធារី",
      password: hashedPassword,
      firstname: "ម៉ៅ",
      lastname: "សុធារី",
      role: "teacher",
      position: "គ្រូបន្ទុកថ្នាក់ទី ៦",
      avatar: "MS",
      phonenumber1: "012345684",
      status: "active"
    }
  ]

  console.log('👥 Creating users...')
  
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: userData,
    })
    console.log(`✅ Created user: ${user.firstname} ${user.lastname} (${user.role})`)
  }

  console.log('🎉 Database seeding completed!')

  console.log('👨‍🎓 Creating students...')
  
  const students = [
    {
      lastName: 'សុខ', firstName: 'ម៉ាលី', gender: 'female', dob: new Date('2010-05-15'), class: '៧ក', registrationDate: new Date(), status: 'active',
    },
    {
      lastName: 'យន្ត', firstName: 'សុខ', gender: 'male', dob: new Date('2010-06-20'), class: '៧ខ', registrationDate: new Date(), status: 'active',
    },
    {
      lastName: 'វណ្ណា', firstName: 'ស្រី', gender: 'female', dob: new Date('2011-03-22'), class: '៦ខ', registrationDate: new Date(), status: 'active',
    },
    {
      lastName: 'រស់', firstName: 'សំណាង', gender: 'male', dob: new Date('2011-01-05'), class: '៦ក', registrationDate: new Date(), status: 'active',
    },
    {
      lastName: 'វណ្ដណា', firstName: 'ស្រី', gender: 'female', dob: new Date('2011-04-10'), class: '៦ខ', registrationDate: new Date(), status: 'active',
    },
    {
      lastName: 'សុភា', firstName: 'សុវណ្ណ', gender: 'male', dob: new Date('2010-09-12'), class: '៧ក', registrationDate: new Date(), status: 'active',
    },
    {
      lastName: 'ស្រីពៅ', firstName: 'សុផានិត', gender: 'female', dob: new Date('2011-07-18'), class: '៦ក', registrationDate: new Date(), status: 'active',
    },
    {
      lastName: 'សុខ', firstName: 'សុវណ្ណ', gender: 'male', dob: new Date('2010-11-25'), class: '៧ខ', registrationDate: new Date(), status: 'active',
    },
    {
      lastName: 'ស្រី', firstName: 'សុផានិត', gender: 'female', dob: new Date('2011-02-14'), class: '៦ខ', registrationDate: new Date(), status: 'active',
    },
    {
      lastName: 'សុវណ្ណ', firstName: 'សុភា', gender: 'male', dob: new Date('2010-08-30'), class: '៧ក', registrationDate: new Date(), status: 'active',
    },
  ];

  for (const studentData of students) {
    const student = await prisma.student.create({
      data: studentData,
    });
    console.log(`✅ Created student: ${student.firstName} ${student.lastName} (${student.class})`);
  }

  console.log('🎉 Database seeding completed!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect()); 