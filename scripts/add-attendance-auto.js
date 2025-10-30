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
  
  // Attendance status distribution (should add up to 1.0)
  statusRates: {
    'Present': 0.85,                 // 85% present
    'Absent': 0.08,                  // 8% absent
    'Late': 0.04,                    // 4% late
    'Permission': 0.03               // 3% excused/permission
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
 * Generate random attendance status based on configured rates
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
  
  return 'Present' // Fallback
}

/**
 * Get appropriate reason for absence
 */
function getAbsenceReason(status) {
  if (status === 'Present' || status === 'Late') {
    return null
  }
  
  const reasons = {
    'Absent': [
      'ឈឺ',           // Sick
      'ធ្វើការងារ',    // Working
      'មិនទាន់មកដល់',  // Not yet arrived
      null            // No reason given
    ],
    'Permission': [
      'សុំច្បាប់',      // Requested permission
      'បុណ្យ',         // Festival/ceremony
      'ជួយគ្រួសារ',    // Helping family
      'ទៅពេទ្យ'        // Medical appointment
    ]
  }
  
  const possibleReasons = reasons[status] || [null]
  return possibleReasons[Math.floor(Math.random() * possibleReasons.length)]
}

/**
 * Log with optional verbosity
 */
function log(message, forceShow = false) {
  if (options.verbose || forceShow) {
    console.log(message)
  }
}

// ============================================================================
// MAIN ATTENDANCE GENERATION LOGIC
// ============================================================================

/**
 * Add attendance records for a student in a specific month
 */
async function addAttendanceForStudent(student, course, semester, monthInfo, existingAttendance) {
  const { month, year } = monthInfo
  const schoolDays = getSchoolDays(year, month)
  
  log(`    📅 Month ${month}/${year}: ${schoolDays.length} school days`)
  
  let created = 0
  let skipped = 0
  
  for (const date of schoolDays) {
    const dateString = date.toISOString().split('T')[0]
    
    // Check if attendance already exists
    const exists = existingAttendance.some(att => 
      att.studentId === student.studentId &&
      att.courseId === course.courseId &&
      att.attendanceDate.toISOString().split('T')[0] === dateString
    )
    
    if (exists) {
      skipped++
      continue
    }
    
    // Generate attendance record
    const status = getRandomStatus()
    const reason = getAbsenceReason(status)
    
    await prisma.attendance.create({
      data: {
        studentId: student.studentId,
        courseId: course.courseId,
        semesterId: semester.semesterId,
        schoolYearId: course.schoolYearId,
        attendanceDate: date,
        session: 'FULL',
        status: status,
        reason: reason,
        recordedBy: 'System'
      }
    })
    
    created++
  }
  
  log(`      ✅ Created: ${created}, ⏭️  Skipped (duplicates): ${skipped}`)
  return { created, skipped }
}

/**
 * Main function to generate attendance
 */
async function generateAttendance() {
  console.log('\n' + '='.repeat(70))
  console.log('📊 ATTENDANCE DATA GENERATOR - Auto Mode')
  console.log('='.repeat(70))
  console.log('\n⚙️  Configuration:')
  console.log(`   School Year: ${options.specificSchoolYear || 'All'}`)
  console.log(`   Grades: ${options.specificGrade ? (Array.isArray(options.specificGrade) ? options.specificGrade.join(', ') : options.specificGrade) : 'All'}`)
  console.log(`   Section: ${options.specificSection || 'All'}`)
  console.log(`   Semester: ${options.onlySemester || 'Both'}`)
  console.log(`   Skip Weekends: ${options.skipWeekends ? 'Yes' : 'No'}`)
  console.log(`   Status Rates: Present=${options.statusRates.Present*100}%, Absent=${options.statusRates.Absent*100}%, Late=${options.statusRates.Late*100}%, Permission=${options.statusRates.Permission*100}%`)
  console.log('\n' + '-'.repeat(70))
  
  try {
    // Fetch all necessary data
    console.log('\n📥 Fetching data from database...')
    
    const [schoolYears, semesters, courses, existingAttendance] = await Promise.all([
      prisma.schoolYear.findMany(),
      prisma.semester.findMany(),
      prisma.course.findMany({
        include: {
          enrollments: {
            where: { drop: false },
            include: { student: true }
          }
        }
      }),
      prisma.attendance.findMany()
    ])
    
    console.log(`   ✅ Found ${schoolYears.length} school year(s)`)
    console.log(`   ✅ Found ${semesters.length} semester(s)`)
    console.log(`   ✅ Found ${courses.length} course(s)`)
    console.log(`   ✅ Found ${existingAttendance.length} existing attendance record(s)`)
    
    // Filter school years
    const targetSchoolYear = options.specificSchoolYear 
      ? schoolYears.find(sy => sy.schoolYearCode === options.specificSchoolYear)
      : schoolYears[0]
    
    if (!targetSchoolYear) {
      throw new Error(`School year ${options.specificSchoolYear} not found`)
    }
    
    console.log(`\n🎯 Target School Year: ${targetSchoolYear.schoolYearCode}`)
    
    // Filter courses by school year and grade
    let filteredCourses = courses.filter(c => c.schoolYearId === targetSchoolYear.schoolYearId)
    
    if (options.specificGrade) {
      const grades = Array.isArray(options.specificGrade) ? options.specificGrade : [options.specificGrade]
      filteredCourses = filteredCourses.filter(c => grades.includes(parseInt(c.grade)))
    }
    
    if (options.specificSection) {
      filteredCourses = filteredCourses.filter(c => c.section === options.specificSection)
    }
    
    console.log(`   ✅ Filtered to ${filteredCourses.length} course(s)`)
    
    // Filter semesters
    let targetSemesters = semesters
    if (options.onlySemester) {
      targetSemesters = semesters.filter(s => 
        s.semester.includes(options.onlySemester.toString()) ||
        s.semesterCode.includes(options.onlySemester.toString())
      )
    }
    
    console.log(`   ✅ Processing ${targetSemesters.length} semester(s)`)
    
    // Generate attendance for each course
    let totalCreated = 0
    let totalSkipped = 0
    
    console.log('\n' + '='.repeat(70))
    console.log('🚀 Starting Attendance Generation...')
    console.log('='.repeat(70))
    
    for (const course of filteredCourses) {
      const students = course.enrollments.map(e => e.student)
      
      console.log(`\n📚 ថ្នាក់ទី ${course.grade}${course.section}`)
      console.log(`   👥 ${students.length} student(s) enrolled`)
      
      if (students.length === 0) {
        console.log('   ⚠️  No students enrolled, skipping...')
        continue
      }
      
      for (const semester of targetSemesters) {
        console.log(`\n   📖 ${semester.semester}`)
        
        const months = getMonthsForSemester(semester)
        
        for (const student of students) {
          log(`\n   👤 ${student.lastName} ${student.firstName}`)
          
          for (const monthInfo of months) {
            const result = await addAttendanceForStudent(
              student,
              course,
              semester,
              monthInfo,
              existingAttendance
            )
            
            totalCreated += result.created
            totalSkipped += result.skipped
          }
        }
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(70))
    console.log('✅ ATTENDANCE GENERATION COMPLETE!')
    console.log('='.repeat(70))
    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Created: ${totalCreated} attendance record(s)`)
    console.log(`   ⏭️  Skipped: ${totalSkipped} duplicate(s)`)
    console.log(`   📅 Total: ${totalCreated + totalSkipped} record(s) processed`)
    console.log('\n' + '='.repeat(70) + '\n')
    
  } catch (error) {
    console.error('\n❌ Error generating attendance:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// ============================================================================
// EXECUTION
// ============================================================================

if (require.main === module) {
  generateAttendance()
    .then(() => {
      console.log('✅ Script completed successfully!\n')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { generateAttendance }

