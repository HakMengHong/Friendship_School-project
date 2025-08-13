import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Fetch all semesters
export async function GET(request: NextRequest) {
  try {
    const semesters = await prisma.semester.findMany({
      orderBy: [
        { semester: 'asc' },
        { semesterCode: 'asc' }
      ]
    })

    return NextResponse.json(semesters)
  } catch (error) {
    console.error('Error fetching semesters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch semesters' },
      { status: 500 }
    )
  }
}
