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
  ]
  
  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    console.log(`✅ Public route allowed: ${pathname}`)
    return NextResponse.next()
  }
  
  // Get user role from cookies
  const userCookie = request.cookies.get('user')
  let userRole = null
  
  if (userCookie) {
    try {
      const userData = JSON.parse(decodeURIComponent(userCookie.value))
      userRole = userData.role || null
    } catch {
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
