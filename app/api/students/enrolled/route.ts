import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Fetch enrolled students with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolYearId = searchParams.get('schoolYearId')
    const courseId = searchParams.get('courseId')
    const semesterId = searchParams.get('semesterId')
    const searchTerm = searchParams.get('search')

    let whereClause: any = {
      enrollments: {
        some: {} // Must have at least one enrollment
      }
    }

    if (schoolYearId) {
      whereClause.enrollments = {
        some: {
          course: {
            schoolYearId: parseInt(schoolYearId)
          }
        }
      }
    }

    if (courseId) {
      whereClause.enrollments = {
        some: {
          courseId: parseInt(courseId)
        }
      }
    }

    if (searchTerm) {
      whereClause.OR = [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        enrollments: {
          where: {
            ...(schoolYearId && {
              course: {
                schoolYearId: parseInt(schoolYearId)
              }
            }),
            ...(courseId && {
              courseId: parseInt(courseId)
            })
          },
          include: {
            course: {
              include: {
                schoolYear: true
              }
            }
          }
        }
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    // Filter students based on semester if specified
    let filteredStudents = students
    if (semesterId) {
      filteredStudents = students.filter(student => {
        // Check if student has grades in the specified semester
        return student.enrollments.some(enrollment => {
          // For now, we'll include all enrolled students
          // In the future, we could check if they have grades in this semester
          return true
        })
      })
    }

    return NextResponse.json(filteredStudents)
  } catch (error) {
    console.error('Error fetching enrolled students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrolled students' },
      { status: 500 }
    )
  }
}
