import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logActivity, ActivityMessages } from '@/lib/activity-logger';

export async function GET() {
  try {
    // Get all school years from SchoolYear table
    const schoolYears = await prisma.schoolYear.findMany({
      select: {
        schoolYearId: true,
        schoolYearCode: true,
        createdAt: true
      },
      orderBy: {
        schoolYearCode: 'desc'
      }
    });

    return NextResponse.json(schoolYears);
  } catch (error) {
    console.error('Error fetching school years:', error);
    return NextResponse.json(
      { error: 'Failed to fetch school years' },
      { status: 500 }
    );
  }
}

// POST new school year
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { schoolYearCode, userId } = body

    if (!schoolYearCode) {
      return NextResponse.json(
        { error: 'School year code is required' },
        { status: 400 }
      )
    }

    const newSchoolYear = await prisma.schoolYear.create({
      data: {
        schoolYearCode
      }
    })

    // Log activity
    if (userId) {
      await logActivity(userId, ActivityMessages.ADD_SCHOOL_YEAR, `បង្កើតឆ្នាំសិក្សា ${newSchoolYear.schoolYearCode}`)
    }

    return NextResponse.json(newSchoolYear, { status: 201 })
  } catch (error) {
    console.error('Error creating school year:', error)
    return NextResponse.json(
      { error: 'Failed to create school year' },
      { status: 500 }
    )
  }
}
