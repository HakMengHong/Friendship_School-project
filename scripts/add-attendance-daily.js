const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ============================================================================
// CONFIGURATION OPTIONS
// ============================================================================
const options = {
  verbose: false,                    // Show detailed logs
  specificGrade: [5, 7, 9],         // Array of grades or null for all
  specificSection: null,             // Specific section or null for all
  specificSchoolYear: '2025-2026',  // School year to generate attendance for
  onlySemester: null,                // 1, 2, or null for both
  
  // Attendance-specific options
  skipWeekends: true,                // Skip Saturday and Sunday
  skipHolidays: [],                  // Array of holiday dates to skip (e.g., ['2025-12-25'])
  
  // =========================================================================
  // IMPORTANT: System defaults to 'present' unless marked otherwise
  // Only create records for NON-PRESENT attendance
  // =========================================================================
  nonPresentRate: 0.15,              // 15% of students have non-present status
  
  // Status distribution for non-present students (should add up to 1.0)
  statusRates: {
    'absent': 0.60,                  // 60% absent without permission
    'late': 0.25,                    // 25% late
    'excused': 0.15                  // 15% absent with permission
  },
  
  // Session options: 'AM' (morning), 'PM' (afternoon), 'FULL' (full day)
  sessionRates: {
    'AM': 0.45,                      // 45% morning only
    'PM': 0.45,                      // 45% afternoon only
    'FULL': 0.10                     // 10% full day
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get months for a semester with proper year
 */
function getMonthsForSemester(semester) {
  const semesterName = semester.semester || semester.semesterCode || ''
  
  if (semesterName.includes('១') || semesterName.includes('1') || semesterName.toLowerCase().includes('first')) {
    // Semester 1: November - February
    return [
      { month: 11, year: 2025 },  // November 2025
      { month: 12, year: 2025 },  // December 2025
      { month: 1, year: 2026 },   // January 2026
      { month: 2, year: 2026 }    // February 2026
    ]
  } else {
    // Semester 2: March - July
    return [
      { month: 3, year: 2026 },   // March 2026
      { month: 4, year: 2026 },   // April 2026
      { month: 5, year: 2026 },   // May 2026
      { month: 6, year: 2026 },   // June 2026
      { month: 7, year: 2026 }    // July 2026
    ]
  }
}

/**
 * Get all school days in a month (excluding weekends and holidays)
 */
function getSchoolDays(year, month) {
  const days = []
  const daysInMonth = new Date(year, month, 0).getDate()
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const dayOfWeek = date.getDay()
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (options.skipWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
      continue
    }
    
    // Skip holidays
    const dateString = date.toISOString().split('T')[0]
    if (options.skipHolidays.includes(dateString)) {
      continue
    }
    
    days.push(date)
  }
  
  return days
}

/**
 * Determine if student should have non-present attendance
 */
function shouldMarkNonPresent() {
  return Math.random() < options.nonPresentRate
}

/**
 * Generate random attendance status from non-present options
 */
function getRandomStatus() {
  const rand = Math.random()
  let cumulative = 0
  
  for (const [status, rate] of Object.entries(options.statusRates)) {
    cumulative += rate
    if (rand <= cumulative) {
      return status
    }
  }
  
  return 'absent' // Fallback
}

/**
 * Generate random session
 */
function getRandomSession() {
  const rand = Math.random()
  let cumulative = 0
  
  for (const [session, rate] of Object.entries(options.sessionRates)) {
    cumulative += rate
    if (rand <= cumulative) {
      return session
    }
  }
  
  return 'AM' // Fallback
}

/**
 * Get appropriate Khmer reason based on status
 */
function getReasonForStatus(status) {
  const reasons = {
    'absent': [
      'ឈឺ',
      'មានធុរៈផ្ទាល់ខ្លួន',
      'ធ្វើការងារ',
      'ជួយគ្រួសារ',
      'មិនមានមធ្យោបាយធ្វើដំណើរ'
    ],
    'late': [
      'ចំណាយពេលនៅផ្លូវ',
      'រថយន្តខូច',
      'ភ្លៀងធ្លាក់',
      'គេងលុប',
      'ជួយម្តាយព្រឹក'
    ],
    'excused': [
      'សុំច្បាប់',
      'ទៅពេទ្យ',
      'ចូលរួមពិធីលើកទឹកចិត្ត',
      'ចូលរួមការប្រជុំគ្រួសារ',
      'មានរឿងបន្ទាន់'
    ]
  }
  
  const statusReasons = reasons[status] || ['គ្មានមូលហេតុ']
  return statusReasons[Math.floor(Math.random() * statusReasons.length)]
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function generateAttendance() {
  console.log('\n======================================================================')
  console.log('📊 ATTENDANCE DATA GENERATOR - Daily Session Mode')
  console.log('======================================================================\n')

  console.log('⚙️  Configuration:')
  console.log(`   School Year: ${options.specificSchoolYear}`)
  console.log(`   Grades: ${Array.isArray(options.specificGrade) ? options.specificGrade.join(', ') : options.specificGrade || 'All'}`)
  console.log(`   Section: ${options.specificSection || 'All'}`)
  console.log(`   Semester: ${options.onlySemester ? `Semester ${options.onlySemester}` : 'Both'}`)
  console.log(`   Skip Weekends: ${options.skipWeekends ? 'Yes' : 'No'}`)
  console.log(`   Non-Present Rate: ${(options.nonPresentRate * 100).toFixed(0)}%`)
  console.log(`   Status Rates: Absent=${(options.statusRates.absent * 100).toFixed(0)}%, Late=${(options.statusRates.late * 100).toFixed(0)}%, Excused=${(options.statusRates.excused * 100).toFixed(0)}%`)
  console.log('')
  console.log('----------------------------------------------------------------------\n')

  try {
    // ============================================================================
    // FETCH DATA FROM DATABASE
    // ============================================================================
    console.log('📥 Fetching data from database...')
    
    const schoolYears = await prisma.schoolYear.findMany()
    const semesters = await prisma.semester.findMany()
    const courses = await prisma.course.findMany({
      include: {
        schoolYear: true
      }
    })
    const existingAttendance = await prisma.attendance.findMany()
    
    console.log(`   ✅ Found ${schoolYears.length} school year(s)`)
    console.log(`   ✅ Found ${semesters.length} semester(s)`)
    console.log(`   ✅ Found ${courses.length} course(s)`)
    console.log(`   ✅ Found ${existingAttendance.length} existing attendance record(s)`)
    
    // ============================================================================
    // FILTER DATA BASED ON OPTIONS
    // ============================================================================
    const targetSchoolYear = schoolYears.find(sy => sy.schoolYearCode === options.specificSchoolYear)
    
    if (!targetSchoolYear) {
      throw new Error(`School year ${options.specificSchoolYear} not found`)
    }
    
    console.log(`\n🎯 Target School Year: ${targetSchoolYear.schoolYearCode}`)
    
    // Filter courses
    let targetCourses = courses.filter(c => c.schoolYear.schoolYearId === targetSchoolYear.schoolYearId)
    
    if (options.specificGrade) {
      const grades = Array.isArray(options.specificGrade) ? options.specificGrade : [options.specificGrade]
      targetCourses = targetCourses.filter(c => grades.includes(parseInt(c.grade)))
    }
    
    if (options.specificSection) {
      targetCourses = targetCourses.filter(c => c.section === options.specificSection)
    }
    
    console.log(`   ✅ Filtered to ${targetCourses.length} course(s)`)
    
    // Filter semesters
    let targetSemesters = [...semesters]
    if (options.onlySemester) {
      targetSemesters = semesters.filter(s => 
        s.semester.includes(options.onlySemester.toString()) || 
        s.semesterCode.includes(options.onlySemester.toString())
      )
    }
    
    console.log(`   ✅ Processing ${targetSemesters.length} semester(s)`)
    
    // ============================================================================
    // GENERATE ATTENDANCE
    // ============================================================================
    console.log('\n======================================================================')
    console.log('🚀 Starting Attendance Generation...')
    console.log('======================================================================\n')
    
    let totalCreated = 0
    let totalSkipped = 0
    
    for (const course of targetCourses) {
      console.log(`\n📚 ថ្នាក់ទី ${course.grade}${course.section}`)
      
      // Get enrolled students
      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId: course.courseId,
          drop: false
        },
        include: {
          student: true
        }
      })
      
      console.log(`   👥 ${enrollments.length} student(s) enrolled`)
      
      for (const semester of targetSemesters) {
        console.log(`\n   📖 ${semester.semester}`)
        
        const months = getMonthsForSemester(semester)
        
        for (const { month, year } of months) {
          const schoolDays = getSchoolDays(year, month)
          
          if (options.verbose) {
            console.log(`\n      📅 ${year}-${month.toString().padStart(2, '0')}: ${schoolDays.length} school days`)
          }
          
          for (const student of enrollments) {
            for (const date of schoolDays) {
              // Only create records for non-present students
              if (!shouldMarkNonPresent()) {
                continue
              }
              
              const session = getRandomSession()
              const status = getRandomStatus()
              const reason = getReasonForStatus(status)
              const dateString = date.toISOString().split('T')[0]
              
              // Check if attendance already exists
              const exists = existingAttendance.some(a => 
                a.studentId === student.studentId &&
                a.courseId === course.courseId &&
                new Date(a.attendanceDate).toISOString().split('T')[0] === dateString &&
                a.session === session
              )
              
              if (exists) {
                totalSkipped++
                if (options.verbose) {
                  console.log(`         ⏭️  Skipped: ${student.student.lastName} ${student.student.firstName} - ${dateString} ${session} (exists)`)
                }
                continue
              }
              
              try {
                await prisma.attendance.create({
                  data: {
                    studentId: student.studentId,
                    courseId: course.courseId,
                    attendanceDate: date,
                    session: session,
                    status: status,
                    reason: reason,
                    recordedBy: 'System',
                    semesterId: semester.semesterId
                  }
                })
                
                totalCreated++
                
                if (options.verbose) {
                  console.log(`         ✅ Created: ${student.student.lastName} ${student.student.firstName} - ${dateString} ${session} - ${status} (${reason})`)
                }
              } catch (error) {
                if (error.code === 'P2002') {
                  // Unique constraint violation - record already exists
                  totalSkipped++
                  if (options.verbose) {
                    console.log(`         ⏭️  Skipped: ${student.student.lastName} ${student.student.firstName} - ${dateString} ${session} (duplicate)`)
                  }
                } else {
                  throw error
                }
              }
            }
          }
        }
      }
    }
    
    // ============================================================================
    // SUMMARY
    // ============================================================================
    console.log('\n======================================================================')
    console.log('✅ ATTENDANCE GENERATION COMPLETE!')
    console.log('======================================================================\n')
    
    console.log('📊 Summary:')
    console.log(`   ✅ Created: ${totalCreated} attendance record(s)`)
    console.log(`   ⏭️  Skipped: ${totalSkipped} duplicate(s)`)
    console.log(`   📅 Total: ${totalCreated + totalSkipped} record(s) processed`)
    
    console.log('\n======================================================================\n')
    
  } catch (error) {
    console.error('\n❌ Error generating attendance:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// ============================================================================
// RUN SCRIPT
// ============================================================================

generateAttendance()
  .then(() => {
    console.log('✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })

