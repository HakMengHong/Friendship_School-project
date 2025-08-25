import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET specific course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const course = await prisma.course.findUnique({
      where: { courseId: parseInt(id) },
      include: {
        schoolYear: true
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    )
  }
}

// PUT update course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { schoolYearId, grade, section, courseName, teacherId1, teacherId2, teacherId3 } = body

    if (!schoolYearId || !grade || !section) {
      return NextResponse.json(
        { error: 'School year, grade, and section are required' },
        { status: 400 }
      )
    }

    // Check if course already exists for this school year, grade, and section (excluding current course)
    const existingCourse = await prisma.course.findFirst({
      where: {
        schoolYearId: parseInt(schoolYearId),
        grade,
        section,
        courseId: { not: parseInt(id) }
      }
    })

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course already exists for this grade and section in the selected school year' },
        { status: 400 }
      )
    }

    const updatedCourse = await prisma.course.update({
      where: { courseId: parseInt(id) },
      data: {
        schoolYearId: parseInt(schoolYearId),
        grade,
        section,
        courseName: courseName || `ថ្នាក់ទី ${grade} ${section}`,
        teacherId1: teacherId1 || null,
        teacherId2: teacherId2 || null,
        teacherId3: teacherId3 || null
      },
      include: {
        schoolYear: true
      }
    })

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    )
  }
}

// DELETE course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if there are enrollments using this course
    const enrollmentsCount = await prisma.enrollment.count({
      where: { courseId: parseInt(id) }
    })

    if (enrollmentsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with existing enrollments' },
        { status: 400 }
      )
    }

    await prisma.course.delete({
      where: { courseId: parseInt(id) }
    })

    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}
