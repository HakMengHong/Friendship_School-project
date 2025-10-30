'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isAdmin, isTeacher } from '@/lib/auth-service'
import { User } from '@/lib/auth-service'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: ('admin' | 'teacher' | 'both')[]
  fallback?: React.ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  // Handle navigation after user state is set
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // Handle unauthorized access
  useEffect(() => {
    if (!isLoading && user && !hasAccess()) {
      router.push('/unauthorized')
    }
  }, [user, isLoading, router])

  const hasAccess = () => {
    if (!user) return false
    
    return allowedRoles.some(role => {
      if (role === 'admin') return isAdmin(user)
      if (role === 'teacher') return isTeacher(user)
      if (role === 'both') return isAdmin(user) || isTeacher(user)
      return false
    })
  }

  // Don't show loading for auth check - it's very fast and causes double loading
  // The page-level loading will handle the visual feedback
  if (isLoading) {
    return null
  }

  // Redirect handled by useEffect, no need to show loading
  if (!user) {
    return null
  }

  // Redirect handled by useEffect, no need to show loading
  if (!hasAccess()) {
    if (fallback) {
      return <>{fallback}</>
    }
    return null
  }

  return <>{children}</>
}

interface RoleBasedContentProps {
  adminContent?: ReactNode
  teacherContent?: ReactNode
  fallback?: ReactNode
}

export function RoleBasedContent({ adminContent, teacherContent, fallback }: RoleBasedContentProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return null
  }

  if (!currentUser) {
    return fallback || null
  }

  if (currentUser.role === 'admin' && adminContent) {
    return <>{adminContent}</>
  }

  if (currentUser.role === 'teacher' && teacherContent) {
    return <>{teacherContent}</>
  }

  return fallback || null
} 