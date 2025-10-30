// UPDATED: 2025-10-30 - Apply attendance penalty to ALL months including last month (yearly subject calculation)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pdfManager } from '@/lib/pdf-generators/core/pdf-manager'
import { ReportType } from '@/lib/pdf-generators/core/types'
import { MonthlyGradeReportData } from '@/lib/pdf-generators/reports/grade-report-monthly'
import { SemesterGradeReportData } from '@/lib/pdf-generators/reports/grade-report-semester'
import { YearlyGradeReportData } from '@/lib/pdf-generators/reports/grade-report-yearly'
import { logActivity, ActivityMessages } from '@/lib/activity-logger'

// Helper Functions
function getLetterGrade(score: number, gradeNum: number): string {
  // A to F grading system based on grade level
  if (gradeNum >= 1 && gradeNum <= 6) {
    // Grades 1-6: Full average is 10
    if (score >= 9) return 'A'   // ល្អ​ប្រសើរ = មធ្យមភាគ x ០,៩
    if (score >= 8) return 'B'   // ល្អ​ណាស់ = មធ្យមភាគ x ០,៨
    if (score >= 7) return 'C'   // ល្អ = មធ្យមភាគ x ០,៧
    if (score >= 6) return 'D'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៦
    if (score >= 5) return 'E'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៥
    return 'F' // ខ្សោយ
  } else {
    // Grades 7-9: Full average is 50
    if (score >= 45) return 'A'   // ល្អ​ប្រសើរ = មធ្យមភាគ x ០,៩
    if (score >= 40) return 'B'   // ល្អ​ណាស់ = មធ្យមភាគ x ០,៨
    if (score >= 35) return 'C'   // ល្អ = មធ្យមភាគ x ០,៧
    if (score >= 30) return 'D'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៦
    if (score >= 25) return 'E'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៥
    return 'F' // ខ្សោយ
  }
}

function sortDatesByYearMonth(dates: string[]): string[] {
  return dates.sort((a, b) => {
    const [monthA, yearA] = a.split('/')
    const [monthB, yearB] = b.split('/')
    const yearCompare = yearA.localeCompare(yearB)
    if (yearCompare !== 0) return yearCompare
    return parseInt(monthA) - parseInt(monthB)
  })
}

function calculateGradeAverage(total: number, gradeNum: number, uniqueSubjects: number): number {
  if (gradeNum >= 1 && gradeNum <= 6) {
    return uniqueSubjects > 0 ? total / uniqueSubjects : 0
  } else if (gradeNum >= 7 && gradeNum <= 8) {
    return total / 14
  } else if (gradeNum === 9) {
    return total / 8.4
  } else {
    return uniqueSubjects > 0 ? total / uniqueSubjects : 0
  }
}

function calculateSemesterAverage(
  grades: any[],
  semesterText: string,
  gradeNum: number
): { lastMonthAverage: number; previousMonthsAverage: number; overallAverage: number } {
  const dates = [...new Set(grades.map(g => g.gradeDate))].filter(Boolean)
  const sortedDates = sortDatesByYearMonth(dates)
  
  if (sortedDates.length === 0) {
    return { lastMonthAverage: 0, previousMonthsAverage: 0, overallAverage: 0 }
  }

  const lastMonth = sortedDates[sortedDates.length - 1]
  const previousMonths = sortedDates.slice(0, -1)

  // Last month calculation
  const lastMonthGrades = grades.filter(g => g.gradeDate === lastMonth)
  const lastMonthTotal = lastMonthGrades.reduce((sum, g) => sum + (g.grade || 0), 0)
  const uniqueSubjects = new Set(lastMonthGrades.map(g => g.subject?.subjectName)).size
  const lastMonthAverage = calculateGradeAverage(lastMonthTotal, gradeNum, uniqueSubjects)

  // Previous months calculation
  const monthlyTotals: number[] = []
  previousMonths.forEach(month => {
    const monthGrades = grades.filter(g => g.gradeDate === month)
    if (monthGrades.length > 0) {
      const monthTotal = monthGrades.reduce((sum, g) => sum + (g.grade || 0), 0)
      monthlyTotals.push(monthTotal)
    }
  })

  const previousMonthsTotalAverage = monthlyTotals.length > 0 
    ? monthlyTotals.reduce((sum, total) => sum + total, 0) / monthlyTotals.length 
    : 0

  const previousMonthsAverage = calculateGradeAverage(previousMonthsTotalAverage, gradeNum, uniqueSubjects)
  const overallAverage = (lastMonthAverage + previousMonthsAverage) / 2

  return { lastMonthAverage, previousMonthsAverage, overallAverage }
}

/**
 * Calculate semester averages with per-month attendance penalties
 * Applies attendance penalty to ALL months including the last month
 * 
 * @param grades - All grades for the semester
 * @param semesterText - Semester identifier (e.g., 'ឆមាសទី ១')
 * @param gradeNum - Grade level for calculation formula
 * @param studentId - Student ID for attendance lookup
 * @param calculateAbsences - Function to calculate absences for a date range
 * @returns Object containing lastMonthAverage (with penalty), previousMonthsAverage (with penalties), and overallAverage
 */
async function calculateSemesterAverageWithAttendance(
  grades: any[],
  semesterText: string,
  gradeNum: number,
  studentId: number,
  calculateAbsences: (studentId: number, startDate: Date, endDate: Date) => Promise<number>
): Promise<{ lastMonthAverage: number; previousMonthsAverage: number; overallAverage: number }> {
  const dates = [...new Set(grades.map(g => g.gradeDate))].filter(Boolean)
  const sortedDates = sortDatesByYearMonth(dates)
  
  if (sortedDates.length === 0) {
    return { lastMonthAverage: 0, previousMonthsAverage: 0, overallAverage: 0 }
  }

  const lastMonth = sortedDates[sortedDates.length - 1]
  const previousMonths = sortedDates.slice(0, -1)

  // Last month calculation (base grade, will apply penalty later)
  const lastMonthGrades = grades.filter(g => g.gradeDate === lastMonth)
  const lastMonthTotal = lastMonthGrades.reduce((sum, g) => sum + (g.grade || 0), 0)
  const uniqueSubjects = new Set(lastMonthGrades.map(g => g.subject?.subjectName)).size
  const lastMonthBaseAverage = calculateGradeAverage(lastMonthTotal, gradeNum, uniqueSubjects)

  // Previous months calculation WITH PER-MONTH ATTENDANCE PENALTIES
  const monthlyAveragesWithPenalty: number[] = []
  
  for (const month of previousMonths) {
    // Get grades for this month
    const monthGrades = grades.filter(g => g.gradeDate === month)
    if (monthGrades.length === 0) continue
    
    const monthTotal = monthGrades.reduce((sum, g) => sum + (g.grade || 0), 0)
    const monthUniqueSubjects = new Set(monthGrades.map(g => g.subject?.subjectName)).size
    // Use grade-specific formula (1-6: /subjects, 7-8: /14, 9: /8.4)
    const monthAverage = calculateGradeAverage(monthTotal, gradeNum, monthUniqueSubjects)
    
    // Calculate attendance for this specific month
    const [monthStr, yearStr] = month.split('/')
    const monthNum = parseInt(monthStr)
    const yearNum = parseInt('20' + yearStr)
    const monthStart = new Date(yearNum, monthNum - 1, 1)
    const monthEnd = new Date(yearNum, monthNum, 0, 23, 59, 59)
    
    const monthAbsences = await calculateAbsences(studentId, monthStart, monthEnd)
    
    // Apply attendance penalty: Up to 10% deduction (every 4 absences = 10% penalty, max 10%)
    // Perfect attendance (0 absences) = 100% of grade, Maximum penalty = 90% of grade
    const penaltyRate = Math.min(monthAbsences / 4, 1) * 0.1
    const adjustedMonthAverage = monthAverage * (1 - penaltyRate)
    
    monthlyAveragesWithPenalty.push(adjustedMonthAverage)
    
    console.log(`    Month ${month}: Avg ${monthAverage.toFixed(2)}, Absences ${monthAbsences.toFixed(2)}, Adjusted ${adjustedMonthAverage.toFixed(2)}`)
  }

  // Average of all previous months (already adjusted for attendance per month)
  const previousMonthsAverage = monthlyAveragesWithPenalty.length > 0 
    ? monthlyAveragesWithPenalty.reduce((sum, avg) => sum + avg, 0) / monthlyAveragesWithPenalty.length 
    : 0
  
  // Apply attendance penalty to LAST MONTH as well
  const [lastMonthStr, lastYearStr] = lastMonth.split('/')
  const lastMonthNum = parseInt(lastMonthStr)
  const lastYearNum = parseInt('20' + lastYearStr)
  const lastMonthStart = new Date(lastYearNum, lastMonthNum - 1, 1)
  const lastMonthEnd = new Date(lastYearNum, lastMonthNum, 0, 23, 59, 59)
  
  const lastMonthAbsences = await calculateAbsences(studentId, lastMonthStart, lastMonthEnd)
  const lastMonthPenaltyRate = Math.min(lastMonthAbsences / 4, 1) * 0.1
  const lastMonthAverage = lastMonthBaseAverage * (1 - lastMonthPenaltyRate)
  
  console.log(`    Last Month ${lastMonth}: Base Avg ${lastMonthBaseAverage.toFixed(2)}, Absences ${lastMonthAbsences.toFixed(2)}, Adjusted ${lastMonthAverage.toFixed(2)}`)
  
  // Overall average includes last month (with penalty) + previous months average (with penalties)
  const overallAverage = (lastMonthAverage + previousMonthsAverage) / 2

  console.log(`    Previous Months Avg (with per-month attendance): ${previousMonthsAverage.toFixed(2)}`)
  console.log(`    Overall Semester Avg: ${overallAverage.toFixed(2)}`)

  return { lastMonthAverage, previousMonthsAverage, overallAverage }
}

function createSubjectObject(grade: any, gradeNum: number) {
  return {
    subjectName: grade.subject?.subjectName || 'Unknown Subject',
    grade: grade.grade || 0,
    maxGrade: 100,
    percentage: ((grade.grade || 0) / 100) * 100,
    letterGrade: getLetterGrade(grade.grade || 0, gradeNum)
  }
}

function createNoDataStructure(academicYear: string, className?: string) {
  return {
    academicYear,
    month: '',
    year: '',
    semester: '',
    class: '',
    section: '',
    startDate: '',
    endDate: '',
    students: [],
    summary: {
      totalStudents: 0,
      averageGrade: 0,
      highestGrade: 0,
      lowestGrade: 0,
      gradeDistribution: { excellent: 0, good: 0, average: 0, poor: 0 },
      classAverage: 0,
      passRate: 0,
      droppedStudentsCount: 0,
      femaleDroppedStudentsCount: 0
    },
    generatedAt: new Date().toISOString()
  }
}

function getCourseInfo(students: any[]): { grade: string; section: string } {
  if (students.length === 0) return { grade: '', section: '' }
  
  const firstStudent = students[0]
  const enrollment = firstStudent.enrollments.find((e: any) => !e.drop)
  
  if (enrollment?.course) {
    return {
      grade: enrollment.course.grade || '',
      section: enrollment.course.section || ''
    }
  }
  
  return { grade: '', section: '' }
}

function createSafeFilename(reportType: string, academicYear: string, className?: string): string {
  return `grade-report-${reportType}-${academicYear}${className ? `-${className}` : ''}.pdf`
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, '-')
}

/**
 * Calculate total absences for a student within a date range
 * Uses weighted formula: (totalExcused × 0.5) + totalAbsent
 * @param studentId - Student ID
 * @param startDate - Start date of period
 * @param endDate - End date of period
 * @returns Total absences (weighted)
 */
async function calculateStudentAbsences(studentId: number, startDate: Date, endDate: Date): Promise<number> {
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      studentId,
      attendanceDate: {
        gte: startDate,
        lte: endDate
      }
    }
  })

  let totalAbsent = 0
  let totalExcused = 0

  attendanceRecords.forEach(record => {
    const sessionCount = record.session === 'FULL' ? 2 : 1
    
    switch (record.status) {
      case 'absent':
        totalAbsent += sessionCount
        break
      case 'excused':
        totalExcused += sessionCount
        break
    }
  })

  // Apply weighted formula: excused counts as 0.5, absent counts as 1
  const totalAbsences = (totalExcused * 0.5) + totalAbsent
  return totalAbsences
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportType, academicYear, month, year, semester, class: className, startDate, endDate, userId } = body

    // Validate required fields
    if (!reportType || !academicYear) {
      return NextResponse.json(
        { success: false, error: 'Report type and academic year are required' },
        { status: 400 }
      )
    }

    if (reportType === 'yearly' && !className) {
      return NextResponse.json(
        { success: false, error: 'Class is required for yearly reports' },
        { status: 400 }
      )
    }

    // Build where clause
    const whereClause: any = { schoolYear: academicYear }
    if (className) {
      whereClause.enrollments = {
        some: { courseId: parseInt(className), drop: false }
      }
    }

    // Fetch students
    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        grades: { include: { subject: true, semester: true } },
        enrollments: { include: { course: true } }
      },
      orderBy: [{ class: 'asc' }, { firstName: 'asc' }, { lastName: 'asc' }]
    })

    // Handle no students case
    if (students.length === 0) {
      let noDataCourseInfo = { grade: '', section: '' }
      if (className) {
        const course = await prisma.course.findUnique({
          where: { courseId: parseInt(className) },
          include: { schoolYear: true }
        })
        if (course?.schoolYear?.schoolYearCode === academicYear) {
          noDataCourseInfo = { grade: course?.grade || '', section: course?.section || '' }
        }
      }

      const noDataCommonData = {
        ...createNoDataStructure(academicYear, className),
        class: noDataCourseInfo.grade,
        section: noDataCourseInfo.section
      }

      let reportTypeEnum: ReportType
      let reportData: any

      switch (reportType) {
        case 'monthly':
          reportTypeEnum = ReportType.GRADE_REPORT_MONTHLY
          reportData = { ...noDataCommonData, reportType: 'monthly' } as MonthlyGradeReportData
          break
        case 'semester':
          reportTypeEnum = ReportType.GRADE_REPORT_SEMESTER
          reportData = { ...noDataCommonData, reportType: 'semester' } as SemesterGradeReportData
          break
        case 'yearly':
          reportTypeEnum = ReportType.GRADE_REPORT_YEARLY
          reportData = { ...noDataCommonData, reportType: 'yearly' } as YearlyGradeReportData
          break
        default:
          return NextResponse.json(
            { success: false, error: `Unsupported report type: ${reportType}` },
            { status: 400 }
          )
      }

      const result = await pdfManager.generatePDF(reportTypeEnum, reportData)
      const safeFilename = createSafeFilename(reportType, academicYear, className) + '-no-data.pdf'

      return new NextResponse(result.buffer as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${safeFilename}"`,
          'Content-Length': result.buffer.length.toString(),
          'Cache-Control': 'no-cache'
        }
      })
    }

    // Extract semester months for semester reports
    let semesterMonths: string[] = []
    let lastSemesterMonth = ''
    let previousSemesterMonths: string[] = []
    
    if (reportType === 'semester' && semester) {
      const semesterText = semester === '1' ? 'ឆមាសទី ១' : semester === '2' ? 'ឆមាសទី ២' : semester
      
      const allGradeDates = new Set<string>()
      students.forEach(student => {
        student.grades.forEach(grade => {
          if (grade.semester?.semester === semesterText && grade.gradeDate) {
            allGradeDates.add(grade.gradeDate)
          }
        })
      })
      
      semesterMonths = sortDatesByYearMonth(Array.from(allGradeDates))
      
      if (semesterMonths.length > 0) {
        lastSemesterMonth = semesterMonths[semesterMonths.length - 1]
        previousSemesterMonths = semesterMonths.slice(0, -1)
      }
    }

    // Process student data
    const processedStudents = await Promise.all(students.map(async student => {
      const gradeNum = parseInt(student.class) || 0
      let filteredGrades = student.grades
      let semesterData: any = {}
      let yearlySubjects: any[] = []
      let averageGrade = 0
      
      if (reportType === 'monthly' && month && year) {
        const targetDate = `${month.padStart(2, '0')}/${year.slice(-2)}`
        filteredGrades = student.grades.filter(grade => grade.gradeDate === targetDate)
      } else if (reportType === 'semester' && semester) {
        const semesterText = semester === '1' ? 'ឆមាសទី ១' : semester === '2' ? 'ឆមាសទី ២' : semester
        
        const lastMonthGrades = student.grades.filter(grade => 
          grade.semester?.semester === semesterText && grade.gradeDate === lastSemesterMonth
        )
        const previousMonthsGrades = student.grades.filter(grade => 
          grade.semester?.semester === semesterText && previousSemesterMonths.includes(grade.gradeDate || '')
        )
        
        filteredGrades = lastMonthGrades
        
        const lastMonthSubjects = lastMonthGrades.map(grade => createSubjectObject(grade, gradeNum))
        const lastMonthTotal = lastMonthSubjects.reduce((sum, subject) => sum + subject.grade, 0)
        
        // Use attendance-aware calculation that applies penalties per-month
        console.log(`  Calculating semester averages for student ${student.studentId} with per-month attendance:`)
        const { lastMonthAverage, previousMonthsAverage, overallAverage } = await calculateSemesterAverageWithAttendance(
          [...lastMonthGrades, ...previousMonthsGrades],
          semesterText,
          gradeNum,
          student.studentId,
          calculateStudentAbsences
        )
        
        semesterData = {
          lastMonthTotal,
          lastMonthAverage,
          previousMonthsAverage,
          overallSemesterAverage: overallAverage
        }
      } else if (reportType === 'yearly') {
        const semester1Grades = student.grades.filter(grade => grade.semester?.semester === 'ឆមាសទី ១')
        const semester2Grades = student.grades.filter(grade => grade.semester?.semester === 'ឆមាសទី ២')
        
        // Get unique subjects from both semesters
        const allSubjects = new Set<string>()
        semester1Grades.forEach(grade => {
          if (grade.subject?.subjectName) allSubjects.add(grade.subject.subjectName)
        })
        semester2Grades.forEach(grade => {
          if (grade.subject?.subjectName) allSubjects.add(grade.subject.subjectName)
        })
        
        // Calculate average grade for each subject using semester logic WITH ATTENDANCE PENALTIES
        yearlySubjects = await Promise.all(Array.from(allSubjects).map(async subjectName => {
          const sem1SubjectGrades = semester1Grades.filter(g => g.subject?.subjectName === subjectName)
          const sem2SubjectGrades = semester2Grades.filter(g => g.subject?.subjectName === subjectName)
          
          const sem1Dates = [...new Set(sem1SubjectGrades.map(g => g.gradeDate))].filter(Boolean)
          const sem2Dates = [...new Set(sem2SubjectGrades.map(g => g.gradeDate))].filter(Boolean)
          
          const sem1SortedDates = sortDatesByYearMonth(sem1Dates)
          const sem2SortedDates = sortDatesByYearMonth(sem2Dates)
          
          const sem1LastMonth = sem1SortedDates[sem1SortedDates.length - 1]
          const sem2LastMonth = sem2SortedDates[sem2SortedDates.length - 1]
          
          const sem1LastMonthBaseGrade = sem1SubjectGrades.find(g => g.gradeDate === sem1LastMonth)?.grade || 0
          const sem2LastMonthBaseGrade = sem2SubjectGrades.find(g => g.gradeDate === sem2LastMonth)?.grade || 0
          
          const sem1PreviousMonths = sem1SortedDates.slice(0, -1)
          const sem2PreviousMonths = sem2SortedDates.slice(0, -1)
          
          // Calculate Semester 1 previous months WITH ATTENDANCE PENALTY
          const sem1AdjustedMonthGrades: number[] = []
          for (const month of sem1PreviousMonths) {
            const monthGrade = sem1SubjectGrades.find(g => g.gradeDate === month)?.grade || 0
            
            // Get attendance for this month
            const [monthStr, yearStr] = month.split('/')
            const monthNum = parseInt(monthStr)
            const yearNum = parseInt('20' + yearStr)
            const monthStart = new Date(yearNum, monthNum - 1, 1)
            const monthEnd = new Date(yearNum, monthNum, 0, 23, 59, 59)
            
            const monthAbsences = await calculateStudentAbsences(typeof student.studentId === 'string' ? parseInt(student.studentId) : student.studentId, monthStart, monthEnd)
            const penaltyRate = Math.min(monthAbsences / 4, 1) * 0.1
            const adjustedGrade = monthGrade * (1 - penaltyRate)
            sem1AdjustedMonthGrades.push(adjustedGrade)
          }
          
          // Calculate Semester 2 previous months WITH ATTENDANCE PENALTY
          const sem2AdjustedMonthGrades: number[] = []
          for (const month of sem2PreviousMonths) {
            const monthGrade = sem2SubjectGrades.find(g => g.gradeDate === month)?.grade || 0
            
            // Get attendance for this month
            const [monthStr, yearStr] = month.split('/')
            const monthNum = parseInt(monthStr)
            const yearNum = parseInt('20' + yearStr)
            const monthStart = new Date(yearNum, monthNum - 1, 1)
            const monthEnd = new Date(yearNum, monthNum, 0, 23, 59, 59)
            
            const monthAbsences = await calculateStudentAbsences(typeof student.studentId === 'string' ? parseInt(student.studentId) : student.studentId, monthStart, monthEnd)
            const penaltyRate = Math.min(monthAbsences / 4, 1) * 0.1
            const adjustedGrade = monthGrade * (1 - penaltyRate)
            sem2AdjustedMonthGrades.push(adjustedGrade)
          }
          
          const sem1PreviousMonthsAverage = sem1AdjustedMonthGrades.length > 0 
            ? sem1AdjustedMonthGrades.reduce((sum, grade) => sum + grade, 0) / sem1AdjustedMonthGrades.length 
            : 0
          const sem2PreviousMonthsAverage = sem2AdjustedMonthGrades.length > 0 
            ? sem2AdjustedMonthGrades.reduce((sum, grade) => sum + grade, 0) / sem2AdjustedMonthGrades.length 
            : 0
          
          // Apply attendance penalty to LAST MONTH as well
          let sem1LastMonthGrade = sem1LastMonthBaseGrade
          if (sem1LastMonth) {
            const [monthStr, yearStr] = sem1LastMonth.split('/')
            const monthNum = parseInt(monthStr)
            const yearNum = parseInt('20' + yearStr)
            const monthStart = new Date(yearNum, monthNum - 1, 1)
            const monthEnd = new Date(yearNum, monthNum, 0, 23, 59, 59)
            const monthAbsences = await calculateStudentAbsences(typeof student.studentId === 'string' ? parseInt(student.studentId) : student.studentId, monthStart, monthEnd)
            const penaltyRate = Math.min(monthAbsences / 4, 1) * 0.1
            sem1LastMonthGrade = sem1LastMonthBaseGrade * (1 - penaltyRate)
          }
          
          let sem2LastMonthGrade = sem2LastMonthBaseGrade
          if (sem2LastMonth) {
            const [monthStr, yearStr] = sem2LastMonth.split('/')
            const monthNum = parseInt(monthStr)
            const yearNum = parseInt('20' + yearStr)
            const monthStart = new Date(yearNum, monthNum - 1, 1)
            const monthEnd = new Date(yearNum, monthNum, 0, 23, 59, 59)
            const monthAbsences = await calculateStudentAbsences(typeof student.studentId === 'string' ? parseInt(student.studentId) : student.studentId, monthStart, monthEnd)
            const penaltyRate = Math.min(monthAbsences / 4, 1) * 0.1
            sem2LastMonthGrade = sem2LastMonthBaseGrade * (1 - penaltyRate)
          }
          
          const sem1SubjectGrade = (sem1LastMonthGrade + sem1PreviousMonthsAverage) / 2
          const sem2SubjectGrade = (sem2LastMonthGrade + sem2PreviousMonthsAverage) / 2
          const subjectAverage = (sem1SubjectGrade + sem2SubjectGrade) / 2
          
          return {
            subjectName,
            grade: subjectAverage,
            maxGrade: 100,
            percentage: (subjectAverage / 100) * 100,
            letterGrade: getLetterGrade(subjectAverage, gradeNum)
          }
        }))
        
        // Calculate semester averages WITH ATTENDANCE
        const sem1Result = await calculateSemesterAverageWithAttendance(
          semester1Grades,
          'ឆមាសទី ១',
          gradeNum,
          typeof student.studentId === 'string' ? parseInt(student.studentId) : student.studentId,
          calculateStudentAbsences
        )
        const sem2Result = await calculateSemesterAverageWithAttendance(
          semester2Grades,
          'ឆមាសទី ២',
          gradeNum,
          typeof student.studentId === 'string' ? parseInt(student.studentId) : student.studentId,
          calculateStudentAbsences
        )
        
        averageGrade = (sem1Result.overallAverage + sem2Result.overallAverage) / 2
        
        semesterData = {
          semester1Average: sem1Result.overallAverage,
          semester2Average: sem2Result.overallAverage
        }
      }
      
      const subjects = reportType === 'yearly' 
        ? yearlySubjects 
        : filteredGrades.map(grade => createSubjectObject(grade, gradeNum))

      const totalGrade = subjects.reduce((sum, subject) => sum + subject.grade, 0)
      
      if (reportType !== 'yearly') {
        averageGrade = calculateGradeAverage(totalGrade, gradeNum, subjects.length)
      }

      // Calculate attendance for monthly and semester reports
      let totalAbsences = 0
      if (reportType === 'monthly' && month && year) {
        const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1)
        const monthEnd = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
        totalAbsences = await calculateStudentAbsences(student.studentId, monthStart, monthEnd)
      } else if (reportType === 'semester' && semester) {
        // Calculate attendance for LAST MONTH of semester only (same as grades)
        // This ensures consistency: if grades are from last month, attendance penalty should be too
        if (lastSemesterMonth) {
          const [monthStr, yearStr] = lastSemesterMonth.split('/')
          const monthNum = parseInt(monthStr)
          const yearNum = parseInt('20' + yearStr)
          
          const monthStart = new Date(yearNum, monthNum - 1, 1)
          const monthEnd = new Date(yearNum, monthNum, 0, 23, 59, 59)
          
          totalAbsences = await calculateStudentAbsences(student.studentId, monthStart, monthEnd)
        }
      }

      return {
        studentId: student.studentId.toString(),
        firstName: student.firstName,
        lastName: student.lastName,
        class: student.class,
        gender: student.gender,
        dob: student.dob.toISOString().split('T')[0],
        subjects,
        totalGrade,
        averageGrade,
        rank: 0,
        status: averageGrade >= 50 ? 'pass' : 'fail',
        totalAbsences,  // Add attendance data for penalty calculation
        ...semesterData
      }
    }))

    // Calculate ranks
    processedStudents.sort((a, b) => b.averageGrade - a.averageGrade)
    processedStudents.forEach((student, index) => {
      student.rank = index + 1
    })

    // Calculate summary statistics
    const totalStudents = processedStudents.length
    const averageGrade = processedStudents.reduce((sum, student) => sum + student.averageGrade, 0) / totalStudents
    const highestGrade = Math.max(...processedStudents.map(s => s.averageGrade))
    const lowestGrade = Math.min(...processedStudents.map(s => s.averageGrade))
    const passRate = (processedStudents.filter(s => s.status === 'pass').length / totalStudents) * 100

    const gradeDistribution = {
      excellent: processedStudents.filter(s => s.averageGrade >= 90).length,
      good: processedStudents.filter(s => s.averageGrade >= 80 && s.averageGrade < 90).length,
      average: processedStudents.filter(s => s.averageGrade >= 70 && s.averageGrade < 80).length,
      poor: processedStudents.filter(s => s.averageGrade < 70).length
    }

    // Calculate dropped students count
    const droppedStudents = students.filter(student => 
      student.enrollments.some(enrollment => enrollment.drop === true)
    )
    const droppedStudentsCount = droppedStudents.length
    
    const femaleDroppedStudentsCount = droppedStudents.filter(student => {
      const gender = student.gender.toLowerCase()
      return gender === 'female' || gender === 'f' || gender === 'ស្រី' || gender === 'ស'
    }).length

    const courseInfo = getCourseInfo(students)

    // Prepare common data structure
    const commonData = {
      academicYear,
      month,
      year,
      semester,
      class: courseInfo.grade,
      section: courseInfo.section,
      startDate,
      endDate,
      students: processedStudents,
      semesterMonths,
      lastSemesterMonth,
      previousSemesterMonths,
      summary: {
        totalStudents,
        averageGrade,
        highestGrade,
        lowestGrade,
        gradeDistribution,
        classAverage: averageGrade,
        passRate,
        droppedStudentsCount,
        femaleDroppedStudentsCount
      },
      generatedAt: new Date().toISOString()
    }

    // Route to appropriate specialized generator
    let result: any
    let reportTypeEnum: ReportType
    let reportData: any

    switch (reportType) {
      case 'monthly':
        reportTypeEnum = ReportType.GRADE_REPORT_MONTHLY
        reportData = { ...commonData, reportType: 'monthly' } as MonthlyGradeReportData
        break
      case 'semester':
        reportTypeEnum = ReportType.GRADE_REPORT_SEMESTER
        reportData = { ...commonData, reportType: 'semester' } as SemesterGradeReportData
        break
      case 'yearly':
        reportTypeEnum = ReportType.GRADE_REPORT_YEARLY
        reportData = { ...commonData, reportType: 'yearly' } as YearlyGradeReportData
        break
      default:
        return NextResponse.json(
          { success: false, error: `Unsupported report type: ${reportType}` },
          { status: 400 }
        )
    }

    result = await pdfManager.generatePDF(reportTypeEnum, reportData)
    const safeFilename = createSafeFilename(reportType, academicYear, className)

    // Log activity
    if (userId) {
      await logActivity(
        userId,
        ActivityMessages.GENERATE_GRADE_REPORT,
        `បង្កើតរបាយការណ៍ពិន្ទុ ${reportType} - ${className || 'ទាំងអស់'}`
      )
    }

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
    console.error('Error generating grade report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate grade report' },
      { status: 500 }
    )
  }
}