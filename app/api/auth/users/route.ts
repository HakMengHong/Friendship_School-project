import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'admin' },
          { role: 'teacher' }
        ],
        status: 'active'
      },
      orderBy: [
        { role: 'asc' },
        { firstname: 'asc' }
      ]
    })

    const userData = users.map(user => ({
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
      status: user.status
    }))

    return NextResponse.json({ users: userData })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 