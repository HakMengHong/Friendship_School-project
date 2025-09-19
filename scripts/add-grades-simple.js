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

async function addGradesForStudent(studentId, gradeLevel, semesterId, courseId, teacherId) {
  console.log(`\n👤 Adding grades for student ID: ${studentId}, Grade: ${gradeLevel}`)
  
  const config = GRADE_CONFIGS[gradeLevel]
  if (!config) {
    console.log(`❌ No configuration found for grade ${gradeLevel}`)
    return 0
  }
  
  // Get all subjects
  const subjects = await prisma.subject.findMany()
  
  let gradesCreated = 0
  
  // Create grades for each subject
  for (let subjectIndex = 0; subjectIndex < config.subjects.length; subjectIndex++) {
    const subjectData = config.subjects[subjectIndex]
    const subjectName = typeof subjectData === 'string' ? subjectData : subjectData.name
    const maxScore = typeof subjectData === 'object' ? subjectData.maxScore : config.maxScore
    
    // Find the subject in the database
    const subject = subjects.find(s => s.subjectName === subjectName)
    if (!subject) {
      console.log(`  ⚠️ Subject not found: ${subjectName}`)
      continue
    }
    
    // Generate grades for different months
    const months = semesterId === 1 ? [11, 12, 1, 2] : [3, 4, 5, 6, 7]
    
    for (const month of months) {
      const year = month <= 2 ? 2025 : 2025
      const gradeDate = getGradeDate(month, year)
      
      // Generate grade
      const performanceLevel = getPerformanceLevel(studentId % 4) // Use student ID for consistent performance
      const grade = generateGrade(maxScore, performanceLevel)
      const roundedGrade = Math.round(grade * 100) / 100
      
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
            studentId: studentId,
            subjectId: subject.subjectId,
            courseId: courseId,
            semesterId: semesterId,
            gradeDate: gradeDate
          }
        })
        
        if (!existingGrade) {
          await prisma.grade.create({
            data: {
              studentId: studentId,
              subjectId: subject.subjectId,
              courseId: courseId,
              semesterId: semesterId,
              grade: roundedGrade,
              gradeComment: comment,
              gradeDate: gradeDate,
              userId: teacherId
            }
          })
          
          gradesCreated++
          console.log(`  ✅ ${subjectName}: ${roundedGrade}/${maxScore} (${gradeDate})`)
        } else {
          console.log(`  ⚠️ ${subjectName}: Grade already exists (${gradeDate})`)
        }
      } catch (error) {
        console.error(`  ❌ Error creating grade for ${subjectName}:`, error)
      }
    }
  }
  
  return gradesCreated
}

async function main() {
  console.log('🚀 Simple Grade Addition Script')
  console.log('📋 This script adds grades for specific students')
  console.log('')
  
  try {
    // Get a teacher user
    const teacher = await prisma.user.findFirst({
      where: {
        role: 'teacher',
        status: 'active'
      }
    })
    
    if (!teacher) {
      throw new Error('No active teacher found. Please create a teacher user first.')
    }
    
    console.log(`👨‍🏫 Using teacher: ${teacher.firstname} ${teacher.lastname}`)
    
    // Get all students
    const students = await prisma.student.findMany({
      include: {
        enrollments: {
          include: {
            course: true
          }
        }
      }
    })
    
    console.log(`👥 Found ${students.length} students`)
    
    // Get semesters
    const semesters = await prisma.semester.findMany()
    console.log(`📅 Found ${semesters.length} semesters`)
    
    let totalGradesCreated = 0
    
    // Process each student
    for (const student of students) {
      if (student.enrollments.length === 0) {
        console.log(`⚠️ Student ${student.firstName} ${student.lastName} has no enrollments, skipping...`)
        continue
      }
      
      // Get the first enrollment for this student
      const enrollment = student.enrollments[0]
      const course = enrollment.course
      const gradeLevel = parseInt(course.grade)
      
      console.log(`\n📚 Processing: ${student.firstName} ${student.lastName} - ${course.courseName}`)
      
      // Add grades for each semester
      for (const semester of semesters) {
        const gradesCreated = await addGradesForStudent(
          student.studentId,
          gradeLevel,
          semester.semesterId,
          course.courseId,
          teacher.userId
        )
        totalGradesCreated += gradesCreated
      }
    }
    
    console.log(`\n🎉 Script completed!`)
    console.log(`📊 Total grades created: ${totalGradesCreated}`)
    
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
  addGradesForStudent,
  GRADE_CONFIGS
}
