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

async function getExistingData() {
  console.log('🔍 Fetching existing data...')
  
  try {
    // Get school year 2024-2025
    const schoolYear = await prisma.schoolYear.findFirst({
      where: {
        schoolYearCode: {
          contains: '2024-2025'
        }
      }
    })
    
    if (!schoolYear) {
      throw new Error('School year 2024-2025 not found. Please create it first.')
    }
    
    // Get semesters
    const semesters = await prisma.semester.findMany({
      where: {
        OR: [
          { semesterCode: { contains: '2024_2025' } },
          { semester: { contains: 'ឆមាស' } }
        ]
      }
    })
    
    if (semesters.length === 0) {
      throw new Error('No semesters found. Please create semesters first.')
    }
    
    // Get all subjects
    const subjects = await prisma.subject.findMany()
    
    if (subjects.length === 0) {
      throw new Error('No subjects found. Please create subjects first.')
    }
    
    // Get courses for the school year
    const courses = await prisma.course.findMany({
      where: {
        schoolYearId: schoolYear.schoolYearId
      }
    })
    
    if (courses.length === 0) {
      throw new Error('No courses found for school year 2024-2025. Please create courses first.')
    }
    
    // Get students enrolled in courses
    const studentsByCourse = {}
    for (const course of courses) {
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
    }
    
    // Get a teacher user for grade assignment
    const teacher = await prisma.user.findFirst({
      where: {
        role: 'teacher',
        status: 'active'
      }
    })
    
    if (!teacher) {
      throw new Error('No active teacher found. Please create a teacher user first.')
    }
    
    console.log(`✅ Found data:`)
    console.log(`   School Year: ${schoolYear.schoolYearCode}`)
    console.log(`   Semesters: ${semesters.length}`)
    console.log(`   Subjects: ${subjects.length}`)
    console.log(`   Courses: ${courses.length}`)
    console.log(`   Teacher: ${teacher.firstname} ${teacher.lastname}`)
    
    return {
      schoolYear,
      semesters,
      subjects,
      courses,
      studentsByCourse,
      teacher
    }
  } catch (error) {
    console.error('❌ Error fetching existing data:', error)
    throw error
  }
}

async function createGradesForStudents(data) {
  const { schoolYear, semesters, subjects, courses, studentsByCourse, teacher } = data
  
  console.log('\n📊 Creating grades for students...')
  
  let totalGradesCreated = 0
  let totalGradesSkipped = 0
  
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
          const months = semester.semesterCode.includes('S1') || semester.semester.includes('១')
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
              excellent: ['ល្អណាស់', 'ពូកែ', 'ពិន្ទុខ្ពស់', 'អស្ចារ្យ'],
              good: ['ល្អ', 'ពិន្ទុល្អ', 'អាចប្រសើរបាន', 'ពិន្ទុល្អ'],
              average: ['ធម្មតា', 'ពិន្ទុមធ្យម', 'ត្រូវព្យាយាមបន្ថែម', 'ពិន្ទុមធ្យម'],
              below_average: ['ត្រូវព្យាយាម', 'ពិន្ទុទាប', 'ត្រូវរៀនបន្ថែម', 'ពិន្ទុទាប']
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
                    userId: teacher.userId
                  }
                })
                
                totalGradesCreated++
                console.log(`    ✅ Created grade: ${subjectName} - ${roundedGrade}/${maxScore} (${gradeDate})`)
              } else {
                totalGradesSkipped++
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
  
  console.log(`\n📊 Grade creation summary:`)
  console.log(`   Total grades created: ${totalGradesCreated}`)
  console.log(`   Total grades skipped (already exist): ${totalGradesSkipped}`)
  
  return { totalGradesCreated, totalGradesSkipped }
}

async function main() {
  console.log('🚀 Starting grade creation script for existing data...')
  console.log('📋 This script will add grades to existing students based on:')
  console.log(`   Grade 5: 10-point scale with 19 subjects`)
  console.log(`   Grade 7: Mixed scale with 12 subjects`)
  console.log(`   Grade 9: Mixed scale with 11 subjects`)
  console.log('')
  
  try {
    // Step 1: Get existing data
    const data = await getExistingData()
    
    // Step 2: Create grades for students
    const result = await createGradesForStudents(data)
    
    console.log('\n🎉 Grade creation script completed successfully!')
    console.log(`📊 Final Summary:`)
    console.log(`   Grades Created: ${result.totalGradesCreated}`)
    console.log(`   Grades Skipped: ${result.totalGradesSkipped}`)
    
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
  getExistingData,
  createGradesForStudents,
  GRADE_CONFIGS
}
