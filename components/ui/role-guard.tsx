'use client'

import { useEffect, useState } from 'react'
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

  const hasAccess = () => {
    if (!user) return false
    
    return allowedRoles.some(role => {
      if (role === 'admin') return isAdmin(user)
      if (role === 'teacher') return isTeacher(user)
      if (role === 'both') return isAdmin(user) || isTeacher(user)
      return false
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>កំពុងផ្ទុក...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  if (!hasAccess()) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2">គ្មានការអនុញ្ញាត</h1>
          <p className="text-muted-foreground mb-4">
            អ្នកមិនមានការអនុញ្ញាតចូលទៅកាន់ទំព័រនេះទេ
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង
          </button>
        </div>
      </div>
    )
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