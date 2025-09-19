import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id)
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Reset failed login attempts and unlock account
    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        accountLockedUntil: null,
        status: 'active'
      },
      select: {
        userId: true,
        username: true,
        firstname: true,
        lastname: true,
        status: true,
        failedLoginAttempts: true,
        lastFailedLogin: true,
        accountLockedUntil: true
      }
    })

    return NextResponse.json({
      message: 'បានកំណត់ឡើងវិញនូវការព្យាយាមចូលខុសរបស់អ្នកប្រើប្រាស់',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error resetting login attempts:', error)
    return NextResponse.json(
      { error: 'មានបញ្ហាក្នុងការកំណត់ឡើងវិញនូវការព្យាយាមចូលខុស' },
      { status: 500 }
    )
  }
}
