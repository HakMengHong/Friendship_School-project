import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication - only admins can skip lockouts
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

    // Only admins can skip lockouts
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

    // Check if user is currently locked out
    const isCurrentlyLocked = user.accountLockedUntil && user.accountLockedUntil > new Date()
    
    if (!isCurrentlyLocked) {
      return NextResponse.json(
        { error: 'គណនីនេះមិនត្រូវបានចាក់សោទេ' },
        { status: 400 }
      )
    }

    // Skip the lockout by clearing the lockout time
    await prisma.user.update({
      where: { userId },
      data: {
        accountLockedUntil: null
      }
    })

    return NextResponse.json({
      message: 'បានរំសាយការចាក់សោគណនីដោយជោគជ័យ',
      user: {
        id: user.userId,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        status: user.status,
        failedLoginAttempts: (user as any).failedLoginAttempts || 0
      }
    })

  } catch (error) {
    console.error('Error skipping lockout:', error)
    return NextResponse.json(
      { error: 'មានបញ្ហាក្នុងការរំសាយការចាក់សោ' },
      { status: 500 }
    )
  }
}
