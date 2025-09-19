import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pdfManager } from '@/lib/pdf-generators/core/pdf-manager'
import { ReportType } from '@/lib/pdf-generators/core/types'

export async function POST(request: NextRequest) {
  try {
    const { userIds, schoolYear } = await request.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'User IDs array is required' },
        { status: 400 }
      )
    }

    // Limit to 4 teachers per page for optimal layout
    if (userIds.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 teachers allowed per bulk generation' },
        { status: 400 }
      )
    }

    // Fetch teachers data
    const teachers = await prisma.user.findMany({
      where: { 
        userId: { 
          in: userIds.map(id => parseInt(id)) 
        },
        role: { in: ['admin', 'teacher'] } // Only admin and teacher roles
      },
      select: {
        userId: true,
        firstname: true,
        lastname: true,
        username: true,
        role: true,
        position: true,
        phonenumber1: true,
        phonenumber2: true,
        photo: true,
        avatar: true
      }
    })

    if (teachers.length === 0) {
      return NextResponse.json(
        { error: 'No teachers found' },
        { status: 404 }
      )
    }

    // Prepare bulk teacher ID card data
    const bulkTeacherIdCardData = {
      teachers: teachers.map(teacher => {
        // Combine both phone numbers if available (no separator for ID cards)
        const phoneNumbers = [teacher.phonenumber1, teacher.phonenumber2].filter(Boolean)
        const phoneText = phoneNumbers.length > 0 ? phoneNumbers.join(' ') : '........'
        
        return {
          userId: teacher.userId,
          firstName: teacher.firstname,
          lastName: teacher.lastname,
          username: teacher.username,
          role: teacher.role,
          position: teacher.position,
          phone: phoneText,
          photo: teacher.photo,
          avatar: teacher.avatar,
          generatedAt: new Date().toISOString()
        }
      }),
      schoolYear: schoolYear || '2024-2025',
      generatedAt: new Date().toISOString()
    }

    // Generate PDF
    const result = await pdfManager.generatePDF(ReportType.BULK_TEACHER_ID_CARD, bulkTeacherIdCardData)

    // Create safe filename for download
    const safeFilename = `bulk-teacher-id-cards-${teachers.length}-teachers.pdf`
      .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens

    // Stream PDF directly to client
    return new NextResponse(result.buffer as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Content-Length': result.buffer.length.toString(),
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Error generating bulk teacher ID cards:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate bulk teacher ID cards',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
