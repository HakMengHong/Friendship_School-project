"use client"

import { ReactNode } from "react"
import { getCurrentUser, canAccess, User } from "@/lib/auth-service"
import { useEffect, useState } from "react"

interface RoleGuardProps {
  children: ReactNode
  requiredRole: 'admin' | 'teacher' | 'both'
  fallback?: ReactNode
}

export function RoleGuard({ children, requiredRole, fallback }: RoleGuardProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return null // or a loading spinner
  }

  if (!currentUser || !canAccess(currentUser, requiredRole)) {
    return fallback || null
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