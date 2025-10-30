/*
 * ID Card Utilities
 * 
 * Shared utilities for ID card generation routes
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Constants
const DEFAULT_TEACHER_NAME = 'គ្រូបង្រៀន'
const DEFAULT_SCHOOL_YEAR = '2024-2025'

// Phone number formatting function
export function formatPhoneNumber(phone: string | undefined | null): string {
  if (!phone) {
    return '........'
  }
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // If empty after cleaning, return formatted placeholder
  if (digits.length === 0) {
    return '........'
  }
  
  // Handle international numbers (remove country code if present)
  let processedDigits = digits
  if (digits.startsWith('855') && digits.length === 12) {
    // For Cambodian numbers, country code is +855, so remove it
    processedDigits = digits.slice(3) // Remove 855 country code
  }
  // For all other cases, use all digits as-is for 3-digit grouping
  
  // Handle different phone number lengths - always group by 3 digits from start
  if (processedDigits.length >= 7) {
    // For 7+ digits, format in groups of 3 from the start
    const groups = []
    let remaining = processedDigits
    
    // Always take groups of 3 digits
    while (remaining.length > 0) {
      if (remaining.length >= 3) {
        groups.push(remaining.slice(0, 3))
        remaining = remaining.slice(3)
      } else {
        // For the last group (1-2 digits), add it as is
        groups.push(remaining)
        remaining = ''
      }
    }
    
    return groups.join(' ')
  }
  
  // For shorter numbers, return formatted placeholder
  return '........'
}

// Helper function to get teacher information for a course
export async function getTeacherInfo(course: any) {
  const teacherIds = [course.teacherId1, course.teacherId2, course.teacherId3].filter(Boolean)
  
  if (teacherIds.length === 0) {
    return {
      teacherName: DEFAULT_TEACHER_NAME,
      teacherPhone: ''
    }
  }

  try {
    // Get the first available teacher (teacherId1 is primary)
    const teacher = await prisma.user.findUnique({
      where: { userId: course.teacherId1 || teacherIds[0] },
      select: {
        username: true,
        phonenumber1: true,
        phonenumber2: true
      }
    })

    if (teacher) {
      // Combine both phone numbers if available and format them
      const phoneNumbers = [teacher.phonenumber1, teacher.phonenumber2].filter(Boolean)
      const formattedPhones = phoneNumbers.map(phone => formatPhoneNumber(phone))
      const teacherPhone = formattedPhones.length > 0 ? formattedPhones.join(' / ') : '........'
      
      return {
        teacherName: teacher.username,
        teacherPhone: teacherPhone
      }
    }
  } catch (error) {
    console.error('Error fetching teacher info:', error)
  }

  return {
    teacherName: DEFAULT_TEACHER_NAME,
    teacherPhone: ''
  }
}

// Create safe filename for download
export function createSafeFilename(type: string, variant: string, count: number, names: string[] = []) {
  const baseName = `${type}-id-card${variant ? `-${variant}` : ''}`
  const countSuffix = count > 1 ? `-${count}-${type === 'student' ? 'students' : 'teachers'}` : ''
  const nameSuffix = names.length > 0 ? `-${names.slice(0, 2).join('-')}` : ''
  
  return `${baseName}${countSuffix}${nameSuffix}.pdf`
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

// Create PDF response with proper headers
export function createPDFResponse(buffer: Buffer, filename: string) {
  return new NextResponse(buffer as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'no-cache'
    }
  })
}

// Create error response
export function createErrorResponse(message: string, status: number, details?: string) {
  return NextResponse.json(
    { 
      error: message,
      ...(details && { details })
    },
    { status }
  )
}

// Fetch student data with all relations
export async function fetchStudentData(params: {
  studentIds?: number[]
  classId?: string
  courseId?: number
  schoolYear?: string
}) {
  const { studentIds, classId, courseId } = params

  // Common query options
  const commonInclude = {
    guardians: true,
    family: true,
    enrollments: {
      include: {
        course: {
          include: {
            schoolYear: true,
          }
        }
      }
    }
  }

  const commonOrderBy = [
    { firstName: 'asc' as const },
    { lastName: 'asc' as const }
  ]

  let students
  let actualStudentIds

  try {
    if (courseId) {
      // Generate for all students enrolled in the specific course
      students = await prisma.student.findMany({
        where: { 
          status: 'active',
          enrollments: {
            some: {
              courseId: parseInt(courseId.toString()),
              drop: false
            }
          }
        },
        orderBy: commonOrderBy,
        include: commonInclude
      })
      actualStudentIds = students.map(s => s.studentId)
    } else if (classId) {
      // Generate for all students in the class
      students = await prisma.student.findMany({
        where: { 
          class: classId.toString(),
          status: 'active'
        },
        orderBy: commonOrderBy,
        include: commonInclude
      })
      actualStudentIds = students.map(s => s.studentId)
    } else if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      // Generate for selected students only
      students = await prisma.student.findMany({
        where: { 
          studentId: { 
            in: studentIds.map(id => parseInt(id.toString())) 
          } 
        },
        include: commonInclude
      })
      actualStudentIds = studentIds
    } else {
      throw new Error('Either studentIds, classId, or courseId is required')
    }

    if (students.length === 0) {
      throw new Error('No students found')
    }

    return { students, actualStudentIds }
  } catch (error) {
    console.error('Error fetching student data:', error)
    throw error
  }
}

// Fetch teacher data
export async function fetchTeacherData(userIds: number[]) {
  try {
    const teachers = await prisma.user.findMany({
      where: { 
        userId: { 
          in: userIds.map(id => parseInt(id.toString())) 
        },
        role: { in: ['admin', 'teacher'] }
      },
      select: {
        userId: true,
        firstname: true,
        lastname: true,
        username: true,
        role: true,
        position: true,
        phonenumber1: true,
        phonenumber2: true
        // photo and avatar removed - not needed for ID cards
      }
    })

    if (teachers.length === 0) {
      throw new Error('No teachers found')
    }

    return teachers
  } catch (error) {
    console.error('Error fetching teacher data:', error)
    throw error
  }
}

// Process student data for ID card generation
export async function processStudentData(students: any[], schoolYear?: string) {
  const targetSchoolYear = schoolYear || DEFAULT_SCHOOL_YEAR
  
  return await Promise.all(students.map(async student => {
    // Get teacher info and course info from the student's course enrollment
    let teacherInfo = { teacherName: DEFAULT_TEACHER_NAME, teacherPhone: '' }
    let courseInfo = { courseName: '', section: '', fullClass: '' }
    
    if (student.enrollments && student.enrollments.length > 0) {
      // Find the course that matches the student's class and school year
      const matchingCourse = student.enrollments.find((enrollment: any) => 
        enrollment.course.grade === student.class && 
        enrollment.course.schoolYear.schoolYearCode === targetSchoolYear
      )
      
      if (matchingCourse) {
        // Get course info
        courseInfo = {
          courseName: matchingCourse.course.courseName,
          section: matchingCourse.course.section,
          fullClass: `ថ្នាក់ទី ${matchingCourse.course.grade}${matchingCourse.course.section}`
        }
        
        // Get teacher info using the existing function
        teacherInfo = await getTeacherInfo(matchingCourse.course)
      }
    }

    // Get guardian information (first guardian or default for backward compatibility)
    const guardian = student.guardians && student.guardians.length > 0 ? student.guardians[0] : null
    const guardianInfo = guardian ? {
      name: `${guardian.lastName || ''} ${guardian.firstName || ''}`.trim(),
      relation: guardian.relation || '',
      phone: guardian.phone || ''
    } : {
      name: '',
      relation: '',
      phone: ''
    }

    // Get all guardians information for ID card back
    const guardiansInfo = student.guardians && student.guardians.length > 0
      ? student.guardians.map((g: any) => ({
          name: `${g.lastName || ''} ${g.firstName || ''}`.trim(),
          relation: g.relation || '',
          phone: g.phone || ''
        }))
      : []

    return {
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      gender: student.gender,
      dob: student.dob.toISOString(),
      class: student.class,
      classDisplay: courseInfo.fullClass || student.class,
      photo: student.photo,
      phone: student.phone,
      schoolYear: student.schoolYear || DEFAULT_SCHOOL_YEAR,
      studentIdNumber: student.studentId.toString(),
      teacherName: teacherInfo.teacherName,
      teacherPhone: teacherInfo.teacherPhone,
      courseName: courseInfo.courseName,
      section: courseInfo.section,
      guardian: guardianInfo,
      guardians: guardiansInfo,  // Add all guardians for ID card back
      generatedAt: new Date().toISOString()
    }
  }))
}

// Process teacher data for ID card generation
export function processTeacherData(teachers: any[]) {
  return teachers.map(teacher => {
    // Combine both phone numbers if available and format them
    const phoneNumbers = [teacher.phonenumber1, teacher.phonenumber2].filter(Boolean)
    const formattedPhones = phoneNumbers.map(phone => formatPhoneNumber(phone))
    const phoneText = formattedPhones.length > 0 ? formattedPhones.join(' ') : '........'
    
    return {
      userId: teacher.userId,
      firstName: teacher.firstname,
      lastName: teacher.lastname,
      username: teacher.username,
      role: teacher.role,
      position: teacher.position,
      phone: phoneText,
      // photo and avatar removed - always show 3x4 placeholder for manual photo attachment
      generatedAt: new Date().toISOString()
    }
  })
}
