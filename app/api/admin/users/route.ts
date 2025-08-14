import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Transform the data to match the frontend interface
    const transformedUsers = users.map(user => ({
      userId: user.userId,
      username: user.username,
      password: '', // Don't send password
      firstname: user.firstname,
      lastname: user.lastname,
      phonenumber1: user.phonenumber1,
      phonenumber2: user.phonenumber2,
      role: user.role,
      avatar: user.avatar,
      position: user.position,
      photo: user.photo,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      status: user.status
    }))

    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, firstname, lastname, phonenumber1, phonenumber2, role, position, photo } = body

    // Validate required fields
    if (!username || !password || !firstname || !lastname) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        firstname,
        lastname,
        phonenumber1: phonenumber1 || null,
        phonenumber2: phonenumber2 || null,
        role: role || 'teacher',
        avatar: `${firstname.charAt(0)}${lastname.charAt(0)}`,
        position: position || null,
        photo: photo || null,
        status: 'active'
      }
    })

    const transformedUser = {
      userid: newUser.userId,
      username: newUser.username,
      password: '',
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      phonenumber1: newUser.phonenumber1,
      phonenumber2: newUser.phonenumber2,
      role: newUser.role,
      avatar: newUser.avatar,
      position: newUser.position,
      photo: newUser.photo,
      lastLogin: newUser.lastLogin,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      status: newUser.status
    }

    return NextResponse.json({ user: transformedUser }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 