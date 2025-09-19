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
      { name: 'សីលធម៌-ពលរដ្ឋវិទ្យា', maxScore: 35 },
      { name: 'ភូមិវិទ្យា', maxScore: 32 },
      { name: 'ប្រវត្តិវិទ្យា', maxScore: 33 },
      { name: 'អង់គ្លេស', maxScore: 50 }
    ]
  }
}

// Semester configurations for 2024-2025
const SEMESTERS = {
  'ឆមាសទី ១': {
    name: 'ឆមាសទី ១',
    code: 'S1_2024_2025',
    startDate: '2024-11-01',
    endDate: '2025-02-28'
  },
  'ឆមាសទី ២': {
    name: 'ឆមាសទី ២',
    code: 'S2_2024_2025',
    startDate: '2025-03-01',
    endDate: '2025-07-31'
  }
}

// School year configuration
const SCHOOL_YEAR = {
  code: '2024-2025',
  name: 'ឆ្នាំសិក្សា 2024-2025'
}

// Helper function to generate random grade based on performance level
function generateGrade(maxScore, performanceLevel = 'average') {
  const baseScore = maxScore * 0.6 // Start at 60% of max score
  
  switch (performanceLevel) {
    case 'excellent':
      return Math.min(maxScore, baseScore + Math.random() * (maxScore - baseScore) * 0.8)
    case 'good':
      return Math.min(maxScore, baseScore + Math.random() * (maxScore - baseScore) * 0.5)
    case 'average':
      return Math.min(maxScore, baseScore + Math.random() * (maxScore - baseScore) * 0.3)
    case 'below_average':
      return Math.max(0, baseScore - Math.random() * baseScore * 0.3)
    default:
      return Math.min(maxScore, baseScore + Math.random() * (maxScore - baseScore) * 0.3)
  }
}

// Helper function to get grade date in MM/YY format
function getGradeDate(month, year) {
  const monthStr = String(month).padStart(2, '0')
  const yearStr = String(year).slice(-2)
  return `${monthStr}/${yearStr}`
}

// Helper function to get performance level based on student index (for variety)
function getPerformanceLevel(studentIndex) {
  const levels = ['excellent', 'good', 'average', 'below_average']
  const weights = [0.1, 0.3, 0.4, 0.2] // 10% excellent, 30% good, 40% average, 20% below average
  
  const random = Math.random()
  let cumulative = 0
  
  for (let i = 0; i < levels.length; i++) {
    cumulative += weights[i]
    if (random <= cumulative) {
      return levels[i]
    }
  }
  
  return 'average'
}

async function createSchoolYear() {
  console.log('📚 Creating school year...')
  
  try {
    // Check if school year already exists
    let schoolYear = await prisma.schoolYear.findUnique({
      where: { schoolYearCode: SCHOOL_YEAR.code }
    })
    
    if (!schoolYear) {
      schoolYear = await prisma.schoolYear.create({
        data: {
          schoolYearCode: SCHOOL_YEAR.code
        }
      })
      console.log(`✅ Created school year: ${schoolYear.schoolYearCode}`)
    } else {
      console.log(`✅ School year already exists: ${schoolYear.schoolYearCode}`)
    }
    
    return schoolYear
  } catch (error) {
    console.error('❌ Error creating school year:', error)
    throw error
  }
}

async function createSemesters() {
  console.log('📅 Creating semesters...')
  
  const semesters = []
  
  for (const [key, semesterData] of Object.entries(SEMESTERS)) {
    try {
      // Check if semester already exists
      let semester = await prisma.semester.findUnique({
        where: { semesterCode: semesterData.code }
      })
      
      if (!semester) {
        semester = await prisma.semester.create({
          data: {
            semester: semesterData.name,
            semesterCode: semesterData.code
          }
        })
        console.log(`✅ Created semester: ${semester.semester}`)
      } else {
        console.log(`✅ Semester already exists: ${semester.semester}`)
      }
      
      semesters.push(semester)
    } catch (error) {
      console.error(`❌ Error creating semester ${key}:`, error)
      throw error
    }
  }
  
  return semesters
}

async function createSubjects() {
  console.log('📖 Creating subjects...')
  
  const allSubjects = new Set()
  
  // Collect all unique subjects from all grade levels
  Object.values(GRADE_CONFIGS).forEach(config => {
    if (Array.isArray(config.subjects)) {
      config.subjects.forEach(subject => {
        if (typeof subject === 'string') {
          allSubjects.add(subject)
        } else if (typeof subject === 'object' && subject.name) {
          allSubjects.add(subject.name)
        }
      })
    }
  })
  
  const subjects = []
  
  for (const subjectName of allSubjects) {
    try {
      // Check if subject already exists
      let subject = await prisma.subject.findFirst({
        where: { subjectName: subjectName }
      })
      
      if (!subject) {
        subject = await prisma.subject.create({
          data: {
            subjectName: subjectName
          }
        })
        console.log(`✅ Created subject: ${subject.subjectName}`)
      } else {
        console.log(`✅ Subject already exists: ${subject.subjectName}`)
      }
      
      subjects.push(subject)
    } catch (error) {
      console.error(`❌ Error creating subject ${subjectName}:`, error)
      throw error
    }
  }
  
  return subjects
}

async function createCourses(schoolYear) {
  console.log('🏫 Creating courses...')
  
  const courses = []
  
  // Create courses for each grade level
  for (const [gradeLevel, config] of Object.entries(GRADE_CONFIGS)) {
    try {
      // Create sections A, B, C for each grade
      const sections = ['A', 'B', 'C']
      
      for (const section of sections) {
        const courseName = `ថ្នាក់ទី ${gradeLevel}${section}`
        
        // Check if course already exists
        let course = await prisma.course.findFirst({
          where: {
            grade: gradeLevel,
            section: section,
            schoolYearId: schoolYear.schoolYearId
          }
        })
        
        if (!course) {
          course = await prisma.course.create({
            data: {
              schoolYearId: schoolYear.schoolYearId,
              grade: gradeLevel,
              section: section,
              courseName: courseName
            }
          })
          console.log(`✅ Created course: ${course.courseName}`)
        } else {
          console.log(`✅ Course already exists: ${course.courseName}`)
        }
        
        courses.push(course)
      }
    } catch (error) {
      console.error(`❌ Error creating courses for grade ${gradeLevel}:`, error)
      throw error
    }
  }
  
  return courses
}

async function getStudentsForCourses(courses) {
  console.log('👥 Getting students for courses...')
  
  const studentsByCourse = {}
  
  for (const course of courses) {
    try {
      // Get students enrolled in this course
      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId: course.courseId,
          drop: false
        },
        include: {
          student: true
        }
      })
      
      studentsByCourse[course.courseId] = enrollments.map(e => e.student)
      console.log(`✅ Found ${enrollments.length} students for ${course.courseName}`)
    } catch (error) {
      console.error(`❌ Error getting students for course ${course.courseName}:`, error)
      throw error
    }
  }
  
  return studentsByCourse
}

async function createGradesForStudents(studentsByCourse, courses, subjects, semesters) {
  console.log('📊 Creating grades for students...')
  
  let totalGradesCreated = 0
  
  for (const course of courses) {
    const students = studentsByCourse[course.courseId] || []
    const gradeLevel = parseInt(course.grade)
    const config = GRADE_CONFIGS[gradeLevel]
    
    if (!config) {
      console.log(`⚠️ No configuration found for grade ${gradeLevel}, skipping...`)
      continue
    }
    
    console.log(`\n📚 Processing ${course.courseName} (${students.length} students)...`)
    
    for (let studentIndex = 0; studentIndex < students.length; studentIndex++) {
      const student = students[studentIndex]
      const performanceLevel = getPerformanceLevel(studentIndex)
      
      console.log(`  👤 Processing student: ${student.firstName} ${student.lastName} (${performanceLevel})`)
      
      // Create grades for each semester
      for (const semester of semesters) {
        // Create grades for each subject
        for (let subjectIndex = 0; subjectIndex < config.subjects.length; subjectIndex++) {
          const subjectData = config.subjects[subjectIndex]
          const subjectName = typeof subjectData === 'string' ? subjectData : subjectData.name
          const maxScore = typeof subjectData === 'object' ? subjectData.maxScore : config.maxScore
          
          // Find the subject in the database
          const subject = subjects.find(s => s.subjectName === subjectName)
          if (!subject) {
            console.log(`    ⚠️ Subject not found: ${subjectName}, skipping...`)
            continue
          }
          
          // Generate grades for different months in the semester
          const months = semester.semesterCode.includes('S1') 
            ? [11, 12, 1, 2] // November, December, January, February
            : [3, 4, 5, 6, 7] // March, April, May, June, July
          
          for (const month of months) {
            const year = month <= 2 ? 2025 : 2025 // All months are in 2025
            const gradeDate = getGradeDate(month, year)
            
            // Generate grade
            const grade = generateGrade(maxScore, performanceLevel)
            const roundedGrade = Math.round(grade * 100) / 100 // Round to 2 decimal places
            
            // Generate comment based on performance
            const comments = {
              excellent: ['ល្អណាស់', 'ពូកែ', 'ពិន្ទុខ្ពស់'],
              good: ['ល្អ', 'ពិន្ទុល្អ', 'អាចប្រសើរបាន'],
              average: ['ធម្មតា', 'ពិន្ទុមធ្យម', 'ត្រូវព្យាយាមបន្ថែម'],
              below_average: ['ត្រូវព្យាយាម', 'ពិន្ទុទាប', 'ត្រូវរៀនបន្ថែម']
            }
            
            const comment = comments[performanceLevel][Math.floor(Math.random() * comments[performanceLevel].length)]
            
            try {
              // Check if grade already exists
              const existingGrade = await prisma.grade.findFirst({
                where: {
                  studentId: student.studentId,
                  subjectId: subject.subjectId,
                  courseId: course.courseId,
                  semesterId: semester.semesterId,
                  gradeDate: gradeDate
                }
              })
              
              if (!existingGrade) {
                await prisma.grade.create({
                  data: {
                    studentId: student.studentId,
                    subjectId: subject.subjectId,
                    courseId: course.courseId,
                    semesterId: semester.semesterId,
                    grade: roundedGrade,
                    gradeComment: comment,
                    gradeDate: gradeDate,
                    userId: 1 // Assuming user ID 1 exists
                  }
                })
                
                totalGradesCreated++
                console.log(`    ✅ Created grade: ${subjectName} - ${roundedGrade}/${maxScore} (${gradeDate})`)
              } else {
                console.log(`    ⚠️ Grade already exists: ${subjectName} (${gradeDate})`)
              }
            } catch (error) {
              console.error(`    ❌ Error creating grade for ${student.firstName} ${student.lastName} - ${subjectName}:`, error)
            }
          }
        }
      }
    }
  }
  
  console.log(`\n🎉 Total grades created: ${totalGradesCreated}`)
  return totalGradesCreated
}

async function main() {
  console.log('🚀 Starting grade creation script...')
  console.log('📋 Configuration:')
  console.log(`   School Year: ${SCHOOL_YEAR.code}`)
  console.log(`   Semesters: ${Object.keys(SEMESTERS).join(', ')}`)
  console.log(`   Grade Levels: ${Object.keys(GRADE_CONFIGS).join(', ')}`)
  console.log('')
  
  try {
    // Step 1: Create school year
    const schoolYear = await createSchoolYear()
    
    // Step 2: Create semesters
    const semesters = await createSemesters()
    
    // Step 3: Create subjects
    const subjects = await createSubjects()
    
    // Step 4: Create courses
    const courses = await createCourses(schoolYear)
    
    // Step 5: Get students for each course
    const studentsByCourse = await getStudentsForCourses(courses)
    
    // Step 6: Create grades for students
    const totalGrades = await createGradesForStudents(studentsByCourse, courses, subjects, semesters)
    
    console.log('\n🎉 Grade creation script completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   School Year: ${schoolYear.schoolYearCode}`)
    console.log(`   Semesters: ${semesters.length}`)
    console.log(`   Subjects: ${subjects.length}`)
    console.log(`   Courses: ${courses.length}`)
    console.log(`   Total Grades Created: ${totalGrades}`)
    
  } catch (error) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = {
  createSchoolYear,
  createSemesters,
  createSubjects,
  createCourses,
  createGradesForStudents,
  GRADE_CONFIGS,
  SEMESTERS,
  SCHOOL_YEAR
}
