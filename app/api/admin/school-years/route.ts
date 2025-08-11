import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET all school years
export async function GET() {
  try {
    const schoolYears = await prisma.schoolYear.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(schoolYears)
  } catch (error) {
    console.error('Error fetching school years:', error)
    return NextResponse.json(
      { error: 'Failed to fetch school years' },
      { status: 500 }
    )
  }
}

// POST new school year
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { schoolyear } = body

    if (!schoolyear) {
      return NextResponse.json(
        { error: 'School year is required' },
        { status: 400 }
      )
    }

    const newSchoolYear = await prisma.schoolYear.create({
      data: {
        schoolyear
      }
    })

    return NextResponse.json(newSchoolYear, { status: 201 })
  } catch (error) {
    console.error('Error creating school year:', error)
    return NextResponse.json(
      { error: 'Failed to create school year' },
      { status: 500 }
    )
  }
}
