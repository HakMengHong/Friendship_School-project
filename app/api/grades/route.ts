import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Fetch grades with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')
    const subjectId = searchParams.get('subjectId')
    const semesterId = searchParams.get('semesterId')
    const schoolYearId = searchParams.get('schoolYearId')

    let whereClause: any = {}

    if (studentId) {
      whereClause.studentId = parseInt(studentId)
    }

    if (courseId) {
      whereClause.courseId = parseInt(courseId)
    }

    if (subjectId) {
      whereClause.subjectId = parseInt(subjectId)
    }

    if (semesterId) {
      whereClause.semesterId = parseInt(semesterId)
    }

    if (schoolYearId) {
      whereClause.course = {
        schoolYearId: parseInt(schoolYearId)
      }
    }

    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            studentId: true,
            firstName: true,
            lastName: true,
            photo: true,
            class: true,
            gender: true
          }
        },
        subject: {
          select: {
            subjectId: true,
            subjectName: true
          }
        },
        course: {
          select: {
            courseId: true,
            courseName: true,
            grade: true,
            section: true,
            schoolYear: {
              select: {
                schoolYearId: true,
                schoolYearCode: true
              }
            }
          }
        },
        semester: {
          select: {
            semesterId: true,
            semester: true,
            semesterCode: true
          }
        },
        user: {
          select: {
            userId: true,
            firstname: true,
            lastname: true,
            role: true
          }
        }
      },
      orderBy: [
        { course: { schoolYear: { schoolYearCode: 'desc' } } },
        { course: { grade: 'asc' } },
        { course: { section: 'asc' } },
        { student: { firstName: 'asc' } },
        { subject: { subjectName: 'asc' } }
      ]
    })

    return NextResponse.json(grades)
  } catch (error) {
    console.error('Error fetching grades:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
      { status: 500 }
    )
  }
}

// POST: Create new grade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 API: Received grade creation request:', body)
    
    const {
      studentId,
      subjectId,
      courseId,
      semesterId,
      grade,
      gradeComment,
      userId,
      gradeDate
    } = body

    // Validate required fields
    if (!studentId) {
      return NextResponse.json(
        { error: 'Missing required field: studentId' },
        { status: 400 }
      )
    }
    if (!subjectId) {
      return NextResponse.json(
        { error: 'Missing required field: subjectId' },
        { status: 400 }
      )
    }
    if (!courseId) {
      return NextResponse.json(
        { error: 'Missing required field: courseId' },
        { status: 400 }
      )
    }
    if (!semesterId) {
      return NextResponse.json(
        { error: 'Missing required field: semesterId' },
        { status: 400 }
      )
    }
    if (grade === undefined) {
      return NextResponse.json(
        { error: 'Missing required field: grade' },
        { status: 400 }
      )
    }

    // Validate gradeDate format (should be "MM/YY")
    if (gradeDate && !/^\d{2}\/\d{2}$/.test(gradeDate)) {
      return NextResponse.json(
        { error: 'Invalid gradeDate format. Expected format: MM/YY (e.g., "12/25")' },
        { status: 400 }
      )
    }

    // Validate grade range
    if (grade < 0 || grade > 100) {
      return NextResponse.json(
        { error: 'Grade must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Check if grade already exists for this student, subject, course, semester, and gradeDate
    const existingGrade = await prisma.grade.findFirst({
      where: {
        studentId: parseInt(studentId),
        subjectId: parseInt(subjectId),
        courseId: parseInt(courseId),
        semesterId: parseInt(semesterId),
        gradeDate: gradeDate || `${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getFullYear()).slice(-2)}`
      }
    })

    if (existingGrade) {
      return NextResponse.json(
        { error: 'Grade already exists for this student, subject, course, semester, and date combination' },
        { status: 409 }
      )
    }

    // Generate grade code
    const student = await prisma.student.findUnique({
      where: { studentId: parseInt(studentId) }
    })
    const subject = await prisma.subject.findUnique({
      where: { subjectId: parseInt(subjectId) }
    })
    const course = await prisma.course.findUnique({
      where: { courseId: parseInt(courseId) }
    })
    const semester = await prisma.semester.findUnique({
      where: { semesterId: parseInt(semesterId) }
    })

    // Create new grade
    console.log('🔍 API: Creating grade with data:', {
      studentId: parseInt(studentId),
      subjectId: parseInt(subjectId),
      courseId: parseInt(courseId),
      semesterId: parseInt(semesterId),
      grade: parseFloat(grade),
      gradeComment: gradeComment || null,
      userId: userId ? parseInt(userId) : null,
      gradeDate: gradeDate || `${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getFullYear()).slice(-2)}`
    })
    
    const newGrade = await prisma.grade.create({
      data: {
        studentId: parseInt(studentId),
        subjectId: parseInt(subjectId),
        courseId: parseInt(courseId),
        semesterId: parseInt(semesterId),
        grade: parseFloat(grade),
        gradeComment: gradeComment || null,
        userId: userId ? parseInt(userId) : null,
        gradeDate: gradeDate || `${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getFullYear()).slice(-2)}`
      },
      include: {
        student: {
          select: {
            studentId: true,
            firstName: true,
            lastName: true,
            photo: true,
            class: true,
            gender: true
          }
        },
        subject: {
          select: {
            subjectId: true,
            subjectName: true
          }
        },
        course: {
          select: {
            courseId: true,
            courseName: true,
            grade: true,
            section: true,
            schoolYear: {
              select: {
                schoolYearId: true,
                schoolYearCode: true
              }
            }
          }
        },
        semester: {
          select: {
            semesterId: true,
            semester: true,
            semesterCode: true
          }
        },
        user: {
          select: {
            userId: true,
            firstname: true,
            lastname: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Grade created successfully',
      grade: newGrade
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating grade:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create grade'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    // Check for specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any
      console.error('Prisma error code:', prismaError.code)
      if (prismaError.code === 'P2002') {
        errorMessage = 'Duplicate grade entry'
      } else if (prismaError.code === 'P2003') {
        errorMessage = 'Foreign key constraint failed'
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'Unknown error',
        code: (error as any)?.code || 'UNKNOWN'
      },
      { status: 500 }
    )
  }
}

// PUT: Update existing grade
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 API: Received grade update request:', body)
    
    const {
      grade,
      gradeComment,
      userId,
      gradeDate
    } = body

    // Get gradeId from URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const gradeId = pathParts[pathParts.length - 1]

    if (!gradeId || grade === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: gradeId, grade' },
        { status: 400 }
      )
    }

    if (grade < 0 || grade > 100) {
      return NextResponse.json(
        { error: 'Grade must be between 0 and 100' },
        { status: 400 }
      )
    }

    const updatedGrade = await prisma.grade.update({
      where: { gradeId: parseInt(gradeId) },
      data: {
        grade: parseFloat(grade),
        gradeComment: gradeComment || null,
        userId: userId ? parseInt(userId) : null,
        gradeDate: gradeDate || undefined,
        lastEdit: new Date(),
        updatedAt: new Date()
      },
      include: {
        student: {
          select: {
            studentId: true,
            firstName: true,
            lastName: true,
            photo: true,
            class: true,
            gender: true
          }
        },
        subject: {
          select: {
            subjectId: true,
            subjectName: true
          }
        },
        course: {
          select: {
            courseId: true,
            courseName: true,
            grade: true,
            section: true,
            schoolYear: {
              select: {
                schoolYearId: true,
                schoolYearCode: true
              }
            }
          }
        },
        semester: {
          select: {
            semesterId: true,
            semester: true,
            semesterCode: true
          }
        },
        user: {
          select: {
            userId: true,
            firstname: true,
            lastname: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Grade updated successfully',
      grade: updatedGrade
    })
  } catch (error) {
    console.error('Error updating grade:', error)
    return NextResponse.json(
      { error: 'Failed to update grade' },
      { status: 500 }
    )
  }
}

// DELETE: Delete grade
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gradeId = searchParams.get('gradeId')

    if (!gradeId) {
      return NextResponse.json(
        { error: 'Grade ID is required' },
        { status: 400 }
      )
    }

    const deletedGrade = await prisma.grade.delete({
      where: { gradeId: parseInt(gradeId) },
      include: {
        student: {
          select: {
            studentId: true,
            firstName: true,
            lastName: true
          }
        },
        subject: {
          select: {
            subjectName: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Grade deleted successfully',
      deletedGrade
    })
  } catch (error) {
    console.error('Error deleting grade:', error)
    return NextResponse.json(
      { error: 'Failed to delete grade' },
      { status: 500 }
    )
  }
}
