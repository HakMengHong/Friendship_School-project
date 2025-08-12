import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create school years
  console.log('📅 Creating school years...')
  const schoolYear2024 = await prisma.schoolYear.create({
    data: {
      schoolYearCode: '2024-2025',
    },
  })
  console.log(`   Created school year: ${schoolYear2024.schoolYearCode}`)

  const schoolYear2025 = await prisma.schoolYear.create({
    data: {
      schoolYearCode: '2025-2026',
    },
  })
  console.log(`   Created school year: ${schoolYear2025.schoolYearCode}`)

  // Create subjects
  console.log('📚 Creating subjects...')
  const subjects = [
    'Mathematics',
    'English',
    'Science',
    'History',
    'Geography',
    'Art',
    'Physical Education',
    'Computer Science',
    'Literature',
    'Social Studies'
  ]

  for (const subjectName of subjects) {
    const subject = await prisma.subject.create({
      data: {
        subjectName,
      },
    })
    console.log(`   Created subject: ${subject.subjectName}`)
  }

  // Create semesters
  console.log('📅 Creating semesters...')
  const semesters = [
    { semester: 'First Semester', semesterCode: 'SEM1-2024' },
    { semester: 'Second Semester', semesterCode: 'SEM2-2024' },
    { semester: 'Summer Semester', semesterCode: 'SUMMER-2024' }
  ]

  for (const semesterData of semesters) {
    const semester = await prisma.semester.create({
      data: semesterData,
    })
    console.log(`   Created semester: ${semester.semester}`)
  }

  // Create a test user (admin)
  console.log('👤 Creating test user...')
  const testUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: '$2a$10$example.hash.for.testing', // This should be properly hashed in production
      lastname: 'Administrator',
      firstname: 'System',
      role: 'admin',
      status: 'active',
    },
  })
  console.log(`   Created user: ${testUser.username} (${testUser.role})`)

  // Create a test course
  console.log('🏫 Creating test course...')
  const testCourse = await prisma.course.create({
    data: {
      courseName: 'Grade 10A',
      grade: '10',
      section: 'A',
      schoolYearId: schoolYear2024.schoolYearId,
      teacherId1: testUser.userId,
    },
  })
  console.log(`   Created course: ${testCourse.courseName}`)

  console.log('✅ Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
