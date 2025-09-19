import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log(`🔍 Middleware called for: ${pathname}`)
  
  // Allow static files that don't need protection
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public') ||
    pathname.includes('.') // Static files
  ) {
    console.log(`✅ Static file allowed: ${pathname}`)
    return NextResponse.next()
  }
  
  // Define public routes (no authentication required)
  const publicRoutes = [
    '/',
    '/splash',
    '/login',
    '/unauthorized',
    '/api/auth/login',
    '/api/auth/users',
    '/api/users',
    '/api/students',
    '/api/students/enrolled',
    '/api/courses',
    '/api/school-years',
    '/api/semesters',
    '/api/subjects',
    '/api/grades',
    '/api/notifications',
    '/api/attendance',
    '/api/announcements',
    '/api/activity-logs',
    '/api/learning-quality',
    '/api/pdf-generate/generate-teacher-id-card',
    '/api/pdf-generate/generate-student-registration',
    '/api/pdf-generate/generate-student-id-card',
    '/api/pdf-generate/generate-bulk-student-id-cards',
    '/api/pdf-generate/generate-attendance-report',
    '/api/pdf-generate/generate-grade-report',
    '/api/pdf-generate/generate-gradebook-report',
    '/api/pdf-generate/generate-student-list-report',
    '/api/pdf-generate/generate-pdf',
  ]
  
  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    console.log(`✅ Public route allowed: ${pathname}`)
    return NextResponse.next()
  }
  
  // Check for subjects API routes (including dynamic routes)
  if (pathname.startsWith('/api/subjects')) {
    console.log(`✅ Subjects API route allowed: ${pathname}`)
    return NextResponse.next()
  }
  
  // Check for PDF generation routes
  if (pathname.startsWith('/api/pdf-generate/')) {
    console.log(`✅ PDF generation route allowed: ${pathname}`)
    return NextResponse.next()
  }
  
  // Get user role from cookies and check session age
  const userCookie = request.cookies.get('user')
  let userRole = null
  
  if (userCookie) {
    try {
      const userData = JSON.parse(decodeURIComponent(userCookie.value))
      userRole = userData.role || null
      
      // Check if session has expired (30 minutes)
      if (userData.sessionStart) {
        const now = Date.now()
        const sessionAge = now - userData.sessionStart
        const thirtyMinutes = 30 * 60 * 1000 // 30 minutes in milliseconds
        
        if (sessionAge > thirtyMinutes) {
          console.log(`🕐 Session expired for user ${userData.username}, redirecting to login`)
          const loginUrl = new URL('/login', request.url)
          loginUrl.searchParams.set('timeout', 'true')
          loginUrl.searchParams.set('message', 'ការប្រើប្រាស់បានផុតកំណត់។ សូមចូលម្តងទៀត។')
          return NextResponse.redirect(loginUrl)
        }
      }
    } catch (error) {
      console.log('❌ Invalid user cookie, redirecting to login')
      userRole = null
    }
  }
  
  console.log(`👤 User role for ${pathname}: ${userRole || 'None'}`)
  
  // If no user role, redirect to login (PROTECT ALL NON-PUBLIC ROUTES)
  if (!userRole) {
    console.log(`🔄 Redirecting ${pathname} to login`)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // For now, allow all authenticated users to access all routes
  // Role-based access control can be added later
  console.log(`✅ Access allowed for ${userRole}: ${pathname}`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
