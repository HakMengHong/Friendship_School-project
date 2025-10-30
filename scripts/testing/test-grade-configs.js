const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Grade level configurations
const GRADE_CONFIGS = {
  // Grade 5 - 10 point scale
  5: {
    maxScore: 10,
    subjects: [
      'វិទ្យាសាស្ត្រ',
      'កុំព្យូទ័រ',
      'អប់រំភាយ',
      'ហត្ថកម្ម',
      'អង់គ្លេស',
      'ចំរៀង-របាំ',
      'គំនូរ',
      'សីលធម៌-ពលរដ្ឋវិទ្យា',
      'វិទ្យាសាស្ត្រនិងសិក្សាសង្គម',
      'ធរណីមាត្រ',
      'មាត្រាប្រពន្ធ័',
      'នព្វន្ត',
      'អក្សរផ្ចង់',
      'សំណេរ',
      'វេយ្យាករណ៏',
      'រឿងនិទាន',
      'មេសូត្រ',
      'សរសេរតាមអាន',
      'រៀនអាន'
    ]
  },
  // Grade 7 - 100 point scale with different max scores per subject
  7: {
    maxScore: 100,
    subjects: [
      { name: 'គណិតវិទ្យា', maxScore: 100 },
      { name: 'អង់គ្លេស', maxScore: 50 },
      { name: 'កុំព្យូទ័រ', maxScore: 50 },
      { name: 'សីលធម៌-ពលរដ្ឋវិទ្យា', maxScore: 50 },
      { name: 'រូបវិទ្យា', maxScore: 50 },
      { name: 'គីមីវិទ្យា', maxScore: 50 },
      { name: 'ជីវវិទ្យា', maxScore: 50 },
      { name: 'ផែនដីវិទ្យា', maxScore: 50 },
      { name: 'ភាសាខ្មែរ', maxScore: 100 },
      { name: 'ប្រវត្តិវិទ្យា', maxScore: 50 },
      { name: 'គេហកិច្ច', maxScore: 50 },
      { name: 'ភូមិវិទ្យា', maxScore: 50 }
    ]
  },
  // Grade 9 - 100 point scale with different max scores per subject
  9: {
    maxScore: 100,
    subjects: [
      { name: 'តែងសេចក្តី', maxScore: 60 },
      { name: 'សរសេរតាមអាន', maxScore: 40 },
      { name: 'គណិតវិទ្យា', maxScore: 100 },
      { name: 'រូបវិទ្យា', maxScore: 35 },
      { name: 'គីមីវិទ្យា', maxScore: 25 },
      { name: 'ជីវវិទ្យា', maxScore: 35 },
      { name: 'ផែនដីវិទ្យា', maxScore: 25 },
      { name: 'សីលធម៌-ពលរដ្ឋវិជ្ជា', maxScore: 35 },
      { name: 'ភូមិវិទ្យា', maxScore: 32 },
      { name: 'ប្រវត្តិវិទ្យា', maxScore: 33 },
      { name: 'អង់គ្លេស', maxScore: 50 }
    ]
  }
}

function displayGradeConfigs() {
  console.log('📊 Grade Level Configurations')
  console.log('=' .repeat(50))
  
  for (const [gradeLevel, config] of Object.entries(GRADE_CONFIGS)) {
    console.log(`\n🎓 Grade ${gradeLevel}`)
    console.log(`   Max Score: ${config.maxScore}`)
    console.log(`   Subjects: ${config.subjects.length}`)
    console.log('   Subject List:')
    
    config.subjects.forEach((subject, index) => {
      if (typeof subject === 'string') {
        console.log(`     ${index + 1}. ${subject} (${config.maxScore})`)
      } else {
        console.log(`     ${index + 1}. ${subject.name} (${subject.maxScore})`)
      }
    })
  }
}

function calculateTotalGrades() {
  console.log('\n📈 Grade Calculation Summary')
  console.log('=' .repeat(50))
  
  const monthsPerSemester = {
    'Semester 1': 4, // Nov, Dec, Jan, Feb
    'Semester 2': 5  // Mar, Apr, May, Jun, Jul
  }
  
  for (const [gradeLevel, config] of Object.entries(GRADE_CONFIGS)) {
    const totalSubjects = config.subjects.length
    const totalMonths = monthsPerSemester['Semester 1'] + monthsPerSemester['Semester 2']
    const totalGradesPerStudent = totalSubjects * totalMonths
    
    console.log(`\n🎓 Grade ${gradeLevel}:`)
    console.log(`   Subjects: ${totalSubjects}`)
    console.log(`   Months: ${totalMonths} (4 + 5)`)
    console.log(`   Grades per student: ${totalGradesPerStudent}`)
    
    // Calculate total points possible
    let totalPointsPossible = 0
    config.subjects.forEach(subject => {
      const maxScore = typeof subject === 'string' ? config.maxScore : subject.maxScore
      totalPointsPossible += maxScore * totalMonths
    })
    
    console.log(`   Total points possible: ${totalPointsPossible}`)
  }
}

async function testDatabaseConnection() {
  console.log('\n🔌 Testing Database Connection')
  console.log('=' .repeat(50))
  
  try {
    // Test basic connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
    
    // Check existing data
    const studentCount = await prisma.student.count()
    const subjectCount = await prisma.subject.count()
    const courseCount = await prisma.course.count()
    const semesterCount = await prisma.semester.count()
    const schoolYearCount = await prisma.schoolYear.count()
    const gradeCount = await prisma.grade.count()
    
    console.log(`📊 Current database state:`)
    console.log(`   Students: ${studentCount}`)
    console.log(`   Subjects: ${subjectCount}`)
    console.log(`   Courses: ${courseCount}`)
    console.log(`   Semesters: ${semesterCount}`)
    console.log(`   School Years: ${schoolYearCount}`)
    console.log(`   Grades: ${gradeCount}`)
    
    // Check if we have the required subjects
    const requiredSubjects = new Set()
    Object.values(GRADE_CONFIGS).forEach(config => {
      config.subjects.forEach(subject => {
        const subjectName = typeof subject === 'string' ? subject : subject.name
        requiredSubjects.add(subjectName)
      })
    })
    
    const existingSubjects = await prisma.subject.findMany({
      select: { subjectName: true }
    })
    
    const existingSubjectNames = new Set(existingSubjects.map(s => s.subjectName))
    const missingSubjects = [...requiredSubjects].filter(name => !existingSubjectNames.has(name))
    
    if (missingSubjects.length > 0) {
      console.log(`\n⚠️ Missing subjects (${missingSubjects.length}):`)
      missingSubjects.forEach(subject => console.log(`   - ${subject}`))
    } else {
      console.log(`\n✅ All required subjects are present`)
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  }
}

async function main() {
  console.log('🧪 Grade Configuration Test Script')
  console.log('=' .repeat(50))
  
  // Display configurations
  displayGradeConfigs()
  
  // Calculate totals
  calculateTotalGrades()
  
  // Test database
  await testDatabaseConnection()
  
  console.log('\n🎉 Test completed!')
  console.log('\n📋 Next steps:')
  console.log('1. Run "node scripts/add-grades-simple.js" to add grades')
  console.log('2. Or run "node scripts/add-grades-existing-data.js" for full setup')
  console.log('3. Check the grade management page to see the results')
}

// Run the test
if (require.main === module) {
  main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
}

module.exports = {
  displayGradeConfigs,
  calculateTotalGrades,
  testDatabaseConnection,
  GRADE_CONFIGS
}
