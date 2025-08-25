import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET specific subject
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    const subject = await prisma.subject.findUnique({
      where: { subjectId: id }
    })

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(subject)
  } catch (error) {
    console.error('Error fetching subject:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subject' },
      { status: 500 }
    )
  }
}

// PUT update subject
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { subjectName } = body

    if (!subjectName) {
      return NextResponse.json(
        { error: 'Subject name is required' },
        { status: 400 }
      )
    }

    const updatedSubject = await prisma.subject.update({
      where: { subjectId: id },
      data: {
        subjectName
      }
    })

    return NextResponse.json(updatedSubject)
  } catch (error) {
    console.error('Error updating subject:', error)
    return NextResponse.json(
      { error: 'Failed to update subject' },
      { status: 500 }
    )
  }
}

// DELETE subject
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    // Check if there are grades using this subject
    const gradesCount = await prisma.grade.count({
      where: { subjectId: id }
    })

    if (gradesCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete subject with existing grades' },
        { status: 400 }
      )
    }

    await prisma.subject.delete({
      where: { subjectId: id }
    })

    return NextResponse.json({ message: 'Subject deleted successfully' })
  } catch (error) {
    console.error('Error deleting subject:', error)
    return NextResponse.json(
      { error: 'Failed to delete subject' },
      { status: 500 }
    )
  }
}
