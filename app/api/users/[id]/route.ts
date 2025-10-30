import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { logActivity, ActivityMessages } from '@/lib/activity-logger'

const prisma = new PrismaClient()

// PUT - Update user
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id)
    
    // Check if request is FormData (for file uploads) or JSON
    const contentType = request.headers.get('content-type') || ''
    let body: any = {}
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData for file uploads
      const formData = await request.formData()
      body = {
        phonenumber1: formData.get('phonenumber1') as string,
        phonenumber2: formData.get('phonenumber2') as string,
        password: formData.get('password') as string,
        photo: formData.get('photo') as File
      }
    } else {
      // Handle JSON data
      body = await request.json()
    }
    
    const { username, password, firstname, lastname, phonenumber1, phonenumber2, role, position, photo, status } = body

    // For profile updates, we don't require username, firstname, lastname if not provided
    // Only validate if they are being updated

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if username already exists (excluding current user) - only if username is being updated
    if (username && username !== existingUser.username) {
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

    // Handle photo upload if it's a File object
    let photoUrl = null
    if (photo instanceof File) {
      // Save file to uploads directory
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadsDir, { recursive: true })
      
      const bytes = await photo.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
      const filename = `${uniqueSuffix}-${photo.name}`
      const filepath = path.join(uploadsDir, filename)
      
      await writeFile(filepath, buffer)
      photoUrl = `/uploads/${filename}`
    }

    // Prepare update data - only update fields that are provided
    const updateData: any = {}
    
    if (username) updateData.username = username
    if (firstname) updateData.firstname = firstname
    if (lastname) updateData.lastname = lastname
    if (phonenumber1 !== undefined) updateData.phonenumber1 = phonenumber1 || null
    if (phonenumber2 !== undefined) updateData.phonenumber2 = phonenumber2 || null
    if (role) updateData.role = role
    if (position !== undefined) updateData.position = position || null
    if (status) updateData.status = status
    
    // Update avatar if firstname or lastname changed
    if (firstname || lastname) {
      const newFirstname = firstname || existingUser.firstname
      const newLastname = lastname || existingUser.lastname
      updateData.avatar = `${newFirstname.charAt(0)}${newLastname.charAt(0)}`
    }
    
    // Update photo if provided
    if (photoUrl) {
      updateData.photo = photoUrl
    } else if (photo && typeof photo === 'string') {
      updateData.photo = photo
    }

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { userId },
      data: updateData,
      select: {
        userId: true,
        username: true,
        firstname: true,
        lastname: true,
        phonenumber1: true,
        phonenumber2: true,
        role: true,
        position: true,
        photo: true,
        avatar: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    })

    const transformedUser = {
      id: updatedUser.userId,
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
      status: updatedUser.status
    }

    // Log activity
    if (password) {
      await logActivity(userId, ActivityMessages.CHANGE_PASSWORD, `ផ្លាស់ប្តូរលេខសម្ងាត់`)
    }
    if (photoUrl) {
      await logActivity(userId, ActivityMessages.UPLOAD_PROFILE_PHOTO, `ផ្ទុកឡើងរូបភាពប្រវត្តិរូប`)
    }
    // General edit log
    await logActivity(userId, ActivityMessages.EDIT_USER, `កែប្រែព័ត៌មានអ្នកប្រើប្រាស់ ${updatedUser.lastname} ${updatedUser.firstname}`)

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user
    await prisma.user.delete({
      where: { userId }
    })

    // Log activity (use a system admin or the user performing delete)
    // Note: This logs the deletion, userId here should be who performed the delete
    await logActivity(userId, ActivityMessages.DELETE_USER, `លុបអ្នកប្រើប្រាស់ ${existingUser.lastname} ${existingUser.firstname}`)

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 