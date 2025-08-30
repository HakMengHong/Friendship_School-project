import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export interface AuthenticatedUser {
  id: number
  username: string
  firstname: string
  lastname: string
  role: 'admin' | 'teacher'
  position?: string
  avatar?: string
  phonenumber1?: string
  phonenumber2?: string
  lastLogin?: Date
  photo?: string
  status: string
}

// Verify user authentication from request
export async function verifyAuth(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Check for user data in cookies
    const userCookie = request.cookies.get('user')
    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie.value))
        return userData
      } catch {
        return null
      }
    }
    
    // Check for authorization header (for API routes)
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const userData = JSON.parse(Buffer.from(token, 'base64').toString())
        return userData
      } catch {
        return null
      }
    }
    
    return null
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

// Check if user has required role
export function hasRole(user: AuthenticatedUser | null, requiredRole: 'admin' | 'teacher' | 'both'): boolean {
  if (!user) return false
  
  if (requiredRole === 'both') return user.role === 'admin' || user.role === 'teacher'
  if (requiredRole === 'admin') return user.role === 'admin'
  if (requiredRole === 'teacher') return user.role === 'teacher'
  
  return false
}

export function withAuth(handler: (request: NextRequest, user: any) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const userCookie = request.cookies.get('user')
      if (!userCookie) {
        return NextResponse.json(
          { error: 'ត្រូវការការចូលប្រើ' },
          { status: 401 }
        )
      }

      let user
      try {
        user = JSON.parse(decodeURIComponent(userCookie.value))
      } catch {
        return NextResponse.json(
          { error: 'ត្រូវការការចូលប្រើ' },
          { status: 401 }
        )
      }

      return await handler(request, user)
    } catch (error) {
      console.error('Auth error:', error)
      return NextResponse.json(
        { error: 'មានបញ្ហាក្នុងការផ្ទៀងផ្ទាត់' },
        { status: 500 }
      )
    }
  }
}

export function withRoleAuth(allowedRoles: string[], handler: (request: NextRequest, user: any) => Promise<NextResponse>) {
  return withAuth(async (request: NextRequest, user: any) => {
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'គ្មានការអនុញ្ញាត' },
        { status: 403 }
      )
    }

    return await handler(request, user)
  })
}

export function withAdminAuth(handler: (request: NextRequest, user: any) => Promise<NextResponse>) {
  return withRoleAuth(['admin'], handler)
}

export function withTeacherAuth(handler: (request: NextRequest, user: any) => Promise<NextResponse>) {
  return withRoleAuth(['admin', 'teacher'], handler)
}

// Helper function to create protected API route
export function createProtectedRoute(
  handler: Function, 
  requiredRole: 'admin' | 'teacher' | 'both' = 'both'
) {
  return withAuth(handler, requiredRole)
}

// Rate limiting utility
export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.requests.get(identifier)

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    if (record.count >= this.maxRequests) {
      return false
    }

    record.count++
    return true
  }

  getRemaining(identifier: string): number {
    const record = this.requests.get(identifier)
    if (!record) return this.maxRequests
    return Math.max(0, this.maxRequests - record.count)
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter(100, 15 * 60 * 1000) // 100 requests per 15 minutes

// Rate limiting middleware
export function withRateLimit(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const identifier = request.ip || 'unknown'
    
    if (!rateLimiter.isAllowed(identifier)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    return handler(request, ...args)
  }
}
