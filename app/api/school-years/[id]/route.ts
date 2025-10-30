import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { logActivity, ActivityMessages } from '@/lib/activity-logger'

const prisma = new PrismaClient()

// GET specific school year
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    
    const schoolYear = await prisma.schoolYear.findUnique({
      where: { schoolYearId: id }
    })

    if (!schoolYear) {
      return NextResponse.json(
        { error: 'School year not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(schoolYear)
  } catch (error) {
    console.error('Error fetching school year:', error)
    return NextResponse.json(
      { error: 'Failed to fetch school year' },
      { status: 500 }
    )
  }
}

// PUT update school year
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    const body = await request.json()
    const { schoolYearCode, userId } = body

    if (!schoolYearCode) {
      return NextResponse.json(
        { error: 'School year code is required' },
        { status: 400 }
      )
    }

    const updatedSchoolYear = await prisma.schoolYear.update({
      where: { schoolYearId: id },
      data: {
        schoolYearCode
      }
    })

    // Log activity
    if (userId) {
      await logActivity(userId, ActivityMessages.EDIT_SCHOOL_YEAR, `កែប្រែឆ្នាំសិក្សា ${updatedSchoolYear.schoolYearCode}`)
    }

    return NextResponse.json(updatedSchoolYear)
  } catch (error) {
    console.error('Error updating school year:', error)
    return NextResponse.json(
      { error: 'Failed to update school year' },
      { status: 500 }
    )
  }
}

// DELETE school year
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Get school year info before deleting
    const schoolYear = await prisma.schoolYear.findUnique({
      where: { schoolYearId: id }
    })

    // Check if there are courses using this school year
    const coursesCount = await prisma.course.count({
      where: { schoolYearId: id }
    })

    if (coursesCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete school year with existing courses' },
        { status: 400 }
      )
    }

    await prisma.schoolYear.delete({
      where: { schoolYearId: id }
    })

    // Log activity
    if (userId && schoolYear) {
      await logActivity(parseInt(userId), ActivityMessages.DELETE_SCHOOL_YEAR, `លុបឆ្នាំសិក្សា ${schoolYear.schoolYearCode}`)
    }

    return NextResponse.json({ message: 'School year deleted successfully' })
  } catch (error) {
    console.error('Error deleting school year:', error)
    return NextResponse.json(
      { error: 'Failed to delete school year' },
      { status: 500 }
    )
  }
}
