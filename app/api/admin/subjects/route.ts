import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET all subjects
export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { subjectName: 'asc' }
    })
    
    return NextResponse.json(subjects)
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
}

// POST new subject
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subjectName, subjectCode } = body

    if (!subjectName || !subjectCode) {
      return NextResponse.json(
        { error: 'Subject name and code are required' },
        { status: 400 }
      )
    }

    // Check if subject code already exists
    const existingSubject = await prisma.subject.findUnique({
      where: { subjectCode }
    })

    if (existingSubject) {
      return NextResponse.json(
        { error: 'Subject code already exists' },
        { status: 400 }
      )
    }

    const newSubject = await prisma.subject.create({
      data: {
        subjectName,
        subjectCode
      }
    })

    return NextResponse.json(newSubject, { status: 201 })
  } catch (error) {
    console.error('Error creating subject:', error)
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    )
  }
}
