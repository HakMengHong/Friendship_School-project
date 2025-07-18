import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// PUT - Update user
export async function PUT(request: NextRequest, context: any) {
  const { params } = await context;
  try {
    const userId = parseInt(params.id)
    const body = await request.json()
    const { username, password, firstname, lastname, phonenumber1, phonenumber2, role, position, photo, status } = body

    // Validate required fields
    if (!username || !firstname || !lastname) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { userid: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if username already exists (excluding current user)
    if (username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username }
      })

      if (usernameExists) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      username,
      firstname,
      lastname,
      phonenumber1: phonenumber1 || null,
      phonenumber2: phonenumber2 || null,
      role: role || 'teacher',
      position: position || null,
      photo: photo || null,
    };
    if (typeof status === 'string') {
      updateData.status = status;
    }

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { userid: userId },
      data: updateData,
      select: {
        userid: true,
        username: true,
        firstname: true,
        lastname: true,
        phonenumber1: true,
        phonenumber2: true,
        role: true,
        avatar: true,
        position: true,
        photo: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    })

    const transformedUser = {
      userid: (updatedUser as any).userid,
      username: updatedUser.username,
      password: '',
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
      phonenumber1: updatedUser.phonenumber1,
      phonenumber2: updatedUser.phonenumber2,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      position: updatedUser.position,
      photo: updatedUser.photo,
      lastLogin: updatedUser.lastLogin,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      status: updatedUser.status // Return the actual status string
    }

    return NextResponse.json({ user: transformedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { userid: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user
    await prisma.user.delete({
      where: { userid: userId }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 