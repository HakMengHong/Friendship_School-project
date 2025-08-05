import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login
    await prisma.user.update({
      where: { userId: user.userId },
      data: { lastLogin: new Date() }
    })

    // Return user data (without password)
    const userData = {
      id: user.userId,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      position: user.position,
      avatar: user.avatar || `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`,
      phonenumber1: user.phonenumber1,
      phonenumber2: user.phonenumber2,
      lastLogin: user.lastLogin,
      photo: user.photo,
      status: user.status,
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 