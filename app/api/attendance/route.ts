import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch attendances by course and date
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    const attendanceId = searchParams.get('attendanceId')

    if (attendanceId) {
      // Get specific attendance record
      const attendance = await prisma.attendance.findUnique({
        where: { attendanceId: parseInt(attendanceId) },
        include: {
          student: true,
          course: true
        }
      })

      if (!attendance) {
        return NextResponse.json({ error: 'Attendance not found' }, { status: 404 })
      }

      return NextResponse.json(attendance)
    }

    // If no date provided, return all attendance data (for getting unique dates)
    if (!date) {
      const attendances = await prisma.attendance.findMany({
        select: {
          attendanceDate: true
        },
        distinct: ['attendanceDate'],
        orderBy: {
          attendanceDate: 'desc'
        }
      })
      return NextResponse.json(attendances)
    }

    // Build where clause
    const whereClause: Record<string, unknown> = {
      attendanceDate: new Date(date)
    }

    // Add courseId filter only if provided
    if (courseId) {
      whereClause.courseId = parseInt(courseId)
    }

    // Add status filter only if provided
    if (status) {
      whereClause.status = status
    }

    // Get attendances for the date (and optionally filtered by course)
    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: true,
        course: true
      },
      orderBy: [
        { student: { firstName: 'asc' } },
        { session: 'asc' }
      ]
    })

    return NextResponse.json(attendances)
  } catch (error: unknown) {
    console.error('Error fetching attendances:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new attendance record
export async function POST(request: Request) {
  try {
    const body: {
      studentId: number
      courseId: number
      attendanceDate: string
      session: 'AM' | 'PM' | 'FULL'
      status: string
      reason?: string
      recordedBy?: string
      semesterId?: number
    } = await request.json()
    const { studentId, courseId, attendanceDate, session, status, reason, recordedBy, semesterId } = body

    // Validate required fields
    if (!studentId || !courseId || !attendanceDate || !session || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if attendance already exists for this student, course, date, and session
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        studentId: studentId,
        courseId: courseId,
        attendanceDate: new Date(attendanceDate),
        session: session
      }
    })

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance record already exists for this student, course, date, and session' },
        { status: 409 }
      )
    }

    // Determine semesterId if not provided (based on attendanceDate)
    let resolvedSemesterId: number | null = null
    try {
      if (semesterId) {
        resolvedSemesterId = semesterId
      } else if (attendanceDate) {
        const dateObj = new Date(attendanceDate)
        const month = dateObj.getMonth() + 1
        // Map months: Sep-Dec -> S1, Jan-Jun -> S2 (typical academic calendar)
        const semesterCode = (month >= 9 || month <= 12) && month >= 9 ? 'S1' : 'S2'
        const semester = await prisma.semester.findFirst({ where: { semesterCode } })
        resolvedSemesterId = semester ? semester.semesterId : null
      }
    } catch (e) {
      resolvedSemesterId = null
    }

    // Create new attendance record
    const attendance = await prisma.attendance.create({
      data: {
        studentId: studentId,
        courseId: courseId,
        attendanceDate: new Date(attendanceDate),
        session: session,
        status: status,
        reason: reason || null,
        recordedBy: recordedBy || null,
        semesterId: resolvedSemesterId || undefined
      },
      include: {
        student: true,
        course: true
      }
    })

    return NextResponse.json(attendance, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update existing attendance record
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const attendanceId = searchParams.get('attendanceId')
    const body: {
      studentId: number
      courseId: number
      attendanceDate: string
      session: 'AM' | 'PM' | 'FULL'
      status: string
      reason?: string
      recordedBy?: string
      semesterId?: number
    } = await request.json()
    const { studentId, courseId, attendanceDate, session, status, reason, recordedBy, semesterId } = body

    if (!attendanceId) {
      return NextResponse.json(
        { error: 'Attendance ID is required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!studentId || !courseId || !attendanceDate || !session || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // First check if the attendance record still exists
    const existingRecord = await prisma.attendance.findUnique({
      where: { attendanceId: parseInt(attendanceId) }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Attendance record not found. It may have been deleted.' },
        { status: 404 }
      )
    }

    // Determine semesterId if not provided (based on attendanceDate)
    let resolvedSemesterId: number | null = null
    try {
      if (semesterId) {
        resolvedSemesterId = semesterId
      } else if (attendanceDate) {
        const dateObj = new Date(attendanceDate)
        const month = dateObj.getMonth() + 1
        const semesterCode = (month >= 9 || month <= 12) && month >= 9 ? 'S1' : 'S2'
        const semester = await prisma.semester.findFirst({ where: { semesterCode } })
        resolvedSemesterId = semester ? semester.semesterId : null
      }
    } catch (e) {
      resolvedSemesterId = null
    }

    // Update attendance record
    const attendance = await prisma.attendance.update({
      where: { attendanceId: parseInt(attendanceId) },
      data: {
        studentId: studentId,
        courseId: courseId,
        attendanceDate: new Date(attendanceDate),
        session: session,
        status: status,
        reason: reason || null,
        recordedBy: recordedBy || null,
        semesterId: resolvedSemesterId || undefined
      },
      include: {
        student: true,
        course: true
      }
    })

    return NextResponse.json(attendance)
  } catch (error: unknown) {
    console.error('Error updating attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete attendance record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const attendanceId = searchParams.get('attendanceId')

    if (!attendanceId) {
      return NextResponse.json(
        { error: 'Attendance ID is required' },
        { status: 400 }
      )
    }

    // Delete attendance record
    await prisma.attendance.delete({
      where: { attendanceId: parseInt(attendanceId) }
    })

    return NextResponse.json({ message: 'Attendance record deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting attendance:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
