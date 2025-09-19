import { NextRequest, NextResponse } from 'next/server'
import { PDFManager } from '@/lib/pdf-generators/core/pdf-manager'
import { ReportType } from '@/lib/pdf-generators/core/types'
import { StudentListReportData } from '@/lib/pdf-generators/reports/student-list-report'
import { prisma } from '@/lib/prisma'

const pdfManager = new PDFManager()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportType, academicYear, class: className, format } = body

    // Fetch student data based on report type
    let studentListData: StudentListReportData

    switch (reportType) {
      case 'class-list':
        studentListData = await generateClassListData(academicYear, className)
        break
      case 'all-students':
        studentListData = await generateAllStudentsData(academicYear)
        break
      case 'student-details':
        studentListData = await generateStudentDetailsData(academicYear, className)
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // Generate PDF
    const result = await pdfManager.generatePDF(
      ReportType.STUDENT_LIST_REPORT,
      studentListData,
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
    const safeFilename = `student-list-report-${reportType}-${academicYear}-${className || 'all'}.pdf`
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
    console.error('❌ Error generating student list report:', error)
    return NextResponse.json(
      { error: 'Failed to generate student list report' },
      { status: 500 }
    )
  }
}

// Generate class list data
async function generateClassListData(academicYear: string, className?: string): Promise<StudentListReportData> {
  let actualClassName = className
  let courseId = null

  // If className is a courseId (numeric), use it directly
  if (className && !isNaN(parseInt(className))) {
    courseId = parseInt(className)
    const course = await prisma.course.findUnique({
      where: { courseId: parseInt(className) },
      select: { grade: true, section: true }
    })
    
    if (course) {
      actualClassName = `${course.grade}${course.section}`
    }
  } else if (className) {
    // Look up course by grade and section (e.g., "1A" -> grade: "1", section: "A")
    const grade = className.replace(/[A-Z]/g, '') // Extract number part
    const section = className.replace(/[0-9]/g, '') // Extract letter part
    
    const course = await prisma.course.findFirst({
      where: {
        grade: grade,
        section: section,
        schoolYear: {
          schoolYearCode: academicYear
        }
      },
      select: { courseId: true, grade: true, section: true }
    })
    
    if (course) {
      courseId = course.courseId
      actualClassName = `${course.grade}${course.section}`
    }
  }

  // Get students through enrollments
  const enrollments = await prisma.enrollment.findMany({
    where: courseId ? { courseId: courseId } : {
      course: {
        schoolYear: {
          schoolYearCode: academicYear
        }
      }
    },
    include: {
      student: {
        include: {
          guardians: true,
          family: true
        }
      },
      course: {
        select: {
          grade: true,
          section: true
        }
      }
    },
    orderBy: [
      { student: { firstName: 'asc' } }
    ]
  })

  // Extract students from enrollments
  const students = enrollments.map(enrollment => ({
    ...enrollment.student,
    // Update the student's class to match the course they're enrolled in
    class: `${enrollment.course.grade}${enrollment.course.section}`
  }))

  return processStudentData(students, 'class-list', academicYear, actualClassName)
}

// Generate all students data
async function generateAllStudentsData(academicYear: string): Promise<StudentListReportData> {
  // Get students through enrollments for the specific academic year
  const enrollments = await prisma.enrollment.findMany({
    where: {
      course: {
        schoolYear: {
          schoolYearCode: academicYear
        }
      }
    },
    include: {
      student: {
        include: {
          guardians: true,
          family: true
        }
      },
      course: {
        select: {
          grade: true,
          section: true
        }
      }
    },
    orderBy: [
      { student: { firstName: 'asc' } }
    ]
  })

  // Extract students from enrollments
  const students = enrollments.map(enrollment => ({
    ...enrollment.student,
    // Update the student's class to match the course they're enrolled in
    class: `${enrollment.course.grade}${enrollment.course.section}`
  }))

  return processStudentData(students, 'all-students', academicYear)
}

// Generate student details data
async function generateStudentDetailsData(academicYear: string, className?: string): Promise<StudentListReportData> {
  let actualClassName = className
  let courseId = null

  // If className is a courseId (numeric), use it directly
  if (className && !isNaN(parseInt(className))) {
    courseId = parseInt(className)
    const course = await prisma.course.findUnique({
      where: { courseId: parseInt(className) },
      select: { grade: true, section: true }
    })
    
    if (course) {
      actualClassName = `${course.grade}${course.section}`
    }
  } else if (className) {
    // Look up course by grade and section (e.g., "1A" -> grade: "1", section: "A")
    const grade = className.replace(/[A-Z]/g, '') // Extract number part
    const section = className.replace(/[0-9]/g, '') // Extract letter part
    
    const course = await prisma.course.findFirst({
      where: {
        grade: grade,
        section: section,
        schoolYear: {
          schoolYearCode: academicYear
        }
      },
      select: { courseId: true, grade: true, section: true }
    })
    
    if (course) {
      courseId = course.courseId
      actualClassName = `${course.grade}${course.section}`
    }
  }

  // Get students through enrollments
  const enrollments = await prisma.enrollment.findMany({
    where: courseId ? { courseId: courseId } : {
      course: {
        schoolYear: {
          schoolYearCode: academicYear
        }
      }
    },
    include: {
      student: {
        include: {
          guardians: true,
          family: true
        }
      },
      course: {
        select: {
          grade: true,
          section: true
        }
      }
    },
    orderBy: [
      { student: { firstName: 'asc' } }
    ]
  })

  // Extract students from enrollments
  const students = enrollments.map(enrollment => ({
    ...enrollment.student,
    // Update the student's class to match the course they're enrolled in
    class: `${enrollment.course.grade}${enrollment.course.section}`
  }))

  return processStudentData(students, 'student-details', academicYear, actualClassName)
}

// Process student data into report format
function processStudentData(
  students: any[], 
  reportType: 'class-list' | 'all-students' | 'student-details',
  academicYear: string,
  className?: string
): StudentListReportData {
  const processedStudents = students.map(student => {
    const guardian = student.guardians?.[0] // Get first guardian
    const family = student.family // Get family info

    return {
      studentId: student.studentId.toString(),
      firstName: student.firstName,
      lastName: student.lastName,
      class: student.class,
      gender: student.gender,
      dob: student.dob,
      age: calculateAge(student.dob),
      phone: student.phone || '',
      emergencyContact: student.emergencyContact || '',
      registrationDate: student.registrationDate || student.createdAt,
      status: student.status || 'active',
      religion: student.religion || '',
      health: student.health || '',
      studentHouseNumber: student.studentHouseNumber || '',
      studentVillage: student.studentVillage || '',
      studentDistrict: student.studentDistrict || '',
      studentProvince: student.studentProvince || '',
      studentBirthDistrict: student.studentBirthDistrict || '',
      previousSchool: student.previousSchool || '',
      transferReason: student.transferReason || '',
      vaccinated: student.vaccinated || false,
      needsClothes: student.needsClothes || false,
      needsMaterials: student.needsMaterials || false,
      needsTransport: student.needsTransport || false,
      guardian: guardian ? {
        firstName: guardian.firstName,
        lastName: guardian.lastName,
        relation: guardian.relation,
        phone: guardian.phone,
        occupation: guardian.occupation,
        income: guardian.income,
        childrenCount: guardian.childrenCount,
        houseNumber: guardian.houseNumber,
        village: guardian.village,
        district: guardian.district,
        province: guardian.province,
        birthDistrict: guardian.birthDistrict,
        believeJesus: guardian.believeJesus,
        church: guardian.church
      } : undefined,
      family: family ? {
        livingWith: family.livingWith,
        ownHouse: family.ownHouse,
        durationInKPC: family.durationInKPC,
        livingCondition: family.livingCondition,
        organizationHelp: family.organizationHelp,
        knowSchool: family.knowSchool,
        religion: family.religion,
        churchName: family.churchName,
        canHelpSchool: family.canHelpSchool,
        helpAmount: family.helpAmount,
        helpFrequency: family.helpFrequency
      } : undefined
    }
  })

  // Generate summary statistics
  const summary = generateSummary(processedStudents)

  return {
    reportType,
    title: getReportTitle(reportType, className),
    academicYear,
    class: className,
    schoolName: 'សាលាមិត្តភាព',
    totalStudents: processedStudents.length,
    students: processedStudents,
    summary
  }
}

// Generate summary statistics
function generateSummary(students: any[]) {
  const byClass = new Map()
  let maleCount = 0
  let femaleCount = 0
  let activeCount = 0
  let inactiveCount = 0
  let transferredCount = 0

  students.forEach(student => {
    // Count by class
    if (!byClass.has(student.class)) {
      byClass.set(student.class, {
        className: student.class,
        totalStudents: 0,
        maleCount: 0,
        femaleCount: 0
      })
    }
    
    const classData = byClass.get(student.class)
    classData.totalStudents++
    
    if (student.gender === 'male') {
      classData.maleCount++
      maleCount++
    } else {
      classData.femaleCount++
      femaleCount++
    }

    // Count by status
    switch (student.status) {
      case 'active':
        activeCount++
        break
      case 'inactive':
        inactiveCount++
        break
      case 'transferred':
        transferredCount++
        break
    }
  })

  return {
    byClass: Array.from(byClass.values()),
    byGender: {
      male: maleCount,
      female: femaleCount
    },
    byStatus: {
      active: activeCount,
      inactive: inactiveCount,
      transferred: transferredCount
    }
  }
}

// Helper functions
function calculateAge(dob: string): string {
  const birthDate = new Date(dob)
  const today = new Date()
  
  let years = today.getFullYear() - birthDate.getFullYear()
  let months = today.getMonth() - birthDate.getMonth()
  let days = today.getDate() - birthDate.getDate()
  
  // Adjust for negative days
  if (days < 0) {
    months--
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
    days += lastMonth.getDate()
  }
  
  // Adjust for negative months
  if (months < 0) {
    years--
    months += 12
  }
  
  return `${years} ឆ្នាំ ${months} ខែ ${days} ថ្ងៃ`
}

function formatDateShort(date: string | Date): string {
  const d = new Date(date)
  
  // Khmer month names
  const monthNames = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ]
  
  const day = d.getDate()
  const month = monthNames[d.getMonth()]
  const year = d.getFullYear()
  
  return `${day}, ${month} ឆ្នាំ${year}`
}

function getReportTitle(reportType: string, className?: string): string {
  switch (reportType) {
    case 'class-list':
      return className ? `បញ្ជីឈ្មោះថ្នាក់ ${className}` : 'បញ្ជីឈ្មោះតាមថ្នាក់'
    case 'all-students':
      return 'បញ្ជីឈ្មោះសិស្សទាំងអស់'
    case 'student-details':
      return className ? `ព័ត៌មានលម្អិតសិស្សថ្នាក់ ${className}` : 'ព័ត៌មានលម្អិតសិស្ស'
    default:
      return 'របាយការណ៍បញ្ជីឈ្មោះសិស្ស'
  }
}
