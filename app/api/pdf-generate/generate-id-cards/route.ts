import { NextRequest } from 'next/server'
import { pdfManager } from '@/lib/pdf-generators/core/pdf-manager'
import { ReportType } from '@/lib/pdf-generators/core/types'
import { generateBulkStudentIDCardBackPDF } from '@/lib/pdf-generators/id-cards/student-id-card-back'
import {
  createSafeFilename,
  createPDFResponse,
  createErrorResponse,
  fetchStudentData,
  fetchTeacherData,
  processStudentData,
  processTeacherData
} from '@/lib/pdf-generators/id-cards/utils'
import { logActivity, ActivityMessages } from '@/lib/activity-logger'

// Request body types
interface StudentIDCardRequest {
  type: 'student'
  variant: 'single' | 'bulk' | 'back'
  studentIds?: number[]
  classId?: string
  courseId?: number
  schoolYear?: string
  userId?: number
}

interface TeacherIDCardRequest {
  type: 'teacher'
  variant: 'single' | 'bulk'
  userIds: number[]
  schoolYear?: string
  userId?: number
}

type IDCardRequest = StudentIDCardRequest | TeacherIDCardRequest

// Constants
const DEFAULT_SCHOOL_YEAR = '2024-2025'
const MAX_BULK_ITEMS = 4

export async function POST(request: NextRequest) {
  try {
    const body: IDCardRequest = await request.json()
    const { type, variant, schoolYear = DEFAULT_SCHOOL_YEAR } = body

    // Validate request
    if (!type || !variant) {
      return createErrorResponse('Type and variant are required', 400)
    }

    if (type === 'student') {
      return await handleStudentIDCardGeneration(body as StudentIDCardRequest, schoolYear)
    } else if (type === 'teacher') {
      return await handleTeacherIDCardGeneration(body as TeacherIDCardRequest, schoolYear)
    } else {
      return createErrorResponse('Invalid type. Must be "student" or "teacher"', 400)
    }

  } catch (error) {
    console.error('Error generating ID cards:', error)
    return createErrorResponse(
      'Failed to generate ID cards',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}

// Handle student ID card generation
async function handleStudentIDCardGeneration(
  request: StudentIDCardRequest, 
  schoolYear: string
) {
  const { variant, studentIds, classId, courseId, userId } = request

  // Validate student-specific parameters
  if (variant === 'single' && (!studentIds || studentIds.length !== 1)) {
    return createErrorResponse('Single student ID card requires exactly one studentId', 400)
  }

  if (variant === 'bulk' && studentIds && studentIds.length > MAX_BULK_ITEMS) {
    return createErrorResponse(`Maximum ${MAX_BULK_ITEMS} students allowed per bulk generation`, 400)
  }

  if (!studentIds && !classId && !courseId) {
    return createErrorResponse('Either studentIds, classId, or courseId is required', 400)
  }

  try {
    // Fetch student data
    const { students, actualStudentIds } = await fetchStudentData({
      studentIds,
      classId,
      courseId,
      schoolYear
    })

    // Process student data
    const processedStudents = await processStudentData(students, schoolYear)

    let result
    let filename

    if (variant === 'single') {
      // Generate single student ID card
      const studentData = processedStudents[0]
      result = await pdfManager.generatePDF(ReportType.STUDENT_ID_CARD, studentData)
      filename = createSafeFilename('student', 'single', 1, [studentData.firstName, studentData.lastName])
    } else if (variant === 'back') {
      // Generate student ID card backs
      const bulkStudentIdCardBackData = {
        students: processedStudents,
        schoolYear,
        generatedAt: new Date().toISOString()
      }
      result = await generateBulkStudentIDCardBackPDF(bulkStudentIdCardBackData)
      filename = createSafeFilename('student', 'back', students.length)
    } else {
      // Generate bulk student ID cards (front)
      const bulkStudentIdCardData = {
        students: processedStudents,
        schoolYear,
        generatedAt: new Date().toISOString()
      }
      result = await pdfManager.generatePDF(ReportType.BULK_STUDENT_ID_CARD, bulkStudentIdCardData)
      filename = createSafeFilename('student', 'bulk', students.length)
    }

    // Log activity
    if (userId) {
      await logActivity(
        userId,
        ActivityMessages.GENERATE_STUDENT_ID_CARD,
        `បង្កើតប័ណ្ណសំគាល់សិស្ស (${variant}) - ${students.length} សិស្ស`
      )
    }

    return createPDFResponse(result.buffer, filename)

  } catch (error) {
    console.error('Error generating student ID cards:', error)
    return createErrorResponse(
      'Failed to generate student ID cards',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}

// Handle teacher ID card generation
async function handleTeacherIDCardGeneration(
  request: TeacherIDCardRequest,
  schoolYear: string
) {
  const { variant, userIds, userId } = request

  // Validate teacher-specific parameters
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return createErrorResponse('User IDs array is required', 400)
  }

  if (variant === 'single' && userIds.length !== 1) {
    return createErrorResponse('Single teacher ID card requires exactly one userId', 400)
  }

  if (variant === 'bulk' && userIds.length > MAX_BULK_ITEMS) {
    return createErrorResponse(`Maximum ${MAX_BULK_ITEMS} teachers allowed per bulk generation`, 400)
  }

  try {
    // Fetch teacher data
    const teachers = await fetchTeacherData(userIds)

    // Process teacher data
    const processedTeachers = processTeacherData(teachers)

    let result
    let filename

    if (variant === 'single') {
      // Generate single teacher ID card
      const teacherData = processedTeachers[0]
      result = await pdfManager.generatePDF(ReportType.TEACHER_ID_CARD, teacherData)
      filename = createSafeFilename('teacher', 'single', 1, [teacherData.firstName, teacherData.lastName])
    } else {
      // Generate bulk teacher ID cards
      const bulkTeacherIdCardData = {
        teachers: processedTeachers,
        schoolYear,
        generatedAt: new Date().toISOString()
      }
      result = await pdfManager.generatePDF(ReportType.BULK_TEACHER_ID_CARD, bulkTeacherIdCardData)
      filename = createSafeFilename('teacher', 'bulk', teachers.length)
    }

    // Log activity
    if (userId) {
      await logActivity(
        userId,
        ActivityMessages.GENERATE_TEACHER_ID_CARD,
        `បង្កើតប័ណ្ណសំគាល់គ្រូ (${variant}) - ${teachers.length} គ្រូ`
      )
    }

    return createPDFResponse(result.buffer, filename)

  } catch (error) {
    console.error('Error generating teacher ID cards:', error)
    return createErrorResponse(
      'Failed to generate teacher ID cards',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}
