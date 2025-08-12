import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch all enrollments
export async function GET() {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        course: {
          include: {
            schoolYear: true
          }
        },
        student: true
      },
      orderBy: {
        enrollmentId: 'desc'
      }
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}

// POST: Create new enrollment(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, studentIds } = body

    if (!courseId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Course ID and student IDs are required' },
        { status: 400 }
      )
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { courseId: parseInt(courseId) }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if students exist
    const students = await prisma.student.findMany({
      where: {
        studentId: { in: studentIds.map(id => parseInt(id)) }
      }
    })

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: 'Some students not found' },
        { status: 404 }
      )
    }

    // Check for existing enrollments to avoid duplicates
    const existingEnrollments = await prisma.enrollment.findMany({
      where: {
        courseId: parseInt(courseId),
        studentId: { in: studentIds.map(id => parseInt(id)) }
      }
    })

    if (existingEnrollments.length > 0) {
      const existingStudentIds = existingEnrollments.map(e => e.studentId)
      return NextResponse.json(
        { 
          error: 'Some students are already enrolled in this course',
          existingStudentIds 
        },
        { status: 400 }
      )
    }

    // Create enrollments
    const enrollments = await prisma.enrollment.createMany({
      data: studentIds.map(studentId => ({
        courseId: parseInt(courseId),
        studentId: parseInt(studentId),
        drop: false
      }))
    })

    // Fetch the created enrollments with full details
    const createdEnrollments = await prisma.enrollment.findMany({
      where: {
        courseId: parseInt(courseId),
        studentId: { in: studentIds.map(id => parseInt(id)) }
      },
      include: {
        course: {
          include: {
            schoolYear: true
          }
        },
        student: true
      }
    })

    return NextResponse.json({
      message: `Successfully enrolled ${enrollments.count} students`,
      enrollments: createdEnrollments
    })
  } catch (error) {
    console.error('Error creating enrollments:', error)
    return NextResponse.json(
      { error: 'Failed to create enrollments' },
      { status: 500 }
    )
  }
}
