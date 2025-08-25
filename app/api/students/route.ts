import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all students
export async function GET(request: NextRequest) {
  try {
    const students = await prisma.student.findMany({
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ],
      select: {
        studentId: true,
        firstName: true,
        lastName: true,
        class: true,
        status: true,
        registrationDate: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
