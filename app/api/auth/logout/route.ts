import { NextRequest, NextResponse } from 'next/server'
import { logActivity, ActivityMessages } from '@/lib/activity-logger'

export async function POST(request: NextRequest) {
  try {
    // Get user data from request body
    const body = await request.json()
    const { userId, username } = body

    // Log logout activity if userId is provided
    if (userId) {
      await logActivity(
        userId,
        ActivityMessages.LOGOUT,
        username ? `${username} ចេញពីប្រព័ន្ធ` : 'ចេញពីប្រព័ន្ធ'
      )
    }

    // Clear the user cookie
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' })
    
    // Clear the cookie by setting it to expire
    response.cookies.set('user', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    // Even if logging fails, still return success for logout
    return NextResponse.json({ success: true, message: 'Logged out' })
  }
}

