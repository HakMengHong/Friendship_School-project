import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication - only admins can reset login attempts
    const userCookie = request.cookies.get('user')
    if (!userCookie) {
      return NextResponse.json(
        { error: 'ត្រូវការការចូលប្រើ' },
        { status: 401 }
      )
    }

    let currentUser
    try {
      currentUser = JSON.parse(decodeURIComponent(userCookie.value))
    } catch {
      return NextResponse.json(
        { error: 'ត្រូវការការចូលប្រើ' },
        { status: 401 }
      )
    }

    // Only admins can reset login attempts
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'គ្មានការអនុញ្ញាត' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Validate the user ID
    const userId = parseInt(id)
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'លេខសម្គាល់អ្នកប្រើប្រាស់មិនត្រឹមត្រូវ' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'រកមិនឃើញអ្នកប្រើប្រាស់' },
        { status: 404 }
      )
    }

    // Reset failed login attempts and reactivate account if it was deactivated
    const updateData: any = {
      failedLoginAttempts: 0,
      lastFailedLogin: null,
      accountLockedUntil: null
    }

    // If account was deactivated due to failed attempts, reactivate it
    if (user.status === 'inactive' && (user as any).failedLoginAttempts >= 5) {
      updateData.status = 'active'
    }

    await prisma.user.update({
      where: { userId },
      data: updateData
    })

    return NextResponse.json({
      message: 'បានកំណត់ឡើងវិញនូវការព្យាយាមចូលខុសរបស់អ្នកប្រើប្រាស់',
      user: {
        id: user.userId,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        status: updateData.status || user.status
      }
    })

  } catch (error) {
    console.error('Error resetting login attempts:', error)
    return NextResponse.json(
      { error: 'មានបញ្ហាក្នុងការកំណត់ឡើងវិញ' },
      { status: 500 }
    )
  }
}
