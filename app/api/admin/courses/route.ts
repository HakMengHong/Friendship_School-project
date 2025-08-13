import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Fetch all courses with school year information
export async function GET(request: NextRequest) {
  try {
    const courses = await prisma.course.findMany({
      include: {
        schoolYear: {
          select: {
            schoolYearId: true,
            schoolYearCode: true
          }
        }
      },
      orderBy: [
        { schoolYear: { schoolYearCode: 'desc' } },
        { grade: 'asc' },
        { section: 'asc' }
      ]
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

// POST new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { schoolYearId, grade, section, courseName, teacherId1, teacherId2, teacherId3 } = body

    if (!schoolYearId || !grade || !section) {
      return NextResponse.json(
        { error: 'School year, grade, and section are required' },
        { status: 400 }
      )
    }

    // Check if course already exists for this school year, grade, and section
    const existingCourse = await prisma.course.findFirst({
      where: {
        schoolYearId: parseInt(schoolYearId),
        grade,
        section
      }
    })

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course already exists for this grade and section in the selected school year' },
        { status: 400 }
      )
    }

    const newCourse = await prisma.course.create({
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

    return NextResponse.json(newCourse, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
