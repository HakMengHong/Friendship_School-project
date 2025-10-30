const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Grade level configurations (specific subjects per grade)
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

// Helper function to get performance level (for variety)
function getPerformanceLevel(studentId) {
  const levels = ['excellent', 'good', 'average', 'below_average']
  const weights = [0.1, 0.3, 0.4, 0.2] // 10% excellent, 30% good, 40% average, 20% below average
  
  // Use studentId for consistent performance per student
  const seed = (studentId * 9301 + 49297) % 233280
  const random = seed / 233280
  
  let cumulative = 0
  for (let i = 0; i < levels.length; i++) {
    cumulative += weights[i]
    if (random <= cumulative) {
      return levels[i]
    }
  }
  
  return 'average'
}

// Get appropriate months for semester
function getMonthsForSemester(semester) {
  // Semester 1: November - February (ឆមាសទី ១)
  // Semester 2: March - July (ឆមាសទី ២)
  
  const semesterName = semester.semester || semester.semesterCode || ''
  if (semesterName.includes('១') || semesterName.includes('1') || semesterName.toLowerCase().includes('first')) {
    return [
      { month: 11, year: 2025 },
      { month: 12, year: 2025 },
      { month: 1, year: 2026 },
      { month: 2, year: 2026 }
    ]
  } else {
    return [
      { month: 3, year: 2026 },
      { month: 4, year: 2026 },
      { month: 5, year: 2026 },
      { month: 6, year: 2026 },
      { month: 7, year: 2026 }
    ]
  }
}

async function addGradesForStudent(student, enrollment, teacher, allSubjects, semester, options = {}) {
  const gradeLevel = parseInt(enrollment.course.grade)
  const courseId = enrollment.course.courseId
  const semesterId = semester.semesterId
  
  console.log(`\n👤 ${student.lastName} ${student.firstName} - ថ្នាក់ទី ${gradeLevel}${enrollment.course.section}`)
  
  // Get configuration for this grade level
  const config = GRADE_CONFIGS[gradeLevel]
  if (!config) {
    console.log(`  ⚠️  No configuration found for grade ${gradeLevel}, skipping...`)
    return 0
  }
  
  let gradesCreated = 0
  const performanceLevel = getPerformanceLevel(student.studentId)
  
  // Get months for this semester
  const months = getMonthsForSemester(semester)
  
  // Process each subject in the config
  for (let subjectIndex = 0; subjectIndex < config.subjects.length; subjectIndex++) {
    const subjectData = config.subjects[subjectIndex]
    const subjectName = typeof subjectData === 'string' ? subjectData : subjectData.name
    const maxScore = typeof subjectData === 'object' ? subjectData.maxScore : config.maxScore
    
    // Find the subject in the database
    const subject = allSubjects.find(s => s.subjectName === subjectName)
    if (!subject) {
      console.log(`  ⚠️  Subject not found: ${subjectName}`)
      continue
    }
    
    // Create grades for each month
    for (const { month, year } of months) {
      const gradeDate = getGradeDate(month, year)
      
      // Check if grade already exists
      const existingGrade = await prisma.grade.findFirst({
        where: {
          studentId: student.studentId,
          subjectId: subject.subjectId,
          courseId: courseId,
          semesterId: semesterId,
          gradeDate: gradeDate
        }
      })
      
      if (existingGrade) {
        if (options.verbose) {
          console.log(`  ⏭️  ${subject.subjectName}: Already exists (${gradeDate})`)
        }
        continue
      }
      
      // Generate grade
      const grade = generateGrade(maxScore, performanceLevel)
      const roundedGrade = Math.round(grade * 100) / 100
      
      // Generate comment based on performance
      const comments = {
        excellent: ['ល្អណាស់', 'ពូកែ', 'ពិន្ទុខ្ពស់', 'ពិសេស'],
        good: ['ល្អ', 'ពិន្ទុល្អ', 'អាចប្រសើរបាន', 'សូមខិតខំបន្ត'],
        average: ['ធម្មតា', 'ពិន្ទុមធ្យម', 'ត្រូវព្យាយាមបន្ថែម', 'អាចធ្វើបានល្អជាងនេះ'],
        below_average: ['ត្រូវព្យាយាម', 'ពិន្ទុទាប', 'ត្រូវរៀនបន្ថែម', 'ត្រូវការជំនួយបន្ថែម']
      }
      
      const comment = comments[performanceLevel][Math.floor(Math.random() * comments[performanceLevel].length)]
      
      try {
        await prisma.grade.create({
          data: {
            studentId: student.studentId,
            subjectId: subject.subjectId,
            courseId: courseId,
            semesterId: semesterId,
            grade: roundedGrade,
            gradeComment: comment,
            gradeDate: gradeDate,
            userId: teacher.userId
          }
        })
        
        gradesCreated++
        
        if (options.verbose) {
          console.log(`  ✅ ${subject.subjectName}: ${roundedGrade}/${maxScore} (${gradeDate})`)
        }
      } catch (error) {
        console.error(`  ❌ Error creating grade for ${subject.subjectName}:`, error.message)
      }
    }
  }
  
  if (!options.verbose) {
    console.log(`  ✅ Created ${gradesCreated} grades (Performance: ${performanceLevel})`)
  }
  
  return gradesCreated
}

async function main() {
  console.log('🚀 Auto Grade Addition Script')
  console.log('📋 This script automatically detects your data and adds grades')
  console.log('')
  
  try {
    // Configuration options (you can modify these)
    const options = {
      verbose: false, // Set to true to see every grade created
      specificGrade: [5, 7, 9], // Set to number (e.g., 7) or array (e.g., [5, 7, 9]) for specific grades, or null for all
      specificSection: null, // Set to letter (e.g., 'A') to only process specific section
      specificSchoolYear: '2025-2026', // Set to specific school year or null for latest
      onlySemester: null // Set to 1 or 2 to only process specific semester, or null for all
    }
    
    console.log('⚙️  Configuration:')
    console.log(`   - Verbose: ${options.verbose}`)
    const gradeDisplay = options.specificGrade 
      ? (Array.isArray(options.specificGrade) ? `Grades ${options.specificGrade.join(', ')}` : `Grade ${options.specificGrade}`)
      : 'All grades'
    console.log(`   - Specific Grade: ${gradeDisplay}`)
    console.log(`   - Specific Section: ${options.specificSection || 'All sections'}`)
    console.log(`   - School Year: ${options.specificSchoolYear || 'Latest'}`)
    console.log(`   - Semester: ${options.onlySemester || 'All semesters'}`)
    console.log('')
    
    // Get a teacher user
    const teacher = await prisma.user.findFirst({
      where: {
        role: 'teacher',
        status: 'active'
      }
    })
    
    if (!teacher) {
      throw new Error('❌ No active teacher found. Please create a teacher user first.')
    }
    
    console.log(`👨‍🏫 Using teacher: ${teacher.firstname} ${teacher.lastname}`)
    
    // Get school year
    let schoolYear
    if (options.specificSchoolYear) {
      schoolYear = await prisma.schoolYear.findFirst({
        where: { schoolYearCode: options.specificSchoolYear }
      })
      if (!schoolYear) {
        throw new Error(`❌ School year ${options.specificSchoolYear} not found`)
      }
    } else {
      schoolYear = await prisma.schoolYear.findFirst({
        orderBy: { schoolYearId: 'desc' }
      })
    }
    
    if (!schoolYear) {
      throw new Error('❌ No school year found. Please create a school year first.')
    }
    
    console.log(`📅 School Year: ${schoolYear.schoolYearCode}`)
    
    // Get semesters
    let semesters = await prisma.semester.findMany({
      orderBy: { semesterId: 'asc' }
    })
    
    if (options.onlySemester) {
      semesters = semesters.filter(s => {
        const semName = s.semester || s.semesterCode || ''
        return semName.includes(String(options.onlySemester)) || 
               semName.includes(['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'][options.onlySemester])
      })
    }
    
    console.log(`📚 Semesters: ${semesters.map(s => s.semester || s.semesterCode).join(', ')}`)
    
    // Get all subjects
    const subjects = await prisma.subject.findMany({
      orderBy: { subjectName: 'asc' }
    })
    
    console.log(`📖 Found ${subjects.length} subjects in database`)
    
    // Get students with enrollments
    const students = await prisma.student.findMany({
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                schoolYear: true
              }
            }
          },
          where: {
            course: {
              schoolYear: {
                schoolYearCode: schoolYear.schoolYearCode
              }
            }
          }
        }
      }
    })
    
    console.log(`👥 Found ${students.length} students`)
    
    // Filter students based on options
    let studentsToProcess = students.filter(s => s.enrollments.length > 0)
    
    if (options.specificGrade) {
      const gradesArray = Array.isArray(options.specificGrade) ? options.specificGrade : [options.specificGrade]
      studentsToProcess = studentsToProcess.filter(s => 
        s.enrollments.some(e => gradesArray.includes(parseInt(e.course.grade)))
      )
      const gradeText = Array.isArray(options.specificGrade) 
        ? `grades ${options.specificGrade.join(', ')}` 
        : `grade ${options.specificGrade}`
      console.log(`🎯 Filtered to ${studentsToProcess.length} students in ${gradeText}`)
    }
    
    if (options.specificSection) {
      studentsToProcess = studentsToProcess.filter(s => 
        s.enrollments.some(e => e.course.section === options.specificSection)
      )
      console.log(`🎯 Filtered to ${studentsToProcess.length} students in section ${options.specificSection}`)
    }
    
    console.log(`\n🎯 Processing ${studentsToProcess.length} students...\n`)
    
    let totalGradesCreated = 0
    
    // Process each student
    for (const student of studentsToProcess) {
      for (const enrollment of student.enrollments) {
        // Check if enrollment matches school year
        if (enrollment.course.schoolYear.schoolYearCode !== schoolYear.schoolYearCode) {
          continue
        }
        
        // Add grades for each semester
        for (const semester of semesters) {
          const gradesCreated = await addGradesForStudent(
            student,
            enrollment,
            teacher,
            subjects,
            semester,
            options
          )
          totalGradesCreated += gradesCreated
        }
      }
    }
    
    console.log(`\n${'='.repeat(60)}`)
    console.log(`🎉 Script completed successfully!`)
    console.log(`📊 Total grades created: ${totalGradesCreated}`)
    console.log(`👥 Students processed: ${studentsToProcess.length}`)
    console.log(`📅 School year: ${schoolYear.schoolYearCode}`)
    console.log(`📚 Semesters: ${semesters.length}`)
    console.log(`${'='.repeat(60)}`)
    
  } catch (error) {
    console.error('\n❌ Script failed:', error.message)
    console.error(error)
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
  getMonthsForSemester,
  generateGrade,
  GRADE_CONFIGS
}

