import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get user cookie
    const userCookie = request.cookies.get('user')
    
    if (!userCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      )
    }

    // Parse user data
    let userData
    try {
      userData = JSON.parse(decodeURIComponent(userCookie.value))
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid session data' }, 
        { status: 401 }
      )
    }

    // Check if session is still valid
    const now = Date.now()
    const sessionAge = now - userData.sessionStart
    const thirtyMinutes = 30 * 60 * 1000 // 30 minutes in milliseconds

    if (sessionAge > thirtyMinutes) {
      // Session expired, clear cookie
      const response = NextResponse.json(
        { error: 'Session expired' }, 
        { status: 401 }
      )
      
      response.cookies.set('user', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
        path: '/'
      })
      
      return response
    }

    // Update last activity timestamp and extend session
    const updatedUserData = {
      ...userData,
      lastActivity: now,
      sessionStart: now // Reset session start time to extend session
    }

    // Create response with fresh 30-minute timer
    const response = NextResponse.json({ 
      success: true, 
      timeLeft: thirtyMinutes, // Fresh 30 minutes since we reset sessionStart
      lastActivity: now
    })

    // Update cookie with new activity timestamp
    response.cookies.set('user', encodeURIComponent(JSON.stringify(updatedUserData)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60, // 30 minutes in seconds
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Heartbeat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
