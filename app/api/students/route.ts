import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all students with complete data
export async function GET(request: NextRequest) {
  try {
    const students = await prisma.student.findMany({
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ],
      include: {
        guardians: true,
        family: true,
        scholarships: true
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
