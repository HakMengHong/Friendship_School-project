import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch attendances by course and date
export async function GET(request: NextRequest) {
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

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    // Build where clause
    const whereClause: any = {
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
  } catch (error) {
    console.error('Error fetching attendances:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new attendance record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, courseId, attendanceDate, session, status, reason, recordedBy } = body

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
        studentId: parseInt(studentId),
        courseId: parseInt(courseId),
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

    // Create new attendance record
    const attendance = await prisma.attendance.create({
      data: {
        studentId: parseInt(studentId),
        courseId: parseInt(courseId),
        attendanceDate: new Date(attendanceDate),
        session: session,
        status: status,
        reason: reason || null,
        recordedBy: recordedBy || null
      },
      include: {
        student: true,
        course: true
      }
    })

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    console.error('Error creating attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update existing attendance record
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const attendanceId = searchParams.get('attendanceId')
    const body = await request.json()
    const { studentId, courseId, attendanceDate, session, status, reason, recordedBy } = body

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

    // Update attendance record
    const attendance = await prisma.attendance.update({
      where: { attendanceId: parseInt(attendanceId) },
      data: {
        studentId: parseInt(studentId),
        courseId: parseInt(courseId),
        attendanceDate: new Date(attendanceDate),
        session: session,
        status: status,
        reason: reason || null,
        recordedBy: recordedBy || null
      },
      include: {
        student: true,
        course: true
      }
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error updating attendance:', error)
    if (error.code === 'P2025') {
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
  } catch (error) {
    console.error('Error deleting attendance:', error)
    if (error.code === 'P2025') {
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
