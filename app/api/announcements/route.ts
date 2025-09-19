import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all announcements
export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}

// POST - Create new announcement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, author, published = false } = body

    // Validate required fields
    if (!title || !content || !author) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, author' },
        { status: 400 }
      )
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        author,
        published
      }
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    )
  }
}

// PUT - Update announcement
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, content, author, published } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing announcement ID' },
        { status: 400 }
      )
    }

    const announcement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        author,
        published
      }
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error('Error updating announcement:', error)
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    )
  }
}

// DELETE - Delete announcement
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing announcement ID' },
        { status: 400 }
      )
    }

    await prisma.announcement.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    )
  }
}
