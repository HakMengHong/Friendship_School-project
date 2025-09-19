const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Grade level configurations for reference
const GRADE_CONFIGS = {
  5: {
    maxScore: 10,
    subjects: [
      'វិទ្យាសាស្ត្រ', 'កុំព្យូទ័រ', 'អប់រំភាយ', 'ហត្ថកម្ម', 'អង់គ្លេស',
      'ចំរៀង-របាំ', 'គំនូរ', 'សីលធម៌-ពលរដ្ឋវិទ្យា', 'វិទ្យាសាស្ត្រនិងសិក្សាសង្គម',
      'ធរណីមាត្រ', 'មាត្រាប្រពន្ធ័', 'នព្វន្ត', 'អក្សរផ្ចង់', 'សំណេរ',
      'វេយ្យាករណ៏', 'រឿងនិទាន', 'មេសូត្រ', 'សរសេរតាមអាន', 'រៀនអាន'
    ]
  },
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

async function checkDatabaseConnection() {
  console.log('🔌 Checking database connection...')
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

async function checkUsers() {
  console.log('\n👥 Checking users...')
  try {
    const users = await prisma.user.findMany({
      select: {
        userId: true,
        username: true,
        firstname: true,
        lastname: true,
        role: true,
        status: true
      }
    })
    
    console.log(`📊 Total users: ${users.length}`)
    
    const teachers = users.filter(u => u.role === 'teacher' && u.status === 'active')
    const admins = users.filter(u => u.role === 'admin' && u.status === 'active')
    
    console.log(`👨‍🏫 Active teachers: ${teachers.length}`)
    console.log(`👨‍💼 Active admins: ${admins.length}`)
    
    if (teachers.length === 0) {
      console.log('⚠️ WARNING: No active teachers found! Scripts need at least one teacher.')
      return false
    }
    
    if (teachers.length > 0) {
      console.log('✅ Teachers available:')
      teachers.forEach(teacher => {
        console.log(`   - ${teacher.firstname} ${teacher.lastname} (${teacher.username})`)
      })
    }
    
    return true
  } catch (error) {
    console.error('❌ Error checking users:', error.message)
    return false
  }
}

async function checkSchoolYears() {
  console.log('\n📚 Checking school years...')
  try {
    const schoolYears = await prisma.schoolYear.findMany({
      orderBy: { schoolYearId: 'desc' }
    })
    
    console.log(`📊 Total school years: ${schoolYears.length}`)
    
    if (schoolYears.length === 0) {
      console.log('⚠️ WARNING: No school years found!')
      return false
    }
    
    console.log('✅ School years available:')
    schoolYears.forEach(year => {
      console.log(`   - ${year.schoolYearCode} (ID: ${year.schoolYearId})`)
    })
    
    // Check for 2024-2025 specifically
    const targetYear = schoolYears.find(y => y.schoolYearCode.includes('2024-2025'))
    if (targetYear) {
      console.log(`✅ Target school year 2024-2025 found (ID: ${targetYear.schoolYearId})`)
    } else {
      console.log('⚠️ WARNING: School year 2024-2025 not found!')
    }
    
    return true
  } catch (error) {
    console.error('❌ Error checking school years:', error.message)
    return false
  }
}

async function checkSemesters() {
  console.log('\n📅 Checking semesters...')
  try {
    const semesters = await prisma.semester.findMany({
      orderBy: { semesterId: 'asc' }
    })
    
    console.log(`📊 Total semesters: ${semesters.length}`)
    
    if (semesters.length === 0) {
      console.log('⚠️ WARNING: No semesters found!')
      return false
    }
    
    console.log('✅ Semesters available:')
    semesters.forEach(semester => {
      console.log(`   - ${semester.semester} (${semester.semesterCode})`)
    })
    
    return true
  } catch (error) {
    console.error('❌ Error checking semesters:', error.message)
    return false
  }
}

async function checkSubjects() {
  console.log('\n📖 Checking subjects...')
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { subjectName: 'asc' }
    })
    
    console.log(`📊 Total subjects: ${subjects.length}`)
    
    if (subjects.length === 0) {
      console.log('⚠️ WARNING: No subjects found!')
      return false
    }
    
    // Check for required subjects
    const requiredSubjects = new Set()
    Object.values(GRADE_CONFIGS).forEach(config => {
      config.subjects.forEach(subject => {
        const subjectName = typeof subject === 'string' ? subject : subject.name
        requiredSubjects.add(subjectName)
      })
    })
    
    const existingSubjectNames = new Set(subjects.map(s => s.subjectName))
    const missingSubjects = [...requiredSubjects].filter(name => !existingSubjectNames.has(name))
    
    console.log(`✅ Required subjects: ${requiredSubjects.size}`)
    console.log(`✅ Found subjects: ${existingSubjectNames.size}`)
    
    if (missingSubjects.length > 0) {
      console.log(`⚠️ Missing subjects (${missingSubjects.length}):`)
      missingSubjects.forEach(subject => console.log(`   - ${subject}`))
    } else {
      console.log('✅ All required subjects are present')
    }
    
    return missingSubjects.length === 0
  } catch (error) {
    console.error('❌ Error checking subjects:', error.message)
    return false
  }
}

async function checkCourses() {
  console.log('\n🏫 Checking courses...')
  try {
    const courses = await prisma.course.findMany({
      include: {
        schoolYear: true
      },
      orderBy: [
        { schoolYear: { schoolYearId: 'desc' } },
        { grade: 'asc' },
        { section: 'asc' }
      ]
    })
    
    console.log(`📊 Total courses: ${courses.length}`)
    
    if (courses.length === 0) {
      console.log('⚠️ WARNING: No courses found!')
      return false
    }
    
    // Group by school year
    const coursesByYear = {}
    courses.forEach(course => {
      const yearCode = course.schoolYear.schoolYearCode
      if (!coursesByYear[yearCode]) {
        coursesByYear[yearCode] = []
      }
      coursesByYear[yearCode].push(course)
    })
    
    console.log('✅ Courses by school year:')
    Object.entries(coursesByYear).forEach(([year, yearCourses]) => {
      console.log(`   📚 ${year}: ${yearCourses.length} courses`)
      
      // Group by grade
      const coursesByGrade = {}
      yearCourses.forEach(course => {
        if (!coursesByGrade[course.grade]) {
          coursesByGrade[course.grade] = []
        }
        coursesByGrade[course.grade].push(course)
      })
      
      Object.entries(coursesByGrade).forEach(([grade, gradeCourses]) => {
        const sections = gradeCourses.map(c => c.section).join(', ')
        console.log(`      Grade ${grade}: ${sections}`)
      })
    })
    
    return true
  } catch (error) {
    console.error('❌ Error checking courses:', error.message)
    return false
  }
}

async function checkStudents() {
  console.log('\n👨‍🎓 Checking students...')
  try {
    const students = await prisma.student.findMany({
      select: {
        studentId: true,
        firstName: true,
        lastName: true,
        class: true,
        status: true
      }
    })
    
    console.log(`📊 Total students: ${students.length}`)
    
    if (students.length === 0) {
      console.log('⚠️ WARNING: No students found!')
      return false
    }
    
    const activeStudents = students.filter(s => s.status === 'ACTIVE')
    console.log(`✅ Active students: ${activeStudents.length}`)
    
    // Group by class
    const studentsByClass = {}
    students.forEach(student => {
      if (!studentsByClass[student.class]) {
        studentsByClass[student.class] = []
      }
      studentsByClass[student.class].push(student)
    })
    
    console.log('✅ Students by class:')
    Object.entries(studentsByClass).forEach(([className, classStudents]) => {
      console.log(`   Grade ${className}: ${classStudents.length} students`)
    })
    
    return true
  } catch (error) {
    console.error('❌ Error checking students:', error.message)
    return false
  }
}

async function checkEnrollments() {
  console.log('\n📝 Checking student enrollments...')
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        drop: false
      },
      include: {
        student: true,
        course: {
          include: {
            schoolYear: true
          }
        }
      }
    })
    
    console.log(`📊 Total active enrollments: ${enrollments.length}`)
    
    if (enrollments.length === 0) {
      console.log('⚠️ WARNING: No active enrollments found!')
      return false
    }
    
    // Group by course
    const enrollmentsByCourse = {}
    enrollments.forEach(enrollment => {
      const courseKey = `${enrollment.course.courseName} (${enrollment.course.schoolYear.schoolYearCode})`
      if (!enrollmentsByCourse[courseKey]) {
        enrollmentsByCourse[courseKey] = []
      }
      enrollmentsByCourse[courseKey].push(enrollment)
    })
    
    console.log('✅ Enrollments by course:')
    Object.entries(enrollmentsByCourse).forEach(([courseName, courseEnrollments]) => {
      console.log(`   ${courseName}: ${courseEnrollments.length} students`)
    })
    
    return true
  } catch (error) {
    console.error('❌ Error checking enrollments:', error.message)
    return false
  }
}

async function checkExistingGrades() {
  console.log('\n📊 Checking existing grades...')
  try {
    const grades = await prisma.grade.findMany({
      include: {
        student: true,
        subject: true,
        course: true,
        semester: true
      }
    })
    
    console.log(`📊 Total grades: ${grades.length}`)
    
    if (grades.length > 0) {
      // Group by student
      const gradesByStudent = {}
      grades.forEach(grade => {
        const studentKey = `${grade.student.firstName} ${grade.student.lastName}`
        if (!gradesByStudent[studentKey]) {
          gradesByStudent[studentKey] = []
        }
        gradesByStudent[studentKey].push(grade)
      })
      
      console.log(`✅ Grades by student: ${Object.keys(gradesByStudent).length} students have grades`)
      
      // Show sample of existing grades
      const sampleGrades = grades.slice(0, 5)
      console.log('📋 Sample existing grades:')
      sampleGrades.forEach(grade => {
        console.log(`   ${grade.student.firstName} ${grade.student.lastName} - ${grade.subject.subjectName}: ${grade.grade} (${grade.gradeDate})`)
      })
      
      if (grades.length > 5) {
        console.log(`   ... and ${grades.length - 5} more grades`)
      }
    } else {
      console.log('ℹ️ No existing grades found - ready for new grade creation')
    }
    
    return true
  } catch (error) {
    console.error('❌ Error checking grades:', error.message)
    return false
  }
}

async function generateRecommendations() {
  console.log('\n💡 Recommendations:')
  console.log('=' .repeat(50))
  
  try {
    // Check what's missing
    const users = await prisma.user.count({ where: { role: 'teacher', status: 'active' } })
    const schoolYears = await prisma.schoolYear.count()
    const semesters = await prisma.semester.count()
    const subjects = await prisma.subject.count()
    const courses = await prisma.course.count()
    const students = await prisma.student.count()
    const enrollments = await prisma.enrollment.count({ where: { drop: false } })
    const grades = await prisma.grade.count()
    
    console.log('📋 Current Status:')
    console.log(`   ✅ Teachers: ${users}`)
    console.log(`   ✅ School Years: ${schoolYears}`)
    console.log(`   ✅ Semesters: ${semesters}`)
    console.log(`   ✅ Subjects: ${subjects}`)
    console.log(`   ✅ Courses: ${courses}`)
    console.log(`   ✅ Students: ${students}`)
    console.log(`   ✅ Enrollments: ${enrollments}`)
    console.log(`   ✅ Grades: ${grades}`)
    
    console.log('\n🚀 Recommended Script:')
    
    if (users === 0) {
      console.log('❌ Run: node scripts/add-teachers.js (create teachers first)')
    } else if (schoolYears === 0 || semesters === 0 || subjects === 0) {
      console.log('🔄 Run: node scripts/add-sample-grades.js (complete setup)')
    } else if (courses === 0 || enrollments === 0) {
      console.log('🔄 Run: node scripts/add-sample-grades.js (create courses and enrollments)')
    } else if (grades === 0) {
      console.log('✅ Run: node scripts/add-grades-simple.js (add grades only)')
    } else {
      console.log('✅ Run: node scripts/add-grades-simple.js (add more grades)')
    }
    
    console.log('\n📊 Expected Results After Running Script:')
    console.log('   Grade 5 students: ~152 grades each (19 subjects × 8 months)')
    console.log('   Grade 7 students: ~120 grades each (12 subjects × 10 months)')
    console.log('   Grade 9 students: ~110 grades each (11 subjects × 10 months)')
    
  } catch (error) {
    console.error('❌ Error generating recommendations:', error.message)
  }
}

async function main() {
  console.log('🔍 Database Review for Grade Addition Scripts')
  console.log('=' .repeat(60))
  
  const checks = [
    { name: 'Database Connection', fn: checkDatabaseConnection },
    { name: 'Users', fn: checkUsers },
    { name: 'School Years', fn: checkSchoolYears },
    { name: 'Semesters', fn: checkSemesters },
    { name: 'Subjects', fn: checkSubjects },
    { name: 'Courses', fn: checkCourses },
    { name: 'Students', fn: checkStudents },
    { name: 'Enrollments', fn: checkEnrollments },
    { name: 'Existing Grades', fn: checkExistingGrades }
  ]
  
  const results = []
  
  for (const check of checks) {
    try {
      const result = await check.fn()
      results.push({ name: check.name, success: result })
    } catch (error) {
      console.error(`❌ ${check.name} check failed:`, error.message)
      results.push({ name: check.name, success: false })
    }
  }
  
  // Generate recommendations
  await generateRecommendations()
  
  // Summary
  console.log('\n📊 Summary:')
  console.log('=' .repeat(50))
  
  const successful = results.filter(r => r.success).length
  const total = results.length
  
  console.log(`✅ Successful checks: ${successful}/${total}`)
  
  const failed = results.filter(r => !r.success)
  if (failed.length > 0) {
    console.log('❌ Failed checks:')
    failed.forEach(f => console.log(`   - ${f.name}`))
  }
  
  if (successful === total) {
    console.log('\n🎉 Database is ready for grade addition scripts!')
  } else {
    console.log('\n⚠️ Please fix the failed checks before running grade scripts.')
  }
}

// Run the review
if (require.main === module) {
  main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
}

module.exports = {
  checkDatabaseConnection,
  checkUsers,
  checkSchoolYears,
  checkSemesters,
  checkSubjects,
  checkCourses,
  checkStudents,
  checkEnrollments,
  checkExistingGrades
}
