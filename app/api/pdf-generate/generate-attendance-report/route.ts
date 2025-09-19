import { NextRequest, NextResponse } from 'next/server'
import { PDFManager } from '@/lib/pdf-generators/core/pdf-manager'
import { ReportType } from '@/lib/pdf-generators/core/types'
import { AttendanceReportData } from '@/lib/pdf-generators/reports/attendance-report-daily'
import { generateYearlyAttendanceReportPDF } from '@/lib/pdf-generators/reports/attendance-report-yearly'
import { prisma } from '@/lib/prisma'

const pdfManager = new PDFManager()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportType, startDate, endDate, academicYear, month, year, semester, class: className, grade, format } = body
    
    // Log request for debugging
    console.log('Attendance report request:', { reportType, month, year, className })

    // Convert course ID to actual class name if needed
    let actualClassName = className
    if (className && !isNaN(Number(className))) {
      // className is a course ID, need to look up the actual class name
      const course = await prisma.course.findUnique({
        where: { courseId: parseInt(className) },
        select: { grade: true, section: true }
      })
      if (course) {
        actualClassName = `${course.grade}${course.section}`
        console.log('Converted course ID to class name:', { courseId: className, className: actualClassName })
      }
    }

    // Fetch attendance data based on report type
    let attendanceData: AttendanceReportData

    switch (reportType) {
      case 'daily':
        attendanceData = await generateDailyAttendanceData(startDate, endDate, actualClassName, grade)
        break
      case 'monthly':
        attendanceData = await generateMonthlyAttendanceData(academicYear, month, year, actualClassName, grade, actualClassName)
        break
      case 'semester':
        attendanceData = await generateSemesterAttendanceData(academicYear, semester, actualClassName, grade, actualClassName)
        break
      case 'yearly':
        attendanceData = await generateYearlyAttendanceData(academicYear, actualClassName, grade, actualClassName)
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // Generate PDF with appropriate report type
    let pdfReportType = ReportType.ATTENDANCE_REPORT
    switch (reportType) {
      case 'monthly':
        pdfReportType = ReportType.ATTENDANCE_REPORT_MONTHLY
        break
      case 'semester':
        pdfReportType = ReportType.ATTENDANCE_REPORT_SEMESTER
        break
      case 'yearly':
        pdfReportType = ReportType.ATTENDANCE_REPORT_YEARLY
        break
      default:
        pdfReportType = ReportType.ATTENDANCE_REPORT
    }
    const result = await pdfManager.generatePDF(
      pdfReportType,
      attendanceData,
      {
        format: format === 'excel' ? 'A4' : 'A4',
        orientation: 'portrait',
        margins: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm'
        },
        includeHeader: true,
        includeFooter: true
      }
    )


    // Create safe filename for download
    const safeFilename = `attendance-report-${reportType}-${startDate || 'range'}.pdf`
      .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens

    // Stream PDF directly to client
    return new NextResponse(result.buffer as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Content-Length': result.buffer.length.toString(),
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('❌ Error generating attendance report:', error)
    return NextResponse.json(
      { error: 'Failed to generate attendance report' },
      { status: 500 }
    )
  }
}

// Generate daily attendance data
async function generateDailyAttendanceData(startDate: string, endDate: string, className?: string, grade?: string, schoolYearId?: number): Promise<AttendanceReportData> {
  const whereClause: any = {
    attendanceDate: {
      gte: new Date(startDate),
      lte: new Date(endDate)
    }
  }

  // Note: schoolYearId filtering will be added after Prisma client regeneration

  // Filter by class or grade
  if (className) {
    whereClause.student = {
      class: {
        equals: className
      }
    }
  } else if (grade) {
    whereClause.student = {
      class: {
        contains: grade
      }
    }
  }

  // Debug: Log query parameters
  console.log('Querying attendance:', { startDate, endDate, className, grade })
  console.log('Where clause:', JSON.stringify(whereClause, null, 2))

  let attendanceRecords = await prisma.attendance.findMany({
    where: whereClause,
    include: {
      student: {
        select: {
          studentId: true,
          firstName: true,
          lastName: true,
          class: true,
          gender: true
        }
      },
      course: {
        select: {
          courseName: true
        }
      }
    },
    orderBy: [
      { student: { firstName: 'asc' } },
      { attendanceDate: 'asc' }
    ]
  })

  // If no records found with exact class match, try alternative formats
  if (attendanceRecords.length === 0 && className) {
    console.log('No records found with exact class match, trying alternative formats...')
    
    // Try with different class formats
    const alternativeClasses = [
      className.toLowerCase(),
      className.toUpperCase(),
      `Grade ${className}`,
      `Class ${className}`,
      className.replace(/(\d+)([A-Z])/, '$1 $2'), // "5A" -> "5 A"
      className.replace(/(\d+)([A-Z])/, '$1-$2'), // "5A" -> "5-A"
      className.replace(/(\d+)([A-Z])/, '$1'), // "5A" -> "5" (extract just the grade number)
    ]
    
    for (const altClass of alternativeClasses) {
      if (altClass !== className) {
        console.log(`Trying alternative class format: "${altClass}"`)
        const altRecords = await prisma.attendance.findMany({
          where: {
            ...whereClause,
            student: {
              class: {
                equals: altClass
              }
            }
          },
          include: {
            student: {
              select: {
                studentId: true,
                firstName: true,
                lastName: true,
                class: true,
                gender: true
              }
            },
            course: {
              select: {
                courseName: true
              }
            }
          },
          orderBy: [
            { student: { firstName: 'asc' } },
            { attendanceDate: 'asc' }
          ]
        })
        
        if (altRecords.length > 0) {
          console.log(`Found ${altRecords.length} records with class format: "${altClass}"`)
          attendanceRecords = altRecords
          break
        }
      }
    }
  }

  console.log('Found attendance records:', attendanceRecords.length)
  
  // Debug: Log actual class values found
  if (attendanceRecords.length > 0) {
    const uniqueClasses = [...new Set(attendanceRecords.map(record => record.student.class))]
    console.log('Actual class values in database:', uniqueClasses)
  }

  // Process attendance data
  const studentMap = new Map()
  let totalPresent = 0
  let totalAbsent = 0
  let totalLate = 0
  let totalExcused = 0

  attendanceRecords.forEach(record => {
    const studentId = record.studentId.toString()
    if (!studentMap.has(studentId)) {
      studentMap.set(studentId, {
        studentId,
        firstName: record.student.firstName,
        lastName: record.student.lastName,
        class: record.student.class,
        gender: record.student.gender,
        attendance: {
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0,
          rate: 0
        },
        details: []
      })
    }

    const student = studentMap.get(studentId)
    student.attendance.total++
    student.details.push({
      date: record.attendanceDate.toISOString().split('T')[0],
      attendanceDate: record.attendanceDate,
      status: record.status as 'present' | 'absent' | 'late' | 'excused',
      session: record.session as 'AM' | 'PM' | 'FULL',
      courseName: record.course.courseName,
      remarks: record.reason || undefined
    })

    // Count sessions: AM/PM = 1, FULL = 2
    const sessionCount = record.session === 'FULL' ? 2 : 1
    
    switch (record.status) {
      case 'present':
        student.attendance.present += sessionCount
        totalPresent += sessionCount
        break
      case 'absent':
        student.attendance.absent += sessionCount
        totalAbsent += sessionCount
        break
      case 'late':
        student.attendance.late += sessionCount
        totalLate += sessionCount
        break
      case 'excused':
        student.attendance.excused += sessionCount
        totalExcused += sessionCount
        break
    }
  })

  // Calculate attendance rates
  const students = Array.from(studentMap.values())
  students.forEach(student => {
    student.attendance.rate = student.attendance.total > 0 
      ? (student.attendance.present / student.attendance.total) * 100 
      : 0
  })

  const totalStudents = students.length
  const totalRecords = totalPresent + totalAbsent + totalLate + totalExcused
  const attendanceRate = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0

  // Generate class summary
  const classSummary = generateClassSummary(students)

  // Generate title with date range
  const title = generateAttendanceTitle(startDate, endDate)

  return {
    reportType: 'daily',
    title,
    date: startDate,
    startDate,
    endDate,
    schoolName: 'សាលាមិត្តភាព',
    totalStudents,
    totalPresent,
    totalAbsent,
    totalLate,
    totalExcused,
    attendanceRate,
    students,
    summary: {
      byClass: classSummary,
      byStatus: {
        present: totalPresent,
        absent: totalAbsent,
        late: totalLate,
        excused: totalExcused
      },
      trends: []
    }
  }
}

// Generate monthly attendance data
async function generateMonthlyAttendanceData(academicYear: string, month: string, year: string, className?: string, grade?: string, actualClassName?: string): Promise<AttendanceReportData> {
  // Get daily data for the month
  const startDate = `${year}-${month.padStart(2, '0')}-01`
  // Fix: Get the last day of the current month - increment month to get last day of current month
  const lastDayOfMonth = new Date(parseInt(year), parseInt(month) + 1, 0)
  const endDate = lastDayOfMonth.toISOString().split('T')[0]
  
  console.log('Monthly report:', { month, year, startDate, endDate, className })
  
  const dailyData = await generateDailyAttendanceData(startDate, endDate, className, grade)
  
  console.log('Monthly data results:', { studentCount: dailyData.students.length })
  
  // Check if we have any data for the selected month
  if (dailyData.students.length === 0) {
    console.log('❌ No attendance data found for the selected month/year/class combination')
    
    // Debug: Check what classes are available in the database
    const availableClasses = await prisma.student.findMany({
      select: { class: true },
      distinct: ['class'],
      where: {
        class: {
          not: ''
        }
      }
    })
    console.log('Available classes in database:', availableClasses.map(s => s.class))
    
    // Get available months to suggest to user
    const availableMonths = await prisma.attendance.findMany({
      select: { attendanceDate: true },
      distinct: ['attendanceDate'],
      orderBy: { attendanceDate: 'desc' },
      take: 10
    })
    
    const monthSuggestions = availableMonths.map(record => {
      const date = new Date(record.attendanceDate)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    })
    
    console.log('Available months with data:', monthSuggestions)
    
    // Return empty data with helpful message
    return {
      reportType: 'monthly',
      title: `របាយការណ៍អវត្តមានប្រចាំខែ`,
      date: `${startDate} to ${endDate}`,
      month,
      year,
      class: actualClassName || className, // Add class information even when no data
      schoolName: 'សាលាមិត្តភាព',
      totalStudents: 0,
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
      totalExcused: 0,
      attendanceRate: 0,
      students: [],
      summary: {
        byClass: [],
        byStatus: {
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        },
        trends: []
      },
      errorMessage: `គ្មានទិន្នន័យសម្រាប់ខែ ${month}/${year}។ សូមជ្រើសរើសខែដែលមានទិន្នន័យ។`,
      availableMonths: monthSuggestions
    }
  }

  // Transform to monthly format with aggregated statistics
  const monthlyData: AttendanceReportData = {
    ...dailyData,
    reportType: 'monthly',
    title: `របាយការណ៍អវត្តមានប្រចាំខែ`,
    month,
    year,
    class: actualClassName || className,
    students: dailyData.students.map(student => ({
      ...student,
      monthlyStats: {
        totalDays: student.attendance.total,
        presentDays: student.attendance.present,
        absentDays: student.attendance.absent,
        lateDays: student.attendance.late,
        excusedDays: student.attendance.excused,
        attendanceRate: student.attendance.rate
      }
    }))
  }
  
  return monthlyData
}

// Generate semester attendance data
async function generateSemesterAttendanceData(academicYear: string, semester: string, className?: string, grade?: string, actualClassName?: string): Promise<AttendanceReportData> {
  // Auto-detect academic year based on available data if no data found
  let detectedAcademicYear = academicYear
  let year = academicYear.split('-')[0]
  
  // Get semester date range
  // Academic year format: "2024-2025" means school year 2024-2025
  // Semester 1: Sep 2024 - Dec 2024
  // Semester 2: Jan 2025 - Jun 2025
  let startDate: string
  let endDate: string
  
  if (semester === '1') {
    // Semester 1: September to December of the first year
    startDate = `${year}-09-01`
    endDate = `${year}-12-31`
  } else {
    // Semester 2: January to June of the second year
    const secondYear = parseInt(year) + 1
    startDate = `${secondYear}-01-01`
    endDate = `${secondYear}-06-30`
  }
  
  // Check if we have data in the calculated range
  const testData = await prisma.attendance.findMany({
    where: {
      attendanceDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    },
    take: 1
  })
  
  console.log(`Found ${testData.length} records for ${academicYear} semester ${semester} in date range ${startDate} to ${endDate}`)
  
  // Only if no data found, try to detect the correct academic year
  if (testData.length === 0) {
    console.log('No data found in calculated range, attempting to detect correct academic year...')
    
    // Get all attendance dates to find the correct year
    const allDates = await prisma.attendance.findMany({
      select: { attendanceDate: true },
      distinct: ['attendanceDate'],
      orderBy: { attendanceDate: 'desc' },
      take: 10
    })
    
    if (allDates.length > 0) {
      const latestDate = new Date(allDates[0].attendanceDate)
      const dataYear = latestDate.getFullYear()
      const dataMonth = latestDate.getMonth() + 1
      
      // Determine academic year based on data
      let detectedYear
      if (dataMonth >= 9) {
        // Data is in Sep-Dec, so academic year starts this year
        detectedYear = dataYear
      } else {
        // Data is in Jan-Jun, so academic year started last year
        detectedYear = dataYear - 1
      }
      
      const nextYear = detectedYear + 1
      detectedAcademicYear = `${detectedYear}-${nextYear}`
      year = detectedYear.toString()
      
      console.log(`Detected academic year: ${detectedAcademicYear} based on data from ${dataYear}-${dataMonth.toString().padStart(2, '0')}`)
      
      // Recalculate dates with detected year
      if (semester === '1') {
        startDate = `${year}-09-01`
        endDate = `${year}-12-31`
      } else {
        const secondYear = parseInt(year) + 1
        startDate = `${secondYear}-01-01`
        endDate = `${secondYear}-06-30`
      }
    }
  } else {
    console.log(`Using requested academic year: ${academicYear}`)
  }
  
  console.log('Semester report:', { semester, academicYear, startDate, endDate, className })
  
  const dailyData = await generateDailyAttendanceData(startDate, endDate, className, grade)
  
  console.log('Semester data results:', { studentCount: dailyData.students.length })
  
  // Check if we have any data for the selected semester
  if (dailyData.students.length === 0) {
    console.log('❌ No attendance data found for the selected semester/year/class combination')
    
    // Debug: Check what classes are available in the database
    const availableClasses = await prisma.student.findMany({
      select: { class: true },
      distinct: ['class'],
      where: {
        class: {
          not: ''
        }
      }
    })
    console.log('Available classes in database:', availableClasses.map(s => s.class))
    
    // Get available semesters to suggest to user
    const availableAttendance = await prisma.attendance.findMany({
      select: { attendanceDate: true },
      distinct: ['attendanceDate'],
      orderBy: { attendanceDate: 'desc' },
      take: 20
    })
    
    const semesterSuggestions = availableAttendance.map(record => {
      const date = new Date(record.attendanceDate)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      if (month >= 9 || month <= 6) {
        return `${year}-${year + 1}`
      }
      return null
    }).filter(Boolean)
    
    console.log('Available semesters with data:', [...new Set(semesterSuggestions)])
    
    // Return empty data with helpful message
    return {
      reportType: 'semester',
      title: `របាយការណ៍អវត្តមានប្រចាំឆមាស`,
      date: `${startDate} to ${endDate}`,
      semester,
      academicYear: detectedAcademicYear,
      class: actualClassName || className, // Add class information even when no data
      schoolName: 'សាលាមិត្តភាព',
      totalStudents: 0,
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
      totalExcused: 0,
      attendanceRate: 0,
      students: [],
      summary: {
        byClass: [],
        byStatus: {
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        },
        trends: []
      },
      errorMessage: `គ្មានទិន្នន័យសម្រាប់ឆមាស ${semester}/${detectedAcademicYear}។ សូមជ្រើសរើសឆមាសដែលមានទិន្នន័យ។`
    }
  }
  
  // Transform to semester format with monthly breakdown
  const semesterData: AttendanceReportData = {
    ...dailyData,
    reportType: 'semester',
    title: `របាយការណ៍អវត្តមានប្រចាំឆមាស`,
    semester,
    academicYear: detectedAcademicYear,
    class: actualClassName || className,
    students: dailyData.students.map(student => ({
      ...student,
      semesterStats: {
        totalDays: student.attendance.total,
        presentDays: student.attendance.present,
        absentDays: student.attendance.absent,
        lateDays: student.attendance.late,
        excusedDays: student.attendance.excused,
        attendanceRate: student.attendance.rate,
        monthlyBreakdown: generateMonthlyBreakdown(student.details, startDate, endDate)
      }
    }))
  }
  
  return semesterData
}

// Generate yearly attendance data
async function generateYearlyAttendanceData(academicYear: string, className?: string, grade?: string, actualClassName?: string): Promise<AttendanceReportData> {
  // Get yearly date range
  const year = academicYear.split('-')[0]
  const startDate = `${year}-09-01`
  const endDate = `${parseInt(year) + 1}-06-30`
  
  console.log('Yearly report:', { academicYear, startDate, endDate, className })
  const dailyData = await generateDailyAttendanceData(startDate, endDate, className, grade)
  console.log('Yearly data results:', { studentCount: dailyData.students.length })
  
  // Check if we have any data for the selected year
  if (dailyData.students.length === 0) {
    console.log('❌ No attendance data found for the selected academic year/class combination')
    
    // Debug: Check what classes are available in the database
    const availableClasses = await prisma.student.findMany({
      select: { class: true },
      distinct: ['class'],
      orderBy: { class: 'asc' }
    })
    
    console.log('Available classes:', availableClasses.map(c => c.class))
    
    // Get available academic years to suggest to user
    const availableAttendance = await prisma.attendance.findMany({
      select: { attendanceDate: true },
      distinct: ['attendanceDate'],
      orderBy: { attendanceDate: 'desc' },
      take: 20
    })
    
    const yearSuggestions = availableAttendance.map(record => {
      const date = new Date(record.attendanceDate)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      if (month >= 9 || month <= 6) {
        return `${year}-${year + 1}`
      }
      return null
    }).filter(Boolean)
    
    console.log('Available academic years:', [...new Set(yearSuggestions)])
    
    return {
      reportType: 'yearly',
      title: `របាយការណ៍អវត្តមានប្រចាំឆ្នាំ`,
      date: `${startDate} to ${endDate}`,
      yearly: academicYear,
      academicYear,
      class: actualClassName || className,
      schoolName: 'សាលាមិត្តភាព',
      totalStudents: 0,
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
      totalExcused: 0,
      attendanceRate: 0,
      students: [],
      summary: {
        byClass: [],
        byStatus: { present: 0, absent: 0, late: 0, excused: 0 },
        trends: []
      },
      errorMessage: `គ្មានទិន្នន័យសម្រាប់ឆ្នាំសិក្សា ${academicYear}។ សូមជ្រើសរើសឆ្នាំសិក្សាដែលមានទិន្នន័យ។`
    }
  }
  
  // Transform to yearly format
  const yearlyData: AttendanceReportData = {
    ...dailyData,
    reportType: 'yearly',
    title: `របាយការណ៍អវត្តមានប្រចាំឆ្នាំ`,
    yearly: academicYear,
    academicYear,
    class: actualClassName || className,
    students: dailyData.students.map(student => ({
      ...student,
      yearlyStats: {
        presentDays: student.attendance.present,
        absentDays: student.attendance.absent,
        lateDays: student.attendance.late,
        excusedDays: student.attendance.excused,
        totalDays: student.attendance.total,
        attendanceRate: student.attendance.rate
      }
    }))
  }
  
  return yearlyData
}

// Helper function to generate monthly breakdown
function generateMonthlyBreakdown(details: any[], startDate: string, endDate: string): any[] {
  const monthlyData: { [key: string]: any } = {}
  
  details.forEach(detail => {
    const date = new Date(detail.date)
    const month = date.getMonth() + 1
    const monthKey = `${month}`
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: getMonthName(month.toString()),
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        excusedDays: 0,
        attendanceRate: 0
      }
    }
    
    switch (detail.status) {
      case 'present':
        monthlyData[monthKey].presentDays++
        break
      case 'absent':
        monthlyData[monthKey].absentDays++
        break
      case 'late':
        monthlyData[monthKey].lateDays++
        break
      case 'excused':
        monthlyData[monthKey].excusedDays++
        break
    }
  })
  
  // Calculate attendance rates
  Object.values(monthlyData).forEach((month: any) => {
    const total = month.presentDays + month.absentDays + month.lateDays + month.excusedDays
    month.attendanceRate = total > 0 ? (month.presentDays / total) * 100 : 0
  })
  
  return Object.values(monthlyData)
}

// Helper function to generate semester breakdown
function generateSemesterBreakdown(details: any[], year: string): any[] {
  const semester1Data = details.filter(d => {
    const date = new Date(d.date)
    const month = date.getMonth() + 1
    return month >= 9 && month <= 12
  })
  
  const semester2Data = details.filter(d => {
    const date = new Date(d.date)
    const month = date.getMonth() + 1
    return month >= 1 && month <= 6
  })
  
  return [
    {
      semester: '1',
      ...calculateSemesterStats(semester1Data),
      monthlyBreakdown: generateMonthlyBreakdown(semester1Data, `${year}-09-01`, `${year}-12-31`)
    },
    {
      semester: '2',
      ...calculateSemesterStats(semester2Data),
      monthlyBreakdown: generateMonthlyBreakdown(semester2Data, `${parseInt(year) + 1}-01-01`, `${parseInt(year) + 1}-06-30`)
    }
  ]
}

// Helper function to calculate semester stats
function calculateSemesterStats(details: any[]): any {
  let presentDays = 0
  let absentDays = 0
  let lateDays = 0
  let excusedDays = 0
  
  details.forEach(detail => {
    switch (detail.status) {
      case 'present':
        presentDays++
        break
      case 'absent':
        absentDays++
        break
      case 'late':
        lateDays++
        break
      case 'excused':
        excusedDays++
        break
    }
  })
  
  const total = presentDays + absentDays + lateDays + excusedDays
  const attendanceRate = total > 0 ? (presentDays / total) * 100 : 0
  
  return {
    presentDays,
    absentDays,
    lateDays,
    excusedDays,
    attendanceRate
  }
}

// Helper function to get month name
function getMonthName(month: string): string {
  const monthNames = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ]
  
  const monthIndex = parseInt(month) - 1
  return monthNames[monthIndex] || month
}

// Generate class summary
function generateClassSummary(students: any[]): any[] {
  const classMap = new Map()
  
  students.forEach(student => {
    const className = student.class
    if (!classMap.has(className)) {
      classMap.set(className, {
        className,
        totalStudents: 0,
        attendanceRate: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0
      })
    }
    
    const classData = classMap.get(className)
    classData.totalStudents++
    classData.present += student.attendance.present
    classData.absent += student.attendance.absent
    classData.late += student.attendance.late
    classData.excused += student.attendance.excused
  })
  
  // Calculate class attendance rates
  Array.from(classMap.values()).forEach(classData => {
    const total = classData.present + classData.absent + classData.late + classData.excused
    classData.attendanceRate = total > 0 ? (classData.present / total) * 100 : 0
  })
  
  return Array.from(classMap.values())
}

// Generate attendance title with date range
function generateAttendanceTitle(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Khmer month names
  const monthNames = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ]
  
  const startDay = start.getDate()
  const startMonth = monthNames[start.getMonth()]
  const startYear = start.getFullYear()
  
  const endDay = end.getDate()
  const endMonth = monthNames[end.getMonth()]
  const endYear = end.getFullYear()
  
  return `បញ្ជីអវត្តមាន ${startDay}, ${startMonth} ${startYear} - ${endDay}, ${endMonth} ${endYear}`
}
