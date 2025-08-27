import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Security configuration constants
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_THRESHOLD = 3
const LOCKOUT_DURATION = 10 * 60 * 1000 // 10 minutes in milliseconds

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'សូមបំពេញឈ្មោះនិងលេខកូដសម្ងាត់' },
        { status: 400 }
      )
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      // Use same error message to prevent user enumeration
      return NextResponse.json(
        { error: 'ឈ្មោះឬលេខកូដសម្ងាត់មិនត្រឹមត្រូវ' },
        { status: 401 }
      )
    }

    // Check if account is locked due to too many failed attempts
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      const lockoutTime = user.accountLockedUntil.toLocaleString('km-KH')
      return NextResponse.json(
        { error: `គណនីត្រូវបានចាក់សោដោយសារព្យាយាមចូលខុសច្រើនដង។ សូមព្យាយាមម្តងទៀតនៅពេល: ${lockoutTime}` },
        { status: 423 } // 423 Locked
      )
    }

    // Check if user is inactive (manually deactivated)
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'គណនីនេះមិនសកម្មទេ' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      // Increment failed login attempts
      const newFailedAttempts = (user.failedLoginAttempts || 0) + 1
      
      // Check if this is the maximum failed attempt
      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        // Deactivate the account
        await prisma.user.update({
          where: { userId: user.userId },
          data: {
            status: 'inactive',
            failedLoginAttempts: newFailedAttempts,
            lastFailedLogin: new Date(),
            accountLockedUntil: null // Clear lockout since account is now inactive
          }
        })

        return NextResponse.json(
          { error: 'គណនីត្រូវបានបិទដោយសារព្យាយាមចូលខុសច្រើនដង។ សូមទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធ។' },
          { status: 423 } // 423 Locked
        )
      } else {
        // Set temporary lockout for 15 minutes after threshold failed attempts
        const lockoutUntil = newFailedAttempts >= LOCKOUT_THRESHOLD ? 
          new Date(Date.now() + LOCKOUT_DURATION) : null
        
        await prisma.user.update({
          where: { userId: user.userId },
          data: {
            failedLoginAttempts: newFailedAttempts,
            lastFailedLogin: new Date(),
            accountLockedUntil: lockoutUntil
          }
        })

        const remainingAttempts = MAX_FAILED_ATTEMPTS - newFailedAttempts
        return NextResponse.json(
          { error: `ឈ្មោះឬលេខកូដសម្ងាត់មិនត្រឹមត្រូវ។ នៅសល់ ${remainingAttempts} ដង។` },
          { status: 401 }
        )
      }
    }

    // Successful login - reset failed attempts
    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        lastLogin: new Date(),
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        accountLockedUntil: null
      }
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
      { error: 'មានបញ្ហាក្នុងប្រព័ន្ធ សូមព្យាយាមម្តងទៀត' },
      { status: 500 }
    )
  }
} 