import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

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
    const { schoolYearCode } = body

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

    return NextResponse.json({ message: 'School year deleted successfully' })
  } catch (error) {
    console.error('Error deleting school year:', error)
    return NextResponse.json(
      { error: 'Failed to delete school year' },
      { status: 500 }
    )
  }
}
