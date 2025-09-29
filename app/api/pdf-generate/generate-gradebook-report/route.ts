import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pdfManager } from '@/lib/pdf-generators/core/pdf-manager'
import { ReportType } from '@/lib/pdf-generators/core/types'
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Gradebook API Request:', { body })
    
    const { 
      reportType, 
      academicYear, 
      month, 
      year, 
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
      return await handleStudentGradebook(academicYear, month, year, className, section, studentId)
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
  studentId: string
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
    const percentage = (score / 100) * 100
    return {
      subjectName: grade.subject?.subjectName || 'Unknown Subject',
      grade: score,
      maxGrade: 100,
      percentage,
      letterGrade: getLetterGrade(score, gradeNum),
      gradeComment: (grade as any).gradeComment || '' // Use only database gradeComment, show empty if not available
    }
  })

  // Calculate totals
  const totalGrade = subjects.reduce((sum, subject) => sum + subject.grade, 0)
  const averageGrade = subjects.length > 0 ? totalGrade / subjects.length : 0

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
      photo: student.photo || undefined,
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
  return {
    subjectName: grade.subject?.subjectName || 'Unknown Subject',
    grade: grade.grade || 0,
    maxGrade: 100,
    percentage: ((grade.grade || 0) / 100) * 100,
    letterGrade: getLetterGrade(grade.grade || 0, gradeNum),
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

    // Note: Date and semester filtering will be applied during data processing
    // rather than at the database level to avoid overly restrictive queries

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
          include: {
            student: true
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
  const processedCourses = courses.map(course => {
    const gradeNum = parseInt(String(course.grade)) || 0
    
    // Get unique students for this course
    const studentIds = [...new Set(course.grades.map(grade => grade.studentId))]
    const students = studentIds.map(studentId => {
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
        
        // Calculate semester averages using the same logic as grade-report API
        const { lastMonthAverage, previousMonthsAverage, overallAverage } = calculateSemesterAverage(
          allSemesterGrades,
          semesterText!,
          gradeNum
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
    }).filter(Boolean)

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
  })

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
    
    // Sort students by average grade for ranking
    validStudents.sort((a, b) => (b.averageGrade || b.finalGrade) - (a.averageGrade || a.finalGrade))
    
    // Calculate subject ranks for all students
    const subjectRanks = calculateSubjectRanks(validStudents)
    
    // Generate individual student reports
    console.log(`Processing ${validStudents.length} students for monthly gradebook`)
    const individualReports = validStudents.map((student, index) => {
      try {
        // Validate student data
        if (!student || !student.firstName || !student.lastName) {
          throw new Error(`Invalid student data at index ${index}`)
        }
        
        // Calculate student data with proper ranking and status
        const calculatedStudent = calculateStudentData(student, className || '9')
        const studentRank = (index + 1).toString()
        
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
        
        console.log(`Student ${index + 1}: ${student.firstName} ${student.lastName} - Rank: ${studentRank}, Average: ${calculatedStudent.averageGrade}`)
        console.log(`Monthly Attendance:`, {
          rawRecords: studentAttendances.length,
          weightedStats: monthlyAttendanceStats
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
          photo: (student as any).photo || undefined,
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
      
      // First, calculate semester averages for all students
      const studentsWithSemesterData = validStudents.map(student => {
        const classLevel = className || '1'
        const processedStudent = calculateStudentData(student, classLevel)
        
        // Calculate semester averages for this specific student
        const studentGrades = firstCourse.grades?.filter((grade: any) => grade.studentId === parseInt(student.studentId)) || []
        const studentSemesterGrades = semesterText ? (studentGrades.filter((grade: any) => {
          const semesterMatch = grade.semester?.semester === semesterText
          return semesterMatch
        }) || []) : []
        
        const { lastMonthAverage: studentLastMonthAverage, previousMonthsAverage: studentPreviousMonthsAverage, overallAverage: studentOverallAverage } = semesterText ? calculateSemesterAverage(
          studentSemesterGrades,
          semesterText,
          parseInt(processedStudent.class) || 0
        ) : { lastMonthAverage: 0, previousMonthsAverage: 0, overallAverage: 0 }
        
        // Calculate semester attendance for this student
        const studentAttendances = firstCourse.attendances?.filter((attendance: any) => attendance.studentId === parseInt(student.studentId)) || []
        const semesterAttendanceStats = calculateAttendanceStats(studentAttendances)
        
        console.log(`Student ${student.studentId} (${student.firstName} ${student.lastName}) - Semester Attendance:`, {
          rawRecords: studentAttendances.length,
          weightedStats: semesterAttendanceStats,
          breakdown: {
            absent: semesterAttendanceStats.absent,
            late: semesterAttendanceStats.late,
            excused: semesterAttendanceStats.excused,
            total: semesterAttendanceStats.total,
            rate: `${semesterAttendanceStats.rate.toFixed(1)}%`
          }
        })
        
        return {
          ...student,
          ...processedStudent,
          monthlyAverage: studentPreviousMonthsAverage || 0,
          overallSemesterAverage: studentOverallAverage || processedStudent.averageGrade,
          attendance: semesterAttendanceStats
        }
      })
      
      // Calculate different types of ranks for all students
      const { semesterRanks, monthlyRanks, overallRanks } = calculateSemesterRanks(studentsWithSemesterData)
      
      // Sort students by overall semester average for ranking (same as grade-report-semester.ts)
      const sortedStudents = [...studentsWithSemesterData].sort((a, b) => (b.overallSemesterAverage || 0) - (a.overallSemesterAverage || 0))
      
      // Calculate subject ranks for all students
      const subjectRanks = calculateSubjectRanks(sortedStudents)
      
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
        
        const semesterGradebookData: SemesterGradebookReportData = {
          reportType: 'semester',
          academicYear: academicYear,
          semester: semester || '1',
          year: year || new Date().getFullYear().toString(),
          class: className,
          section: courseSection,
          student: {
            ...student,
            subjects: subjectsWithRanks,
            monthlyAverage: student.monthlyAverage || 0, // Previous months average
            overallSemesterAverage: student.overallSemesterAverage || 0, // Overall semester average
            rank: (index + 1).toString(),
            semesterRank: semesterRanks[student.studentId]?.toString() || 'N/A',
            monthlyRank: monthlyRanks[student.studentId]?.toString() || 'N/A',
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
      const studentsWithYearlyData = validStudents.map(student => {
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
        const yearlySubjects = Array.from(allSubjects).map(subjectName => {
          const sem1SubjectGrades = semester1Grades.filter((g: any) => g.subject?.subjectName === subjectName)
          const sem2SubjectGrades = semester2Grades.filter((g: any) => g.subject?.subjectName === subjectName)
          
          const sem1Dates = [...new Set(sem1SubjectGrades.map((g: any) => g.gradeDate))].filter(Boolean)
          const sem2Dates = [...new Set(sem2SubjectGrades.map((g: any) => g.gradeDate))].filter(Boolean)
          
          const sem1SortedDates = sortDatesByYearMonth(sem1Dates)
          const sem2SortedDates = sortDatesByYearMonth(sem2Dates)
          
          const sem1LastMonth = sem1SortedDates[sem1SortedDates.length - 1]
          const sem2LastMonth = sem2SortedDates[sem2SortedDates.length - 1]
          
          const sem1LastMonthGrade = sem1SubjectGrades.find((g: any) => g.gradeDate === sem1LastMonth)?.grade || 0
          const sem2LastMonthGrade = sem2SubjectGrades.find((g: any) => g.gradeDate === sem2LastMonth)?.grade || 0
          
          const sem1PreviousMonths = sem1SortedDates.slice(0, -1)
          const sem2PreviousMonths = sem2SortedDates.slice(0, -1)
          
          const sem1PreviousMonthsTotal = sem1PreviousMonths.reduce((sum: number, month: string) => {
            const monthGrades = sem1SubjectGrades.filter((g: any) => g.gradeDate === month)
            return sum + (monthGrades.reduce((monthSum: number, g: any) => monthSum + (g.grade || 0), 0) / Math.max(monthGrades.length, 1))
          }, 0)
          
          const sem2PreviousMonthsTotal = sem2PreviousMonths.reduce((sum: number, month: string) => {
            const monthGrades = sem2SubjectGrades.filter((g: any) => g.gradeDate === month)
            return sum + (monthGrades.reduce((monthSum: number, g: any) => monthSum + (g.grade || 0), 0) / Math.max(monthGrades.length, 1))
          }, 0)
          
          const sem1Average = sem1PreviousMonths.length > 0 
            ? (sem1PreviousMonthsTotal / sem1PreviousMonths.length + sem1LastMonthGrade) / 2
            : sem1LastMonthGrade
          
          const sem2Average = sem2PreviousMonths.length > 0 
            ? (sem2PreviousMonthsTotal / sem2PreviousMonths.length + sem2LastMonthGrade) / 2
            : sem2LastMonthGrade
          
          const subjectAverage = (sem1Average + sem2Average) / 2
          
          return {
            subjectName: subjectName,
            grade: subjectAverage,
            maxGrade: 100,
            percentage: (subjectAverage / 100) * 100,
            letterGrade: getLetterGrade(subjectAverage, gradeNum),
            gradeComment: '' // Will be populated later if needed
          }
        })
        
        // Calculate semester averages using the same logic as grade-report-yearly.ts
        const sem1Result = calculateSemesterAverage(semester1Grades, 'ឆមាសទី ១', gradeNum)
        const sem2Result = calculateSemesterAverage(semester2Grades, 'ឆមាសទី ២', gradeNum)
        
        const yearlyAverage = (sem1Result.overallAverage + sem2Result.overallAverage) / 2
        
        // Calculate total grade from yearly subjects
        const totalGrade = yearlySubjects.reduce((sum: number, subject: any) => sum + subject.grade, 0)
        
        // Calculate status based on yearly average
        const status = getGradeStatus(yearlyAverage, classLevel)
        
        // Calculate yearly attendance for this student
        const studentAttendances = firstCourse.attendances?.filter((attendance: any) => attendance.studentId === parseInt(student.studentId)) || []
        const yearlyAttendanceStats = calculateAttendanceStats(studentAttendances)
        
        console.log(`Student ${student.studentId} (${student.firstName} ${student.lastName}) - Yearly Subjects:`, {
          subjectsCount: yearlySubjects.length,
          totalGrade: totalGrade,
          yearlyAverage: yearlyAverage,
          attendance: yearlyAttendanceStats
        })
        
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
      })
      
      // Calculate different types of ranks for all students
      const { semester1Ranks, semester2Ranks, overallRanks } = calculateYearlyRanks(studentsWithYearlyData)
      
      // Sort students by overall yearly average for ranking
      const sortedStudents = [...studentsWithYearlyData].sort((a, b) => (b.averageGrade || 0) - (a.averageGrade || 0))
      
      // Calculate subject ranks for all students
      const subjectRanks = calculateSubjectRanks(sortedStudents)
      
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
        
        const yearlyGradebookData: YearlyGradebookReportData = {
          reportType: 'yearly',
          academicYear: academicYear,
          year: year || new Date().getFullYear().toString(),
          class: className,
          section: courseSection,
          student: {
            ...student,
            subjects: subjectsWithRanks,
            semester1Average: student.semester1Average || 0,
            semester2Average: student.semester2Average || 0,
            rank: (index + 1).toString(),
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

// Calculate subject ranks for all students
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
    // Get all students' grades for this subject
    const subjectGrades = students
      .map(student => {
        const subject = student.subjects?.find((s: any) => s.subjectName === subjectName)
        return subject ? {
          studentId: student.studentId,
          grade: subject.grade || 0
        } : null
      })
      .filter(Boolean)
      .sort((a, b) => (b?.grade || 0) - (a?.grade || 0)) // Sort by grade descending
    
    // Assign ranks
    subjectRanks[subjectName] = {}
    subjectGrades.forEach((studentGrade, index) => {
      if (studentGrade) {
        subjectRanks[subjectName][studentGrade.studentId] = (index + 1).toString()
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

// Calculate student data with proper ranking and status (same as grade-report-monthly.ts)
function calculateStudentData(student: any, classLevel: string) {
  // Calculate total grade (sum of all subject grades)
  const totalGrade = student.subjects.reduce((sum: number, subject: any) => sum + (subject.grade || 0), 0)
  
  // Calculate average grade
  const averageGrade = student.subjects.length > 0 ? totalGrade / student.subjects.length : 0
  
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

// Helper function to get letter grade (consistent with other report generators)
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
  }
  
  if (gradeNum >= 7 && gradeNum <= 9) {
    // Grades 7-9: Full average is 50
    if (score >= 45) return 'A'   // ល្អ​ប្រសើរ = មធ្យមភាគ x ០,៩
    if (score >= 40) return 'B'   // ល្អ​ណាស់ = មធ្យមភាគ x ០,៨
    if (score >= 35) return 'C'   // ល្អ = មធ្យមភាគ x ០,៧
    if (score >= 30) return 'D'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៦
    if (score >= 25) return 'E'   // ល្អ​បង្គួរ = មធ្យមភាគ x ០,៥
    return 'F' // ខ្សោយ
  }
  
  // Fallback for unknown grade levels
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  if (score >= 50) return 'E'
  return 'F'
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
  
  await page.setContent(combinedHTML, { waitUntil: 'networkidle0' })
  
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