// UPDATED: 2025-10-30 - Fixed grade-specific divisor for semester monthly averages
// UPDATED: 2025-10-30 - Added per-month attendance penalty to yearly subject calculations
// UPDATED: 2025-10-30 - Apply attendance penalty to LAST MONTH as well (all months penalized consistently)
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { prisma } from '@/lib/prisma'
import { pdfManager } from '@/lib/pdf-generators/core/pdf-manager'
import { ReportType } from '@/lib/pdf-generators/core/types'
import { logActivity, ActivityMessages } from '@/lib/activity-logger'
// Removed import - using gradebook-report-monthly-specific.ts instead
import { MonthlyGradebookReportData, generateMonthlyGradebookReportHTML } from '../../../../lib/pdf-generators/reports/gradebook-report-monthly'
import { SemesterGradebookReportData } from '../../../../lib/pdf-generators/reports/gradebook-report-semester'
import { YearlyGradebookReportData } from '../../../../lib/pdf-generators/reports/gradebook-report-yearly'

// Local type definitions (moved from removed files)
interface StudentGradebookData {
  academicYear: string
  month: string
  year: string
  class: string
  section?: string
  student: {
    studentId: string
    firstName: string
    lastName: string
    gender: string
    dob: string
    photo?: string
    subjects: any[]
    totalGrade: number
    averageGrade: number
    rank: number
    attendance: any
  }
  generatedAt: string
}

interface GradebookReportData {
  reportType: 'monthly' | 'semester' | 'yearly'
  academicYear: string
  month?: string
  year?: string
  semester?: string
  class?: string
  startDate?: string
  endDate?: string
  courses: any[]
  overallSummary: any
  generatedAt: string
}

// Resolve and embed student photo as data URL for reliable PDF rendering
function getStudentPhotoDataUrl(photoField?: string | null): string | undefined {
  try {
    if (!photoField) return undefined
    // If already a data URL or absolute URL, pass through
    if (photoField.startsWith('data:image/')) return photoField
    if (photoField.startsWith('http://') || photoField.startsWith('https://')) return photoField
    // Normalize common cases:
    // - '/uploads/foo.jpg' → resolve under public
    // - 'uploads/foo.jpg' → resolve under public
    // - bare filename → resolve under public/uploads
    const publicDir = path.join(process.cwd(), 'public')
    let filePath = ''
    if (photoField.startsWith('/uploads/')) {
      filePath = path.join(publicDir, photoField)
    } else if (photoField.startsWith('uploads/')) {
      filePath = path.join(publicDir, photoField)
    } else if (photoField.includes('/') || photoField.includes('\\')) {
      // Relative path provided
      filePath = path.isAbsolute(photoField) ? photoField : path.join(publicDir, photoField)
    } else {
      // Just a filename
      filePath = path.join(publicDir, 'uploads', photoField)
    }

    if (!fs.existsSync(filePath)) return undefined
    const ext = path.extname(filePath).toLowerCase()
    const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
    const data = fs.readFileSync(filePath)
    const base64 = data.toString('base64')
    return `data:${mime};base64,${base64}`
  } catch (e) {
    console.warn('Photo embed failed, continuing without photo:', e)
    return undefined
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Gradebook API Request:', { body })
    
    const { 
      reportType, 
      academicYear, 
      month, 
      year,
      userId, 
      semester, 
      class: className, 
      section, 
      studentId, 
      startDate, 
      endDate, 
      format 
    } = body

    // Validate required fields
    if (!reportType || !academicYear) {
      console.log('Validation failed: Missing required fields', { reportType, academicYear })
      return NextResponse.json(
        { success: false, error: 'Report type and academic year are required' },
        { status: 400 }
      )
    }

    console.log('Processing gradebook report:', { reportType, academicYear, className })

    // Handle individual student gradebook
    if (reportType === 'student' && studentId) {
      console.log('Handling student gradebook for student:', studentId)
      return await handleStudentGradebook(academicYear, month, year, className, section, studentId, userId)
    }

    // Handle class-wide gradebook (existing functionality)
    console.log('Handling class-wide gradebook')
    return await handleClassGradebook(reportType, academicYear, month, year, semester, className, startDate, endDate, format)
  } catch (error) {
    console.error('Error generating gradebook report:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { success: false, error: `Failed to generate gradebook report: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// Handle individual student gradebook
async function handleStudentGradebook(
  academicYear: string, 
  month: string, 
  year: string, 
  className: string, 
  section: string | undefined, 
  studentId: string,
  userId?: string
) {
  // Validate required fields for student gradebook
  if (!month || !year || !className || !studentId) {
    return NextResponse.json(
      { success: false, error: 'Academic year, month, year, class, and student ID are required for student gradebook' },
      { status: 400 }
    )
  }

  // Fetch student data
  const student = await prisma.student.findUnique({
    where: { studentId: parseInt(studentId) },
    include: {
      grades: {
        include: {
          subject: true,
          course: {
            include: {
              schoolYear: true
            }
          }
        },
        where: {
          course: {
            schoolYear: {
              schoolYearCode: academicYear
            },
            grade: String(className), // Ensure className is always a string
            section: section || undefined
          }
        }
      },
      attendances: {
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
              schoolYearCode: academicYear
            },
            grade: String(className), // Ensure className is always a string
            section: section || undefined
          }
        }
      }
    }
  })

  if (!student) {
    return NextResponse.json(
      { success: false, error: 'Student not found' },
      { status: 404 }
    )
  }

  // Process student grades
  const gradeNum = parseInt(className) || 0
  const subjects = student.grades.map(grade => {
    const score = (grade as any).score || 0
    const subjectName = grade.subject?.subjectName || 'Unknown Subject'
    const maxScore = getSubjectMaxScore(gradeNum, subjectName)
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
    return {
      subjectName,
      grade: score,
      maxGrade: maxScore,
      percentage,
      letterGrade: getLetterGrade(score, gradeNum, maxScore),
      gradeComment: (grade as any).gradeComment || '' // Use only database gradeComment, show empty if not available
    }
  })

  // Calculate totals
  const totalGrade = subjects.reduce((sum, subject) => sum + subject.grade, 0)
  
  // Calculate average using Grade-Specific Formula (same as grade reports)
  const uniqueSubjects = subjects.length
  const averageGrade = calculateGradeAverage(totalGrade, gradeNum, uniqueSubjects)

  // Process attendance
  const attendanceStats = calculateAttendanceStats(student.attendances)

  // Get student rank (simplified - would need to compare with other students)
  const rank = 1 // This would need to be calculated based on all students in the class

  // Prepare report data
  const reportData: StudentGradebookData = {
    academicYear,
    month,
    year,
    class: className,
    section: section || undefined,
    student: {
      studentId: student.studentId.toString(),
      firstName: student.firstName,
      lastName: student.lastName,
      gender: student.gender,
      dob: student.dob?.toISOString().split('T')[0] || '',
      photo: getStudentPhotoDataUrl((student as any).photo) || undefined,
      subjects,
      totalGrade,
      averageGrade,
      rank,
      attendance: attendanceStats
    },
    generatedAt: new Date().toISOString()
  }

  // Generate PDF
  const result = await pdfManager.generatePDF(ReportType.STUDENT_GRADEBOOK, reportData)

  // Create safe filename for download
  const safeFilename = `student-gradebook-${student.firstName}-${student.lastName}-${academicYear}-${month}-${year}.pdf`
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens

  // Log activity
  if (userId) {
    await logActivity(
      parseInt(userId),
      ActivityMessages.GENERATE_GRADEBOOK,
      `បង្កើតសៀវភៅតាមដាន - ${className || student.firstName}`
    )
  }

  // Stream PDF directly to client
  return new NextResponse(result.buffer as any, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeFilename}"`,
      'Content-Length': result.buffer.length.toString(),
      'Cache-Control': 'no-cache'
    }
  })
}

// Helper Functions (from grade report system)

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


function createSubjectObject(grade: any, gradeNum: number) {
  const subjectName = grade.subject?.subjectName || 'Unknown Subject'
  const score = grade.grade || 0
  const maxScore = getSubjectMaxScore(gradeNum, subjectName)
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
  
  return {
    subjectName,
    grade: score,
    maxGrade: maxScore,
    percentage,
    letterGrade: getLetterGrade(score, gradeNum, maxScore),
    gradeComment: grade.gradeComment || '' // Use only database gradeComment, show empty if not available
  }
}

// Handle class-wide gradebook (enhanced with grade report system logic)
async function handleClassGradebook(
  reportType: string,
  academicYear: string,
  month: string | undefined,
  year: string | undefined,
  semester: string | undefined,
  className: string | undefined,
  startDate: string | undefined,
  endDate: string | undefined,
  format: string | undefined
) {
  try {
    console.log('Fetching courses with criteria:', { academicYear, className, reportType, month, year, semester })
    
    // Initialize semester data variable
    let semesterData: { lastMonthAverage: number; previousMonthsAverage: number; overallSemesterAverage: number } | undefined = undefined
    
    // Define semesterText for semester reports
    const semesterText = reportType === 'semester' && semester 
      ? (semester === '1' ? 'ឆមាសទី ១' : semester === '2' ? 'ឆមាសទី ២' : semester)
      : undefined
    
    // Build enhanced where clause
    let whereClause: any = {
      schoolYear: {
        schoolYearCode: academicYear
      }
    }

    if (className) {
      whereClause.grade = String(className) // Ensure className is always a string
    }

    console.log('Where clause:', JSON.stringify(whereClause, null, 2))

    // Extract semester months for semester reports (to get last month for attendance)
    let lastSemesterMonth = ''
    if (reportType === 'semester' && semester) {
      const semesterTextForDates = semester === '1' ? 'ឆមាសទី ១' : semester === '2' ? 'ឆមាសទី ២' : semester
      
      // Get all grade dates for this semester from all students
      const tempCourses = await prisma.course.findMany({
        where: whereClause,
        include: {
          grades: {
            where: {
              semester: {
                semester: semesterTextForDates
              }
            }
          }
        }
      })
      
      const allGradeDates = new Set<string>()
      tempCourses.forEach(course => {
        course.grades.forEach(grade => {
          if (grade.gradeDate) {
            allGradeDates.add(grade.gradeDate)
          }
        })
      })
      
      const semesterMonths = sortDatesByYearMonth(Array.from(allGradeDates))
      if (semesterMonths.length > 0) {
        lastSemesterMonth = semesterMonths[semesterMonths.length - 1]
        console.log(`Last semester month detected: ${lastSemesterMonth}`)
      }
    }

    // Build attendance filter based on report type (following grade system pattern)
    let attendanceWhereClause: any = {}
    
    if (reportType === 'monthly' && month && year) {
      // For monthly reports: Filter by specific month date range
      const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1)
      const monthEnd = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      attendanceWhereClause.attendanceDate = {
        gte: monthStart,
        lte: monthEnd
      }
      console.log(`Filtering monthly attendance: ${monthStart.toISOString()} to ${monthEnd.toISOString()}`)
    } else if (reportType === 'semester' && semester && lastSemesterMonth) {
      // For semester reports: Filter by LAST MONTH only (same as grades)
      // This ensures consistency: if grades are from last month, attendance penalty should be too
      const [monthStr, yearStr] = lastSemesterMonth.split('/')
      const monthNum = parseInt(monthStr)
      const yearNum = parseInt('20' + yearStr)
      
      const monthStart = new Date(yearNum, monthNum - 1, 1)
      const monthEnd = new Date(yearNum, monthNum, 0, 23, 59, 59)
      
      attendanceWhereClause.attendanceDate = {
        gte: monthStart,
        lte: monthEnd
      }
      console.log(`Filtering semester attendance by LAST MONTH only: ${lastSemesterMonth} (${monthStart.toISOString()} to ${monthEnd.toISOString()})`)
    } else if (reportType === 'yearly') {
      // For yearly reports: Get attendance from both semesters (same as grades)
      attendanceWhereClause.semester = {
        semester: {
          in: ['ឆមាសទី ១', 'ឆមាសទី ២']
        }
      }
      console.log(`Filtering yearly attendance: both semesters (ឆមាសទី ១, ឆមាសទី ២)`)
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        schoolYear: true,
        teacher1: true,
        grades: {
          include: {
            student: true,
            subject: true,
            semester: true
          }
        },
        attendances: {
          where: attendanceWhereClause,  // Apply semester/date filter
          include: {
            student: true,
            semester: true  // Include semester for filtering
          }
        }
      },
      orderBy: [
        { grade: 'asc' },
        { section: 'asc' }
      ]
    })

    console.log(`Found ${courses.length} courses`)
    if (courses.length > 0) {
      console.log('Course details:', courses.map(c => ({
        courseId: c.courseId,
        courseName: c.courseName,
        grade: c.grade,
        section: c.section,
        schoolYear: c.schoolYear?.schoolYearCode,
        gradesCount: c.grades.length
      })))
    }

  if (courses.length === 0) {
    console.log('No courses found - returning 404')
    return NextResponse.json(
      { success: false, error: 'No courses found for the specified criteria' },
      { status: 404 }
    )
  }

  // Process course data for gradebook report with enhanced logic
  const processedCourses = await Promise.all(courses.map(async course => {
    const gradeNum = parseInt(String(course.grade)) || 0
    
    // Get unique students for this course
    const studentIds = [...new Set(course.grades.map(grade => grade.studentId))]
    const studentsRaw = await Promise.all(studentIds.map(async studentId => {
      const student = course.grades.find(g => g.studentId === studentId)?.student
      if (!student) return null

      // Get grades for this student in this course with enhanced filtering
      let studentGrades = course.grades.filter(g => g.studentId === studentId)
      
      // Apply report type filtering
      if (reportType === 'monthly' && month && year) {
        const targetDate = `${month.padStart(2, '0')}/${year.slice(-2)}`
        console.log('Monthly filtering - targetDate:', targetDate)
        console.log('Available grade dates:', studentGrades.map(g => g.gradeDate))
        studentGrades = studentGrades.filter(grade => grade.gradeDate === targetDate)
        console.log('Filtered grades count:', studentGrades.length)
      } else if (reportType === 'semester' && semester) {
        // Get all grades for the semester (not just last month)
        const allSemesterGrades = studentGrades.filter(grade => grade.semester?.semester === semesterText)
        
        // Calculate semester averages WITH PER-MONTH ATTENDANCE PENALTIES
        const { lastMonthAverage, previousMonthsAverage, overallAverage } = await calculateSemesterAverageWithAttendanceGradebook(
          allSemesterGrades,
          semesterText!,
          gradeNum,
          student.studentId,
          calculateStudentAbsences
        )
        
        // For display, use only the last month's grades
        if (allSemesterGrades.length > 0) {
          const gradeDates = [...new Set(allSemesterGrades.map(g => g.gradeDate))].filter(Boolean)
          const sortedDates = sortDatesByYearMonth(gradeDates)
          const lastMonthDate = sortedDates[sortedDates.length - 1]
          
          console.log('Semester filtering - all dates:', sortedDates)
          console.log('Semester filtering - last month date:', lastMonthDate)
          
          // Filter to only the last month's grades for display
          studentGrades = allSemesterGrades.filter(grade => grade.gradeDate === lastMonthDate)
          console.log('Filtered to last month grades count:', studentGrades.length)
        }
        
        // Store semester calculation results for later use
        semesterData = {
          lastMonthAverage,
          previousMonthsAverage,
          overallSemesterAverage: overallAverage
        }
      }
      
      // Get attendance for this student
      const studentAttendances = course.attendances.filter(a => a.studentId === studentId)
      const attendanceStats = calculateAttendanceStats(studentAttendances)

      // Process subjects with enhanced calculations
      const subjects = studentGrades.map(grade => createSubjectObject(grade, gradeNum))
      
      // Calculate enhanced statistics
      const totalGrade = subjects.reduce((sum, subject) => sum + subject.grade, 0)
      const uniqueSubjects = new Set(subjects.map(s => s.subjectName)).size
      const averageGrade = calculateGradeAverage(totalGrade, gradeNum, uniqueSubjects)
      
      // Process assignments and tests with better data
      const assignments = subjects.map(subject => ({
        assignmentName: subject.subjectName,
        grade: subject.grade,
        maxGrade: subject.maxGrade,
        percentage: subject.percentage,
        dueDate: new Date().toISOString(),
        status: subject.grade >= 50 ? 'completed' : 'incomplete'
      }))

      const tests = subjects.map(subject => ({
        testName: `${subject.subjectName} - ${reportType === 'semester' ? semester : 'Final'}`,
        grade: subject.grade,
        maxGrade: subject.maxGrade,
        percentage: subject.percentage,
        date: new Date().toISOString(),
        type: 'Final'
      }))

      // Enhanced final grade calculation
      const finalGrade = averageGrade
      const letterGrade = getLetterGrade(finalGrade, gradeNum)
      
      // Enhanced status calculation
      const passThreshold = gradeNum >= 1 && gradeNum <= 6 ? 5 : 25
      const status = finalGrade >= passThreshold ? 'pass' : 'fail'

      return {
        studentId: student?.studentId.toString() || '',
        firstName: student?.firstName || '',
        lastName: student?.lastName || '',
        gender: student?.gender || '',
        photo: getStudentPhotoDataUrl((student as any).photo) || undefined,
        attendance: attendanceStats,
        assignments,
        tests,
        subjects, // Add subjects data
        totalGrade, // Add total grade
        averageGrade, // Add average grade
        finalGrade,
        letterGrade,
        status
      }
    }))
    
    // Filter out null values after Promise resolves
    const students = studentsRaw.filter(Boolean)

    // Calculate enhanced course summary with comprehensive statistics
    const totalStudents = students.length
    const validStudents = students.filter(s => s && s.finalGrade > 0)
    
    // Basic statistics
    const averageGrade = validStudents.length > 0 
      ? validStudents.reduce((sum, student) => sum + (student?.finalGrade || 0), 0) / validStudents.length 
      : 0
    
    const attendanceRate = students.length > 0
      ? students.reduce((sum, student) => sum + (student?.attendance?.rate || 0), 0) / students.length
      : 0
    
    const completionRate = students.length > 0
      ? (students.filter(s => s?.status === 'pass').length / students.length) * 100
      : 0
    
    // Enhanced statistics (from grade report system)
    const grades = validStudents.map(s => s?.finalGrade || 0)
    const highestGrade = grades.length > 0 ? Math.max(...grades) : 0
    const lowestGrade = grades.length > 0 ? Math.min(...grades) : 0
    
    // Grade distribution
    const gradeDistribution = {
      excellent: validStudents.filter(s => (s?.finalGrade || 0) >= (gradeNum >= 1 && gradeNum <= 6 ? 8 : 40)).length,
      good: validStudents.filter(s => {
        const grade = s?.finalGrade || 0
        return grade >= (gradeNum >= 1 && gradeNum <= 6 ? 6 : 30) && grade < (gradeNum >= 1 && gradeNum <= 6 ? 8 : 40)
      }).length,
      average: validStudents.filter(s => {
        const grade = s?.finalGrade || 0
        return grade >= (gradeNum >= 1 && gradeNum <= 6 ? 4 : 20) && grade < (gradeNum >= 1 && gradeNum <= 6 ? 6 : 30)
      }).length,
      poor: validStudents.filter(s => (s?.finalGrade || 0) < (gradeNum >= 1 && gradeNum <= 6 ? 4 : 20)).length
    }
    
    // Pass rate calculation
    const passThreshold = gradeNum >= 1 && gradeNum <= 6 ? 5 : 25
    const passRate = validStudents.length > 0
      ? (validStudents.filter(s => (s?.finalGrade || 0) >= passThreshold).length / validStudents.length) * 100
      : 0

    return {
      courseId: course.courseId.toString(),
      courseName: course.courseName,
      grade: course.grade,
      section: course.section,
      teacher: course.teacher1?.firstname + ' ' + course.teacher1?.lastname || 'Unknown Teacher',
      students,
      summary: {
        totalStudents,
        averageGrade,
        highestGrade,
        lowestGrade,
        attendanceRate,
        completionRate,
        passRate,
        gradeDistribution
      }
    }
  }))

  // Calculate enhanced overall summary
  const totalCourses = processedCourses.length
  const allStudents = processedCourses.flatMap(course => course.students)
  const totalStudents = [...new Set(allStudents.map(s => s?.studentId || ''))].length
  
  // Overall statistics
  const overallAverageGrade = processedCourses.length > 0
    ? processedCourses.reduce((sum, course) => sum + course.summary.averageGrade, 0) / processedCourses.length
    : 0
  
  const overallAttendanceRate = processedCourses.length > 0
    ? processedCourses.reduce((sum, course) => sum + course.summary.attendanceRate, 0) / processedCourses.length
    : 0
  
  const overallCompletionRate = processedCourses.length > 0
    ? processedCourses.reduce((sum, course) => sum + course.summary.completionRate, 0) / processedCourses.length
    : 0
  
  const overallPassRate = processedCourses.length > 0
    ? processedCourses.reduce((sum, course) => sum + course.summary.passRate, 0) / processedCourses.length
    : 0
  
  // Overall grade distribution
  const overallGradeDistribution = {
    excellent: processedCourses.reduce((sum, course) => sum + course.summary.gradeDistribution.excellent, 0),
    good: processedCourses.reduce((sum, course) => sum + course.summary.gradeDistribution.good, 0),
    average: processedCourses.reduce((sum, course) => sum + course.summary.gradeDistribution.average, 0),
    poor: processedCourses.reduce((sum, course) => sum + course.summary.gradeDistribution.poor, 0)
  }
  
  // Overall highest and lowest grades
  const allGrades = allStudents.map(s => s?.finalGrade || 0).filter(grade => grade > 0)
  const overallHighestGrade = allGrades.length > 0 ? Math.max(...allGrades) : 0
  const overallLowestGrade = allGrades.length > 0 ? Math.min(...allGrades) : 0

  // Prepare report data
  const reportData: GradebookReportData = {
    reportType: reportType as 'monthly' | 'semester' | 'yearly',
    academicYear,
    month,
    year,
    semester,
    class: className,
    startDate,
    endDate,
    courses: processedCourses as any,
    overallSummary: {
      totalCourses,
      totalStudents,
      averageGrade: overallAverageGrade,
      highestGrade: overallHighestGrade,
      lowestGrade: overallLowestGrade,
      attendanceRate: overallAttendanceRate,
      completionRate: overallCompletionRate,
      passRate: overallPassRate,
      gradeDistribution: overallGradeDistribution
    },
    generatedAt: new Date().toISOString()
  }

  // Generate PDF based on report type
  let pdfReportType: ReportType
  let finalReportData: any = reportData

  console.log('Final report data:', {
    reportType: reportData.reportType,
    month: reportData.month,
    year: reportData.year,
    academicYear: reportData.academicYear,
    coursesCount: reportData.courses.length,
    totalStudents: reportData.overallSummary.totalStudents
  })
  
  if (reportData.reportType === 'monthly') {
    pdfReportType = ReportType.GRADEBOOK_REPORT_MONTHLY
    
    // For monthly reports, generate individual student reports for all students
    const firstCourse = courses[0]
    const courseSection = firstCourse?.section || ''
    
    // Process all students for individual monthly gradebook reports
    const validStudents = allStudents.filter(student => student !== null)
    
    // Calculate adjusted grades for all students BEFORE ranking
    const studentsWithAdjusted = validStudents.map(student => {
      // Calculate attendance for this student
      const studentAttendances = firstCourse.attendances?.filter((attendance: any) => attendance.studentId === parseInt(student.studentId)) || []
      const attendanceStats = calculateAttendanceStats(studentAttendances)
      const totalAbsences = (attendanceStats.excused * 0.5) + attendanceStats.absent
      
      // Calculate adjusted average (attendance penalty applied)
      const calculatedStudent = calculateStudentData(student, className || '9')
      const adjustedAverage = calculatedStudent.averageGrade * (1 - Math.min(totalAbsences / 4, 1) * 0.1)
      
      return {
        ...student,
        originalAverageGrade: calculatedStudent.averageGrade,
        adjustedAverageGrade: adjustedAverage,
        totalAbsences: totalAbsences
      }
    })
    
    // Sort students by ADJUSTED average grade for ranking
    studentsWithAdjusted.sort((a, b) => (b.adjustedAverageGrade || 0) - (a.adjustedAverageGrade || 0))
    
    // Calculate subject ranks for all students
    const subjectRanks = calculateSubjectRanks(studentsWithAdjusted)
    
    // Calculate ranks for all students BEFORE generating reports (to avoid circular dependency)
    const studentRanks = new Array(studentsWithAdjusted.length)
    let currentRank = 1
    for (let i = 0; i < studentsWithAdjusted.length; i++) {
      if (i === 0) {
        currentRank = 1
        studentRanks[i] = '1'
      } else {
        const currentAvg = studentsWithAdjusted[i]?.adjustedAverageGrade || 0
        const previousAvg = studentsWithAdjusted[i - 1]?.adjustedAverageGrade || 0
        if (Math.abs(currentAvg - previousAvg) < 0.01) {
          // Same average = same rank (tie), keep currentRank unchanged
          studentRanks[i] = studentRanks[i - 1]
        } else {
          // Different average = update to current position
          currentRank = i + 1
          studentRanks[i] = currentRank.toString()
        }
      }
    }
    
    // Generate individual student reports
    console.log(`Processing ${studentsWithAdjusted.length} students for monthly gradebook`)
    const individualReports = studentsWithAdjusted.map((student, index) => {
      try {
        // Validate student data
        if (!student || !student.firstName || !student.lastName) {
          throw new Error(`Invalid student data at index ${index}`)
        }
        
        // Calculate student data with proper ranking and status
        const calculatedStudent = calculateStudentData(student, className || '9')
        
        // Use pre-calculated rank
        const studentRank = studentRanks[index]
        
        // Calculate monthly attendance for this student
        const studentAttendances = firstCourse.attendances?.filter((attendance: any) => attendance.studentId === parseInt(student.studentId)) || []
        const monthlyAttendanceStats = calculateAttendanceStats(studentAttendances)
        
        // Add subject ranks to each subject
        const subjectsWithRanks = (student.subjects || []).map(subject => {
          const subjectRank = subjectRanks[subject.subjectName]?.[student.studentId] || 'N/A'
          return {
            ...subject,
            subjectRank: subjectRank
          }
        })
        
        console.log(`Student ${index + 1}: ${student.firstName} ${student.lastName} - Rank: ${studentRank}, Original Average: ${calculatedStudent.averageGrade}, Adjusted Average: ${student.adjustedAverageGrade}`)
        console.log(`Monthly Attendance:`, {
          rawRecords: studentAttendances.length,
          weightedStats: monthlyAttendanceStats,
          totalAbsences: student.totalAbsences
        })
        
        return {
        reportType: 'monthly' as const,
        academicYear,
        month: month || '',
        year: year || '',
        class: className,
        section: courseSection,
        student: {
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          gender: student.gender,
          photo: getStudentPhotoDataUrl((student as any).photo) || undefined,
          subjects: subjectsWithRanks,
          totalGrade: calculatedStudent.totalGrade,
          averageGrade: calculatedStudent.averageGrade,
          rank: studentRank,
          status: calculatedStudent.status,
          attendance: monthlyAttendanceStats
        },
        generatedAt: new Date().toISOString()
      }
      } catch (error) {
        console.error(`Error processing student ${index + 1}:`, error)
        throw new Error(`Failed to process student ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })
    
    // Generate combined PDF with all students
    if (individualReports.length > 0) {
      try {
        console.log(`Attempting to generate combined PDF for ${individualReports.length} students`)
        
        // Generate combined PDF with all students
        const combinedPdfBuffer = await generateCombinedMonthlyGradebookPDF(individualReports)
        
        const safeFilename = `monthly-gradebook-${academicYear}-${className || 'all'}-${month || 'unknown'}-${year || 'unknown'}.pdf`
        
        console.log(`Successfully generated PDF: ${safeFilename}`)
        
        return new NextResponse(combinedPdfBuffer as BodyInit, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${safeFilename}"`,
            'Content-Length': combinedPdfBuffer.length.toString(),
            'Cache-Control': 'no-cache'
          }
        })
      } catch (error) {
        console.error('Error generating combined monthly gradebook:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        return NextResponse.json(
          { success: false, error: `Failed to generate combined monthly gradebook: ${errorMessage}` },
          { status: 500 }
        )
      }
    } else {
      console.log('No students found for monthly gradebook report')
      return NextResponse.json(
        { success: false, error: 'No students found for monthly gradebook report' },
        { status: 404 }
      )
    }
  } else if (reportData.reportType === 'semester') {
    // Handle semester gradebook similar to monthly - generate individual student reports
    console.log('Handling semester gradebook report for individual students')
    
    // Process all students for individual semester gradebook reports
    const validStudents = allStudents.filter(student => student !== null)
    
    if (validStudents && validStudents.length > 0) {
      // Get section from first course
      const firstCourse = courses[0]
      const courseSection = firstCourse?.section || ''
      
      // First, calculate semester averages for all students (with async attendance calculation)
      const studentsWithSemesterData = await Promise.all(validStudents.map(async student => {
        const classLevel = className || '1'
        const processedStudent = calculateStudentData(student, classLevel)
        
        // Calculate semester averages for this specific student
        const studentGrades = firstCourse.grades?.filter((grade: any) => grade.studentId === parseInt(student.studentId)) || []
        const studentSemesterGrades = semesterText ? (studentGrades.filter((grade: any) => {
          const semesterMatch = grade.semester?.semester === semesterText
          return semesterMatch
        }) || []) : []
        
        // Use attendance-aware calculation that applies penalties per-month
        const gradeNum = parseInt(classLevel) || 0  // Use classLevel (e.g., "9") instead of processedStudent.class
        const { lastMonthAverage: studentLastMonthAverage, previousMonthsAverage: studentPreviousMonthsAverage, overallAverage: studentOverallAverage } = semesterText ? await calculateSemesterAverageWithAttendanceGradebook(
          studentSemesterGrades,
          semesterText,
          gradeNum,  // Now correctly passes 9 instead of 0
          parseInt(student.studentId),
          calculateStudentAbsences
        ) : { lastMonthAverage: 0, previousMonthsAverage: 0, overallAverage: 0 }
        
        // Calculate semester attendance for this student (LAST MONTH ONLY - for grade penalty)
        const studentAttendances = firstCourse.attendances?.filter((attendance: any) => attendance.studentId === parseInt(student.studentId)) || []
        const semesterAttendanceStats = calculateAttendanceStats(studentAttendances)
        
        // Calculate total absences for attendance penalty (last month only)
        const totalAbsences = (semesterAttendanceStats.excused * 0.5) + semesterAttendanceStats.absent
        
        // Calculate FULL SEMESTER attendance (ALL months) - for display in "អវត្តមានប្រចាំឆមាស"
        const allSemesterAttendances = firstCourse.grades?.filter((g: any) => 
          g.studentId === parseInt(student.studentId) && 
          g.semester?.semester === semesterText
        ) || []
        
        // Get all attendance for this student in this semester (not filtered by last month)
        const fullSemesterAttendances = await prisma.attendance.findMany({
          where: {
            studentId: parseInt(student.studentId),
            courseId: firstCourse.courseId,
            semester: {
              semester: semesterText
            }
          }
        })
        
        const fullSemesterAttendanceStats = calculateAttendanceStats(fullSemesterAttendances)
        
        console.log(`Student ${student.studentId} (${student.firstName} ${student.lastName}) - Semester Attendance:`, {
          lastMonthOnly: {
            records: studentAttendances.length,
            stats: semesterAttendanceStats,
            totalAbsences: totalAbsences
          },
          fullSemester: {
            records: fullSemesterAttendances.length,
            stats: fullSemesterAttendanceStats,
            totalAbsences: (fullSemesterAttendanceStats.excused * 0.5) + fullSemesterAttendanceStats.absent
          }
        })
        
        return {
          ...student,
          ...processedStudent,
          monthlyAverage: studentPreviousMonthsAverage || 0,
          overallSemesterAverage: studentOverallAverage || processedStudent.averageGrade,
          totalAbsences: totalAbsences,  // For grade penalty (last month only)
          attendance: semesterAttendanceStats,  // Last month only (for backward compatibility)
          fullSemesterAttendance: fullSemesterAttendanceStats  // NEW: Full semester attendance for display
        }
      }))
      
      // Calculate different types of ranks for all students
      const { semesterRanks, monthlyRanks, overallRanks } = calculateSemesterRanks(studentsWithSemesterData)
      
      // Sort students by overall semester average for ranking (same as grade-report-semester.ts)
      const sortedStudents = [...studentsWithSemesterData].sort((a, b) => (b.overallSemesterAverage || 0) - (a.overallSemesterAverage || 0))
      
      // Calculate subject ranks for all students
      const subjectRanks = calculateSubjectRanks(sortedStudents)
      
      // Calculate ranks for all students BEFORE generating reports (to avoid circular dependency)
      const studentRanks = new Array(sortedStudents.length)
      let currentRank = 1
      for (let i = 0; i < sortedStudents.length; i++) {
        if (i === 0) {
          currentRank = 1
          studentRanks[i] = '1'
        } else {
          const currentAvg = sortedStudents[i]?.overallSemesterAverage || 0
          const previousAvg = sortedStudents[i - 1]?.overallSemesterAverage || 0
          if (Math.abs(currentAvg - previousAvg) < 0.01) {
            // Same average = same rank (tie), keep currentRank unchanged
            studentRanks[i] = studentRanks[i - 1]
          } else {
            // Different average = update to current position
            currentRank = i + 1
            studentRanks[i] = currentRank.toString()
          }
        }
      }
      
      // Generate individual report data for each student
      const individualReports = sortedStudents.map((student, index) => {
        // Add subject ranks to each subject
        const subjectsWithRanks = (student.subjects || []).map((subject: any) => {
          const subjectRank = subjectRanks[subject.subjectName]?.[student.studentId] || 'N/A'
          return {
            ...subject,
            subjectRank: subjectRank
          }
        })
        
        // Use pre-calculated rank
        const studentRank = studentRanks[index]
        
        const semesterGradebookData: SemesterGradebookReportData = {
          reportType: 'semester',
          academicYear: academicYear,
          semester: semester || '1',
          year: year || new Date().getFullYear().toString(),
          class: className,
          section: courseSection,
          student: {
            ...student,
            photo: getStudentPhotoDataUrl((student as any).photo) || undefined,
            subjects: subjectsWithRanks,
            monthlyAverage: student.monthlyAverage || 0, // Previous months average
            overallSemesterAverage: student.overallSemesterAverage || 0, // Overall semester average
            rank: studentRank,
            semesterRank: semesterRanks[student.studentId]?.toString() || 'N/A',
            monthlyRank: monthlyRanks[student.studentId]?.toString() || 'N/A',
            overallRank: overallRanks[student.studentId]?.toString() || 'N/A',
            totalAbsences: student.totalAbsences || 0, // For attendance penalty calculation
            attendance: student.attendance || {
              absent: 0,
              late: 0,
              excused: 0,
              total: 0,
              rate: 0
            },
            fullSemesterAttendance: student.fullSemesterAttendance || {
              absent: 0,
              late: 0,
              excused: 0,
              total: 0,
              rate: 0
            }
          },
          generatedAt: new Date().toISOString()
        }
        
        return semesterGradebookData
      })
      
      console.log(`Generated ${individualReports.length} individual semester gradebook reports`)
      
      // Use combined PDF generation for semester gradebook
      pdfReportType = ReportType.GRADEBOOK_REPORT_SEMESTER_COMBINED
      finalReportData = individualReports
    } else {
      console.log('No students found for semester gradebook report')
      return NextResponse.json(
        { success: false, error: 'No students found for semester gradebook report' },
        { status: 404 }
      )
    }
  } else if (reportData.reportType === 'yearly') {
    // Process yearly gradebook report
    const validStudents = allStudents.filter(student => student !== null)
    
    if (validStudents && validStudents.length > 0) {
      // Get section from first course
      const firstCourse = courses[0]
      const courseSection = firstCourse?.section || ''
      
      // First, calculate yearly averages for all students using the same logic as grade-report-yearly.ts
      const studentsWithYearlyData = await Promise.all(validStudents.map(async student => {
        const classLevel = className || '1'
        const gradeNum = parseInt(classLevel) || 0
        
        // Calculate yearly averages for this specific student
        const studentGrades = firstCourse.grades?.filter((grade: any) => grade.studentId === parseInt(student.studentId)) || []
        
        // Separate grades by semester
        const semester1Grades = studentGrades.filter((grade: any) => grade.semester?.semester === 'ឆមាសទី ១')
        const semester2Grades = studentGrades.filter((grade: any) => grade.semester?.semester === 'ឆមាសទី ២')
        
        // Get unique subjects from both semesters (same logic as grade-report-yearly.ts)
        const allSubjects = new Set<string>()
        semester1Grades.forEach((grade: any) => {
          if (grade.subject?.subjectName) allSubjects.add(grade.subject.subjectName)
        })
        semester2Grades.forEach((grade: any) => {
          if (grade.subject?.subjectName) allSubjects.add(grade.subject.subjectName)
        })
        
        // Calculate average grade for each subject using semester logic (same as grade-report-yearly.ts)
        const yearlySubjects = await Promise.all(Array.from(allSubjects).map(async subjectName => {
          const sem1SubjectGrades = semester1Grades.filter((g: any) => g.subject?.subjectName === subjectName)
          const sem2SubjectGrades = semester2Grades.filter((g: any) => g.subject?.subjectName === subjectName)
          
          const sem1Dates = [...new Set(sem1SubjectGrades.map((g: any) => g.gradeDate))].filter(Boolean)
          const sem2Dates = [...new Set(sem2SubjectGrades.map((g: any) => g.gradeDate))].filter(Boolean)
          
          const sem1SortedDates = sortDatesByYearMonth(sem1Dates)
          const sem2SortedDates = sortDatesByYearMonth(sem2Dates)
          
          const sem1LastMonth = sem1SortedDates[sem1SortedDates.length - 1]
          const sem2LastMonth = sem2SortedDates[sem2SortedDates.length - 1]
          
          const sem1LastMonthBaseGrade = sem1SubjectGrades.find((g: any) => g.gradeDate === sem1LastMonth)?.grade || 0
          const sem2LastMonthBaseGrade = sem2SubjectGrades.find((g: any) => g.gradeDate === sem2LastMonth)?.grade || 0
          
          const sem1PreviousMonths = sem1SortedDates.slice(0, -1)
          const sem2PreviousMonths = sem2SortedDates.slice(0, -1)
          
          // Calculate Semester 1 previous months WITH ATTENDANCE PENALTY
          const sem1AdjustedMonthGrades: number[] = []
          for (const month of sem1PreviousMonths) {
            const monthGrades = sem1SubjectGrades.filter((g: any) => g.gradeDate === month)
            const monthBaseGrade = monthGrades.reduce((monthSum: number, g: any) => monthSum + (g.grade || 0), 0) / Math.max(monthGrades.length, 1)
            
            // Get attendance for this month
            const [monthStr, yearStr] = month.split('/')
            const monthNum = parseInt(monthStr)
            const yearNum = parseInt('20' + yearStr)
            const monthStart = new Date(yearNum, monthNum - 1, 1)
            const monthEnd = new Date(yearNum, monthNum, 0, 23, 59, 59)
            
            const monthAbsences = await calculateStudentAbsences(parseInt(student.studentId), monthStart, monthEnd)
            
            // Apply attendance penalty: Up to 10% deduction (every 4 absences = 10% penalty, max 10%)
            // Perfect attendance (0 absences) = 100% of grade, Maximum penalty = 90% of grade
            const penaltyRate = Math.min(monthAbsences / 4, 1) * 0.1
            const adjustedGrade = monthBaseGrade * (1 - penaltyRate)
            sem1AdjustedMonthGrades.push(adjustedGrade)
          }
          
          // Calculate Semester 2 previous months WITH ATTENDANCE PENALTY
          const sem2AdjustedMonthGrades: number[] = []
          for (const month of sem2PreviousMonths) {
            const monthGrades = sem2SubjectGrades.filter((g: any) => g.gradeDate === month)
            const monthBaseGrade = monthGrades.reduce((monthSum: number, g: any) => monthSum + (g.grade || 0), 0) / Math.max(monthGrades.length, 1)
            
            // Get attendance for this month
            const [monthStr, yearStr] = month.split('/')
            const monthNum = parseInt(monthStr)
            const yearNum = parseInt('20' + yearStr)
            const monthStart = new Date(yearNum, monthNum - 1, 1)
            const monthEnd = new Date(yearNum, monthNum, 0, 23, 59, 59)
            
            const monthAbsences = await calculateStudentAbsences(parseInt(student.studentId), monthStart, monthEnd)
            
            // Apply attendance penalty: Up to 10% deduction (every 4 absences = 10% penalty, max 10%)
            // Perfect attendance (0 absences) = 100% of grade, Maximum penalty = 90% of grade
            const penaltyRate = Math.min(monthAbsences / 4, 1) * 0.1
            const adjustedGrade = monthBaseGrade * (1 - penaltyRate)
            sem2AdjustedMonthGrades.push(adjustedGrade)
          }
          
          const sem1PreviousMonthsAverage = sem1AdjustedMonthGrades.length > 0
            ? sem1AdjustedMonthGrades.reduce((sum, grade) => sum + grade, 0) / sem1AdjustedMonthGrades.length
            : 0
          
          const sem2PreviousMonthsAverage = sem2AdjustedMonthGrades.length > 0
            ? sem2AdjustedMonthGrades.reduce((sum, grade) => sum + grade, 0) / sem2AdjustedMonthGrades.length
            : 0
          
          // Apply attendance penalty to LAST MONTH as well
          // Semester 1 last month
          let sem1LastMonthGrade = sem1LastMonthBaseGrade
          if (sem1LastMonth) {
            const [monthStr, yearStr] = sem1LastMonth.split('/')
            const monthNum = parseInt(monthStr)
            const yearNum = parseInt('20' + yearStr)
            const monthStart = new Date(yearNum, monthNum - 1, 1)
            const monthEnd = new Date(yearNum, monthNum, 0, 23, 59, 59)
            const monthAbsences = await calculateStudentAbsences(parseInt(student.studentId), monthStart, monthEnd)
            const penaltyRate = Math.min(monthAbsences / 4, 1) * 0.1
            sem1LastMonthGrade = sem1LastMonthBaseGrade * (1 - penaltyRate)
          }
          
          // Semester 2 last month
          let sem2LastMonthGrade = sem2LastMonthBaseGrade
          if (sem2LastMonth) {
            const [monthStr, yearStr] = sem2LastMonth.split('/')
            const monthNum = parseInt(monthStr)
            const yearNum = parseInt('20' + yearStr)
            const monthStart = new Date(yearNum, monthNum - 1, 1)
            const monthEnd = new Date(yearNum, monthNum, 0, 23, 59, 59)
            const monthAbsences = await calculateStudentAbsences(parseInt(student.studentId), monthStart, monthEnd)
            const penaltyRate = Math.min(monthAbsences / 4, 1) * 0.1
            sem2LastMonthGrade = sem2LastMonthBaseGrade * (1 - penaltyRate)
          }
          
          const sem1Average = sem1PreviousMonths.length > 0 
            ? (sem1PreviousMonthsAverage + sem1LastMonthGrade) / 2
            : sem1LastMonthGrade
          
          const sem2Average = sem2PreviousMonths.length > 0 
            ? (sem2PreviousMonthsAverage + sem2LastMonthGrade) / 2
            : sem2LastMonthGrade
          
          const subjectAverage = (sem1Average + sem2Average) / 2
          
          // Log subject calculation with attendance adjustments
          if (sem1PreviousMonths.length > 0 || sem2PreviousMonths.length > 0) {
            console.log(`  Subject: ${subjectName}`)
            console.log(`    Sem1: Previous months (adj) = ${sem1PreviousMonthsAverage.toFixed(2)}, Last (adj) = ${sem1LastMonthGrade.toFixed(2)} [base: ${sem1LastMonthBaseGrade}], Avg = ${sem1Average.toFixed(2)}`)
            console.log(`    Sem2: Previous months (adj) = ${sem2PreviousMonthsAverage.toFixed(2)}, Last (adj) = ${sem2LastMonthGrade.toFixed(2)} [base: ${sem2LastMonthBaseGrade}], Avg = ${sem2Average.toFixed(2)}`)
            console.log(`    Yearly Avg = ${subjectAverage.toFixed(2)}`)
          }
          const maxScore = getSubjectMaxScore(gradeNum, subjectName)
          const percentage = maxScore > 0 ? (subjectAverage / maxScore) * 100 : 0
          
          return {
            subjectName: subjectName,
            grade: subjectAverage,
            maxGrade: maxScore,
            percentage,
            letterGrade: getLetterGrade(subjectAverage, gradeNum, maxScore),
            gradeComment: '' // Will be populated later if needed
          }
        }))
        
        // Calculate semester averages WITH ATTENDANCE (match grade-report-yearly.ts)
        const sem1Result = await calculateSemesterAverageWithAttendanceGradebook(
          semester1Grades,
          'ឆមាសទី ១',
          gradeNum,
          parseInt(student.studentId),
          calculateStudentAbsences
        )
        const sem2Result = await calculateSemesterAverageWithAttendanceGradebook(
          semester2Grades,
          'ឆមាសទី ២',
          gradeNum,
          parseInt(student.studentId),
          calculateStudentAbsences
        )
        
        const yearlyAverage = (sem1Result.overallAverage + sem2Result.overallAverage) / 2
        
        // Calculate total grade from yearly subjects
        const totalGrade = yearlySubjects.reduce((sum: number, subject: any) => sum + subject.grade, 0)
        
        // Calculate status based on yearly average
        const status = getGradeStatus(yearlyAverage, classLevel)
        
        // Calculate yearly attendance for this student
        const studentAttendances = firstCourse.attendances?.filter((attendance: any) => attendance.studentId === parseInt(student.studentId)) || []
        const yearlyAttendanceStats = calculateAttendanceStats(studentAttendances)
        
        // Detailed logging for verification
        console.log(`\n====== YEARLY CALC DEBUG - Student ${student.studentId} ${student.firstName} ${student.lastName} (${classLevel}) ======`)
        console.log('Sem1 months:', Array.from(new Set(semester1Grades.map((g: any) => g.gradeDate))).sort())
        console.log('Sem2 months:', Array.from(new Set(semester2Grades.map((g: any) => g.gradeDate))).sort())
        console.log('Sem1:', {
          lastMonthAverage: Number(sem1Result.lastMonthAverage?.toFixed?.(2) ?? sem1Result.lastMonthAverage),
          previousMonthsAverage: Number(sem1Result.previousMonthsAverage?.toFixed?.(2) ?? sem1Result.previousMonthsAverage),
          overallAverage: Number(sem1Result.overallAverage?.toFixed?.(2) ?? sem1Result.overallAverage)
        })
        console.log('Sem2:', {
          lastMonthAverage: Number(sem2Result.lastMonthAverage?.toFixed?.(2) ?? sem2Result.lastMonthAverage),
          previousMonthsAverage: Number(sem2Result.previousMonthsAverage?.toFixed?.(2) ?? sem2Result.previousMonthsAverage),
          overallAverage: Number(sem2Result.overallAverage?.toFixed?.(2) ?? sem2Result.overallAverage)
        })
        console.log('Subject count:', yearlySubjects.length)
        console.log('Totals sent to PDF:', {
          semester1Average: Number(sem1Result.overallAverage?.toFixed?.(2) ?? sem1Result.overallAverage),
          semester2Average: Number(sem2Result.overallAverage?.toFixed?.(2) ?? sem2Result.overallAverage),
          yearlyAverage: Number(yearlyAverage?.toFixed?.(2) ?? yearlyAverage),
          totalGrade: Number(totalGrade?.toFixed?.(2) ?? totalGrade)
        })
        console.log('Attendance (yearly aggregate, for display only):', yearlyAttendanceStats)
        
        return {
          ...student,
          subjects: yearlySubjects,
          totalGrade: totalGrade,
          averageGrade: yearlyAverage,
          semester1Average: sem1Result.overallAverage || 0,
          semester2Average: sem2Result.overallAverage || 0,
          status: status,
          attendance: yearlyAttendanceStats
        }
      }))
      
      // Calculate different types of ranks for all students
      const { semester1Ranks, semester2Ranks, overallRanks } = calculateYearlyRanks(studentsWithYearlyData)
      
      // Sort students by overall yearly average for ranking
      const sortedStudents = [...studentsWithYearlyData].sort((a, b) => (b.averageGrade || 0) - (a.averageGrade || 0))
      
      // Calculate subject ranks for all students
      const subjectRanks = calculateSubjectRanks(sortedStudents)
      
      // Calculate ranks for all students BEFORE generating reports (to avoid circular dependency)
      const studentRanks = new Array(sortedStudents.length)
      let currentRank = 1
      for (let i = 0; i < sortedStudents.length; i++) {
        if (i === 0) {
          currentRank = 1
          studentRanks[i] = '1'
        } else {
          const currentAvg = sortedStudents[i]?.averageGrade || 0
          const previousAvg = sortedStudents[i - 1]?.averageGrade || 0
          if (Math.abs(currentAvg - previousAvg) < 0.01) {
            // Same average = same rank (tie), keep currentRank unchanged
            studentRanks[i] = studentRanks[i - 1]
          } else {
            // Different average = update to current position
            currentRank = i + 1
            studentRanks[i] = currentRank.toString()
          }
        }
      }
      
      // Generate individual report data for each student
      const individualReports = sortedStudents.map((student, index) => {
        // Add subject ranks to each subject
        const subjectsWithRanks = (student.subjects || []).map((subject: any) => {
          const subjectRank = subjectRanks[subject.subjectName]?.[student.studentId] || 'N/A'
          return {
            ...subject,
            subjectRank: subjectRank
          }
        })
        
        // Use pre-calculated rank
        const studentRank = studentRanks[index]
        
        const yearlyGradebookData: YearlyGradebookReportData = {
          reportType: 'yearly',
          academicYear: academicYear,
          year: year || new Date().getFullYear().toString(),
          class: className,
          section: courseSection,
          student: {
            ...student,
            photo: getStudentPhotoDataUrl((student as any).photo) || undefined,
            subjects: subjectsWithRanks,
            semester1Average: student.semester1Average || 0,
            semester2Average: student.semester2Average || 0,
            rank: studentRank,
            semester1Rank: semester1Ranks[student.studentId]?.toString() || 'N/A',
            semester2Rank: semester2Ranks[student.studentId]?.toString() || 'N/A',
            overallRank: overallRanks[student.studentId]?.toString() || 'N/A',
            attendance: student.attendance || {
              absent: 0,
              late: 0,
              excused: 0,
              total: 0,
              rate: 0
            }
          },
          generatedAt: new Date().toISOString()
        }
        
        return yearlyGradebookData
      })
      
      console.log(`Generated ${individualReports.length} individual yearly gradebook reports`)
      
      // Use combined PDF generation for yearly gradebook
      pdfReportType = ReportType.GRADEBOOK_REPORT_YEARLY_COMBINED
      finalReportData = individualReports
    } else {
      console.log('No students found for yearly gradebook report')
      return NextResponse.json(
        { success: false, error: 'No students found for yearly gradebook report' },
        { status: 404 }
      )
    }
  } else {
    pdfReportType = ReportType.GRADEBOOK_REPORT
  }
  
  const result = await pdfManager.generatePDF(pdfReportType, finalReportData)

  // Create safe filename for download
  const safeFilename = `gradebook-report-${pdfReportType}-${academicYear}${className ? `-${className}` : ''}.pdf`
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens

  // Stream PDF directly to client
  return new NextResponse(result.buffer as any, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeFilename}"`,
      'Content-Length': result.buffer.length.toString(),
      'Cache-Control': 'no-cache'
    }
  })
  } catch (error) {
    console.error('Error in handleClassGradebook:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error in class gradebook generation'
    return NextResponse.json(
      { success: false, error: `Failed to generate class gradebook: ${errorMessage}` },
      { status: 500 }
    )
  }
}

function calculateAttendanceStats(attendances: any[]): any {
  // Session weights: AM=1, PM=1, FULL=2 (because FULL covers both AM+PM)
  const sessionWeights = {
    'AM': 1,
    'PM': 1,
    'FULL': 2
  }

  let absent = 0
  let late = 0
  let excused = 0
  let total = 0

  // Calculate weighted counts based on session type
  // Only absent, late, and excused are tracked in the database
  attendances.forEach(attendance => {
    const weight = sessionWeights[attendance.session as keyof typeof sessionWeights] || 1
    
    switch (attendance.status) {
      case 'absent':
        absent += weight
        break
      case 'late':
        late += weight
        break
      case 'excused':
        excused += weight
        break
    }
    
    total += weight
  })

  // Calculate attendance rate: late / total * 100
  // Rate represents percentage of late arrivals among all attendance issues
  const rate = total > 0 ? (late / total) * 100 : 0

  return {
    absent,
    late,
    excused,
    total,
    rate
  }
}


function getGradeComment(score: number): string {
  if (score >= 90) return 'ល្អប្រសើរណាស់'
  if (score >= 80) return 'ល្អប្រសើរ'
  if (score >= 70) return 'ល្អណាស់'
  if (score >= 60) return 'ល្អ'
  if (score >= 50) return 'មធ្យម'
  if (score >= 40) return 'ខ្សោយ'
  return 'ត្រូវពង្រឹងបន្ថែម'
}

// Calculate subject ranks for all students (with attendance penalty applied)
function calculateSubjectRanks(students: any[]): Record<string, Record<string, string>> {
  const subjectRanks: Record<string, Record<string, string>> = {}
  
  // Get all unique subjects
  const allSubjects = new Set<string>()
  students.forEach(student => {
    if (student.subjects) {
      student.subjects.forEach((subject: any) => {
        allSubjects.add(subject.subjectName)
      })
    }
  })
  
  // Calculate ranks for each subject
  allSubjects.forEach(subjectName => {
    // Get all students' grades for this subject WITH ATTENDANCE PENALTY
    const subjectGrades = students
      .map(student => {
        const subject = student.subjects?.find((s: any) => s.subjectName === subjectName)
        if (!subject) return null
        
        // Get total absences for this student
        const totalAbsences = student.totalAbsences || 0
        
        // Apply attendance penalty to subject grade
        const originalGrade = subject.grade || 0
        const penaltyRate = Math.min(totalAbsences / 4, 1) * 0.1
        const adjustedGrade = originalGrade * (1 - penaltyRate)
        
        return {
          studentId: student.studentId,
          grade: adjustedGrade  // Use adjusted grade for ranking
        }
      })
      .filter(Boolean)
      .sort((a, b) => (b?.grade || 0) - (a?.grade || 0)) // Sort by adjusted grade descending
    
    // Assign ranks with proper tie handling
    subjectRanks[subjectName] = {}
    let currentRank = 1
    subjectGrades.forEach((studentGrade, index) => {
      if (studentGrade) {
        // Check if this student has the same grade as the previous one
        if (index > 0 && Math.abs((studentGrade.grade || 0) - (subjectGrades[index - 1]?.grade || 0)) < 0.01) {
          // Same grade as previous = same rank (tie)
          const previousStudentId = subjectGrades[index - 1]?.studentId
          if (previousStudentId) {
            subjectRanks[subjectName][studentGrade.studentId] = subjectRanks[subjectName][previousStudentId]
          }
        } else {
          // Different grade = update current rank to current position
          currentRank = index + 1
          subjectRanks[subjectName][studentGrade.studentId] = currentRank.toString()
        }
      }
    })
  })
  
  return subjectRanks
}

// Calculate semester average (same as grade-report API)
function calculateSemesterAverage(
  grades: any[],
  semesterText: string,
  gradeNum: number
): { lastMonthAverage: number; previousMonthsAverage: number; overallAverage: number } {
  console.log(`calculateSemesterAverage called with ${grades.length} grades for semester: ${semesterText}`)
  console.log('Grades data:', grades.map(g => ({ date: g.gradeDate, grade: g.grade, subject: g.subject?.subjectName })))
  
  const dates = [...new Set(grades.map(g => g.gradeDate))].filter(Boolean)
  const sortedDates = sortDatesByYearMonth(dates)
  
  console.log('Available dates:', dates)
  console.log('Sorted dates:', sortedDates)
  
  if (sortedDates.length === 0) {
    console.log('No dates found, returning zeros')
    return { lastMonthAverage: 0, previousMonthsAverage: 0, overallAverage: 0 }
  }

  const lastMonth = sortedDates[sortedDates.length - 1]
  const previousMonths = sortedDates.slice(0, -1)
  
  console.log('Last month:', lastMonth)
  console.log('Previous months:', previousMonths)

  // Last month calculation
  const lastMonthGrades = grades.filter(g => g.gradeDate === lastMonth)
  const lastMonthTotal = lastMonthGrades.reduce((sum, g) => sum + (g.grade || 0), 0)
  const uniqueSubjects = new Set(lastMonthGrades.map(g => g.subject?.subjectName)).size
  const lastMonthAverage = calculateGradeAverage(lastMonthTotal, gradeNum, uniqueSubjects)

  // Previous months calculation
  const monthlyTotals: number[] = []
  previousMonths.forEach(month => {
    const monthGrades = grades.filter(g => g.gradeDate === month)
    console.log(`Month ${month}: found ${monthGrades.length} grades`)
    if (monthGrades.length > 0) {
      const monthTotal = monthGrades.reduce((sum, g) => sum + (g.grade || 0), 0)
      monthlyTotals.push(monthTotal)
      console.log(`Month ${month} total: ${monthTotal}`)
    }
  })

  console.log('Monthly totals:', monthlyTotals)

  const previousMonthsTotalAverage = monthlyTotals.length > 0 
    ? monthlyTotals.reduce((sum, total) => sum + total, 0) / monthlyTotals.length 
    : 0

  console.log('Previous months total average:', previousMonthsTotalAverage)

  const previousMonthsAverage = calculateGradeAverage(previousMonthsTotalAverage, gradeNum, uniqueSubjects)
  const overallAverage = (lastMonthAverage + previousMonthsAverage) / 2
  
  console.log('Final calculations:', { lastMonthAverage, previousMonthsAverage, overallAverage })

  return { lastMonthAverage, previousMonthsAverage, overallAverage }
}

/**
 * Calculate student absences for a date range
 * Returns weighted total: excused counts as 0.5, absent counts as 1
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

/**
 * Calculate semester averages with per-month attendance penalties (FOR GRADEBOOK)
 * Applies attendance penalty to ALL months including the last month
 * 
 * @param grades - All grades for the semester
 * @param semesterText - Semester identifier (e.g., 'ឆមាសទី ១')
 * @param gradeNum - Grade level for calculation formula
 * @param studentId - Student ID for attendance lookup
 * @param calculateAbsences - Function to calculate absences for a date range
 * @returns Object containing lastMonthAverage (with penalty), previousMonthsAverage (with penalties), and overallAverage
 */
async function calculateSemesterAverageWithAttendanceGradebook(
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
  // Force recompile: 2025-10-30-FIX
  console.log(`🔍 DEBUG: gradeNum = ${gradeNum}, type = ${typeof gradeNum}`)
  const monthlyAveragesWithPenalty: number[] = []
  
  for (const month of previousMonths) {
    // Get grades for this month
    const monthGrades = grades.filter(g => g.gradeDate === month)
    if (monthGrades.length === 0) continue
    
    const monthTotal = monthGrades.reduce((sum, g) => sum + (g.grade || 0), 0)
    const monthUniqueSubjects = new Set(monthGrades.map(g => g.subject?.subjectName)).size
    // Use grade-specific formula (e.g., grade 9: /8.4, grade 7-8: /14)
    const monthAverage = calculateGradeAverage(monthTotal, gradeNum, monthUniqueSubjects)
    
    console.log(`      Month ${month} RAW: Total=${monthTotal}, Subjects=${monthUniqueSubjects}, Divisor=${gradeNum >= 7 && gradeNum <= 8 ? 14 : gradeNum === 9 ? 8.4 : monthUniqueSubjects}, Avg=${monthAverage.toFixed(2)}`)
    
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
    
    console.log(`      Month ${month}: Avg ${monthAverage.toFixed(2)}, Absences ${monthAbsences.toFixed(2)}, Adjusted ${adjustedMonthAverage.toFixed(2)}`)
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
  
  console.log(`      Last Month ${lastMonth}: Base Avg ${lastMonthBaseAverage.toFixed(2)}, Absences ${lastMonthAbsences.toFixed(2)}, Adjusted ${lastMonthAverage.toFixed(2)}`)
  
  // Overall average includes last month (with penalty) + previous months average (with penalties)
  const overallAverage = (lastMonthAverage + previousMonthsAverage) / 2

  console.log(`      Previous Months Avg (with per-month attendance): ${previousMonthsAverage.toFixed(2)}`)
  console.log(`      Overall Semester Avg: ${overallAverage.toFixed(2)}`)

  return { lastMonthAverage, previousMonthsAverage, overallAverage }
}

// Calculate student data with proper ranking and status (same as grade-report-monthly.ts)
function calculateStudentData(student: any, classLevel: string) {
  // Calculate total grade (sum of all subject grades)
  const totalGrade = student.subjects.reduce((sum: number, subject: any) => sum + (subject.grade || 0), 0)
  
  // Calculate average grade using Grade-Specific Formula (same as grade reports)
  const gradeNum = parseInt(classLevel) || 0
  const uniqueSubjects = student.subjects.length
  const averageGrade = calculateGradeAverage(totalGrade, gradeNum, uniqueSubjects)
  
  // Get status using the same logic as grade-report-monthly.ts
  const status = getGradeStatus(averageGrade, classLevel)
  
  return {
    ...student,
    totalGrade: totalGrade,
    averageGrade: averageGrade,
    status: status
  }
}

// Calculate different types of ranks for semester reports
function calculateSemesterRanks(students: any[]): {
  semesterRanks: Record<string, number>,
  monthlyRanks: Record<string, number>,
  overallRanks: Record<string, number>
} {
  // Sort by last month's average (semester rank)
  const sortedBySemester = [...students].sort((a, b) => (b.averageGrade || 0) - (a.averageGrade || 0))
  const semesterRanks: Record<string, number> = {}
  sortedBySemester.forEach((student, index) => {
    semesterRanks[student.studentId] = index + 1
  })

  // Sort by previous months average (monthly rank)
  const sortedByMonthly = [...students].sort((a, b) => (b.monthlyAverage || 0) - (a.monthlyAverage || 0))
  const monthlyRanks: Record<string, number> = {}
  sortedByMonthly.forEach((student, index) => {
    monthlyRanks[student.studentId] = index + 1
  })

  // Sort by overall semester average (overall rank)
  const sortedByOverall = [...students].sort((a, b) => (b.overallSemesterAverage || 0) - (a.overallSemesterAverage || 0))
  const overallRanks: Record<string, number> = {}
  sortedByOverall.forEach((student, index) => {
    overallRanks[student.studentId] = index + 1
  })

  return { semesterRanks, monthlyRanks, overallRanks }
}

// Helper function to sort dates by year and month (same as grade-report-yearly.ts)
function sortDatesByYearMonth(dates: string[]): string[] {
  return dates.sort((a, b) => {
    const [monthA, yearA] = a.split('/').map(Number)
    const [monthB, yearB] = b.split('/').map(Number)
    
    if (yearA !== yearB) {
      return yearA - yearB
    }
    return monthA - monthB
  })
}

// Helper function to get maxScore for a subject based on grade level
// Database subjects: គណិតវិទ្យា, ភាសាខ្មែរ, តែងសេចក្តី, សរសេរតាមអាន, រូបវិទ្យា, គីមីវិទ្យា, ជីវវិទ្យា, 
//                    ផែនដីវិទ្យា, សីលធម៌-ពលរដ្ឋវិទ្យា, ភូមិវិទ្យា, ប្រវត្តិវិទ្យា, អង់គ្លេស
function getSubjectMaxScore(gradeNum: number, subjectName: string): number {
  // Grades 1-6: All subjects max score is 10
  if (gradeNum >= 1 && gradeNum <= 6) {
    return 10
  }
  
  // Grade 7-8: maxScore = 50, BUT ភាសាខ្មែរ (Khmer) and គណិតវិទ្យា (Math) = 100
  if (gradeNum >= 7 && gradeNum <= 8) {
    // Match exact subject names from database
    if (subjectName === 'គណិតវិទ្យា') return 100  // Math
    if (subjectName === 'ភាសាខ្មែរ') return 100   // Khmer
    return 50  // All other subjects
  }
  
  // Grade 9: Each subject has specific maxScore (exact database names)
  if (gradeNum === 9) {
    if (subjectName === 'តែងសេចក្តី') return 50           // Writing composition
    if (subjectName === 'សរសេរតាមអាន') return 50         // Dictation
    if (subjectName === 'គណិតវិទ្យា') return 100         // Math
    if (subjectName === 'រូបវិទ្យា') return 35           // Physics
    if (subjectName === 'គីមីវិទ្យា') return 25          // Chemistry
    if (subjectName === 'ជីវវិទ្យា') return 35           // Biology
    if (subjectName === 'ផែនដីវិទ្យា') return 25         // Earth Science
    if (subjectName === 'សីលធម៌-ពលរដ្ឋវិទ្យា') return 35  // Civic Education
    if (subjectName === 'ភូមិវិទ្យា') return 32           // Geography
    if (subjectName === 'ប្រវត្តិវិទ្យា') return 33       // History
    if (subjectName === 'អង់គ្លេស') return 50            // English
    return 50 // Default for unknown subjects
  }
  
  // Default fallback
  return 100
}

// Helper function to get letter grade (consistent with other report generators)
// Now supports different maxScores per subject (especially for grades 7-9)
function getLetterGrade(score: number, gradeNum: number, maxScore: number = 100): string {
  // Calculate percentage first
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
  
  // A to F grading system based on percentage
  // 90%, 80%, 70%, 60%, 50% thresholds
  if (percentage >= 90) return 'A'   // ល្អ​ប្រសើរ >= 90%
  if (percentage >= 80) return 'B'   // ល្អ​ណាស់ >= 80%
  if (percentage >= 70) return 'C'   // ល្អ >= 70%
  if (percentage >= 60) return 'D'   // ល្អ​បង្គួរ >= 60%
  if (percentage >= 50) return 'E'   // ល្អ​បង្គួរ >= 50%
  return 'F' // ខ្សោយ < 50%
}

// Calculate different types of ranks for yearly reports
function calculateYearlyRanks(students: any[]): {
  semester1Ranks: Record<string, number>,
  semester2Ranks: Record<string, number>,
  overallRanks: Record<string, number>
} {
  // Sort by semester 1 average
  const sortedBySemester1 = [...students].sort((a, b) => (b.semester1Average || 0) - (a.semester1Average || 0))
  const semester1Ranks: Record<string, number> = {}
  sortedBySemester1.forEach((student, index) => {
    semester1Ranks[student.studentId] = index + 1
  })

  // Sort by semester 2 average
  const sortedBySemester2 = [...students].sort((a, b) => (b.semester2Average || 0) - (a.semester2Average || 0))
  const semester2Ranks: Record<string, number> = {}
  sortedBySemester2.forEach((student, index) => {
    semester2Ranks[student.studentId] = index + 1
  })

  // Sort by overall yearly average
  const sortedByOverall = [...students].sort((a, b) => (b.averageGrade || 0) - (a.averageGrade || 0))
  const overallRanks: Record<string, number> = {}
  sortedByOverall.forEach((student, index) => {
    overallRanks[student.studentId] = index + 1
  })

  return { semester1Ranks, semester2Ranks, overallRanks }
}

// Grade status calculation (consistent with other report generators)
function getGradeStatus(average: number, gradeLevel: string): string {
  const gradeNum = parseInt(gradeLevel) || 0
  
  if (gradeNum >= 1 && gradeNum <= 6) {
    // Grades 1-6: Full average is 10
    if (average >= 9) return 'A'   // ល្អ​ប្រសើរ = មធ្យមភាគ x ០,៩
    if (average >= 8) return 'B'   // ល្អ​ណាស់ = មធ្យមភាគ x ០,៨
    if (average >= 7) return 'C'   // ល្អ = មធ្យមភាគ x ០,៧
    if (average >= 6) return 'D'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៦
    if (average >= 5) return 'E'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៥
    return 'F' // ខ្សោយ
  }
  
  if (gradeNum >= 7 && gradeNum <= 9) {
    // Grades 7-9: Full average is 50
    if (average >= 45) return 'A'   // ល្អ​ប្រសើរ = មធ្យមភាគ x ០,៩
    if (average >= 40) return 'B'   // ល្អ​ណាស់ = មធ្យមភាគ x ០,៨
    if (average >= 35) return 'C'   // ល្អ = មធ្យមភាគ x ០,៧
    if (average >= 30) return 'D'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៦
    if (average >= 25) return 'E'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៥
    return 'F' // ខ្សោយ
  }
  
  // Fallback for unknown grade levels
  if (average >= 90) return 'A'
  if (average >= 80) return 'B'
  if (average >= 70) return 'C'
  if (average >= 60) return 'D'
  if (average >= 50) return 'E'
  return 'F'
}

// Helper function to process student HTMLs and generate PDF
async function processStudentHTMLs(allStudentHTMLs: string[], individualReports: any[], page: any): Promise<Buffer> {
  // Extract CSS from the first student's HTML
  const firstStudentHTML = allStudentHTMLs[0] || ''
  const cssMatch = firstStudentHTML.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
  const extractedCSS = cssMatch ? cssMatch[1] : ''
  
  console.log('CSS extraction:', {
    hasFirstStudentHTML: !!firstStudentHTML,
    cssMatchFound: !!cssMatch,
    extractedCSSLength: extractedCSS.length,
    extractedCSSPreview: extractedCSS.substring(0, 200)
  })
  
  // Extract body content from each HTML and combine them
  const studentPageContents = allStudentHTMLs.map(html => {
    // Extract the body content from each student's HTML
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) {
      return bodyMatch[1]
    }
    // Fallback: remove DOCTYPE, html, head tags
    return html
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<html[^>]*>/gi, '')
      .replace(/<\/html>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<body[^>]*>/gi, '')
      .replace(/<\/body>/gi, '')
  })
  
  // Combine all HTML with page breaks and include the CSS
  const combinedHTML = `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>លទ្ធផលនៃការសិក្សាប្រចាំខែ - សិស្សទាំងអស់</title>
  <style>
    ${extractedCSS}
    
    .student-page {
      page-break-after: always;
      min-height: 100vh;
      width: 100%;
    }
    .student-page:last-child {
      page-break-after: auto;
    }
    @page {
      size: A4 portrait;
      margin: 5mm;
    }
  </style>
</head>
<body>
  ${studentPageContents.map(content => `
    <div class="student-page">
      ${content}
    </div>
  `).join('')}
</body>
</html>
  `
  
  console.log(`Combined HTML generated with ${studentPageContents.length} student pages`)
  
  await page.setContent(combinedHTML, { 
    waitUntil: 'domcontentloaded', // Changed from networkidle0 for faster rendering
    timeout: 90000 // Increased timeout for complex calculations with many students
  })
  
  // Wait a bit for fonts to render
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: {
      top: '5mm',
      right: '5mm',
      bottom: '5mm',
      left: '5mm'
    },
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false
  })
  
  console.log(`Successfully generated combined PDF with ${individualReports.length} students`)
  return Buffer.from(pdfBuffer)
}

// Generate combined PDF with all students for monthly gradebook
async function generateCombinedMonthlyGradebookPDF(individualReports: any[]): Promise<Buffer> {
  try {
    const puppeteer = require('puppeteer')
    
    console.log(`Starting PDF generation for ${individualReports.length} students`)
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    try {
      const page = await browser.newPage()
      
      // Generate HTML for all students
      console.log(`Generating HTML for ${individualReports.length} students`)
      
      // Validate that the function is available
      if (typeof generateMonthlyGradebookReportHTML !== 'function') {
        console.error('generateMonthlyGradebookReportHTML is not a function:', typeof generateMonthlyGradebookReportHTML)
        console.log('Attempting to import function dynamically...')
        
        try {
          const { generateMonthlyGradebookReportHTML: dynamicFunction } = await import('../../../../lib/pdf-generators/reports/gradebook-report-monthly')
          if (typeof dynamicFunction === 'function') {
            console.log('Successfully imported function dynamically')
            // Use the dynamically imported function
            const allStudentHTMLs = individualReports.map((reportData, index) => {
              try {
                console.log(`Generating HTML for student ${index + 1}: ${reportData.student.firstName} ${reportData.student.lastName}`)
                return dynamicFunction(reportData)
              } catch (error) {
                console.error(`Error generating HTML for student ${index + 1}:`, error)
                throw error
              }
            })
            
            // Continue with the rest of the function using allStudentHTMLs
            return await processStudentHTMLs(allStudentHTMLs, individualReports, page)
          } else {
            throw new Error('Dynamic import also failed')
          }
        } catch (importError) {
          console.error('Dynamic import failed:', importError)
          throw new Error('generateMonthlyGradebookReportHTML function is not available')
        }
      }
      
      console.log('generateMonthlyGradebookReportHTML function is available:', typeof generateMonthlyGradebookReportHTML)
      
      const allStudentHTMLs = individualReports.map((reportData, index) => {
        try {
          console.log(`Generating HTML for student ${index + 1}: ${reportData.student.firstName} ${reportData.student.lastName}`)
          return generateMonthlyGradebookReportHTML(reportData)
        } catch (error) {
          console.error(`Error generating HTML for student ${index + 1}:`, error)
          throw error
        }
      })
      
      // Process the HTMLs and generate PDF
      return await processStudentHTMLs(allStudentHTMLs, individualReports, page)
    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error('Error in generateCombinedMonthlyGradebookPDF:', error)
    throw new Error(`Failed to generate combined monthly gradebook: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}