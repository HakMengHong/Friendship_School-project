import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export interface User {
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
  assignedClass?: string
  photo?: string
  status?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Helper function to construct username from firstname and lastname
export const constructUsername = (firstname: string, lastname: string): string => {
  return `${firstname}${lastname}`
}

// Authenticate user against database
export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    // Find user by username
    const dbUser = await prisma.user.findUnique({
      where: { username }
    })

    if (!dbUser) {
      return null
    }

    // Check if user is active
    if (dbUser.status !== 'active') {
      return null
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, dbUser.password)
    if (!isPasswordValid) {
      return null
    }

    // Update last login
    await prisma.user.update({
      where: { userId: dbUser.userId },
      data: { lastLogin: new Date() }
    })

    // Convert to User interface
    const user: User = {
      id: dbUser.userId,
      username: dbUser.username,
      firstname: dbUser.firstname,
      lastname: dbUser.lastname,
      role: dbUser.role as 'admin' | 'teacher',
      position: dbUser.position || undefined,
      avatar: dbUser.avatar || `${dbUser.firstname.charAt(0)}${dbUser.lastname.charAt(0)}`,
      phonenumber1: dbUser.phonenumber1 || undefined,
      phonenumber2: dbUser.phonenumber2 || undefined,
      lastLogin: dbUser.lastLogin || undefined,
      photo: dbUser.photo || undefined,
      status: dbUser.status,
      assignedClass: undefined
    }

    return user
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// Get all users for dropdown (teachers and admins only)
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const dbUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'admin' },
          { role: 'teacher' }
        ],
        status: 'active'
      },
      orderBy: [
        { role: 'asc' },
        { firstname: 'asc' }
      ]
    })

    return dbUsers.map((dbUser: any) => ({
      id: dbUser.userId,
      username: dbUser.username,
      firstname: dbUser.firstname,
      lastname: dbUser.lastname,
      role: dbUser.role as 'admin' | 'teacher',
      position: dbUser.position || undefined,
      avatar: dbUser.avatar || `${dbUser.firstname.charAt(0)}${dbUser.lastname.charAt(0)}`,
      phonenumber1: dbUser.phonenumber1 || undefined,
      phonenumber2: dbUser.phonenumber2 || undefined,
      lastLogin: dbUser.lastLogin || undefined,
      photo: dbUser.photo || undefined,
      status: dbUser.status,
      assignedClass: undefined
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

// Get current user from localStorage or cookie
export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  
  try {
    // First try localStorage
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      return JSON.parse(userData)
    }
    
    // Fallback to cookie if localStorage is empty
    const cookies = document.cookie.split(';')
    const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='))
    
    if (userCookie) {
      const cookieValue = userCookie.split('=')[1]
      const decodedValue = decodeURIComponent(cookieValue)
      return JSON.parse(decodedValue)
    }
    
    return null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Set user data in cookies for middleware access
export const setUserCookie = (user: User): void => {
  if (typeof window !== 'undefined') {
    const userData = {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      position: user.position,
      avatar: user.avatar,
      phonenumber1: user.phonenumber1,
      phonenumber2: user.phonenumber2,
      lastLogin: user.lastLogin,
      photo: user.photo,
      status: user.status,
    }
    
    // Set cookie with user data (encoded)
    const cookieValue = encodeURIComponent(JSON.stringify(userData))
    document.cookie = `user=${cookieValue}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict` // 7 days
    
    // Also store in localStorage for client-side access
    localStorage.setItem('currentUser', JSON.stringify(user))
  }
}

// Clear user cookie and localStorage
export const clearUserCookie = (): void => {
  if (typeof window !== 'undefined') {
    // Clear cookie
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    
    // Clear localStorage
    localStorage.removeItem('currentUser')
    sessionStorage.removeItem('currentUser')
  }
}

// Enhanced setCurrentUser function
export const setCurrentUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    // Store in localStorage for client-side access
    localStorage.setItem('currentUser', JSON.stringify(user))
    
    // Also set cookie for middleware access
    setUserCookie(user)
  }
}

// Enhanced logout function
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    clearUserCookie()
    
    // Clear any other stored data
    localStorage.clear()
    sessionStorage.clear()
  }
}

// Role checking functions
export const hasRole = (user: User | null, role: 'admin' | 'teacher'): boolean => {
  return user?.role === role
}

export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'admin')
}

export const isTeacher = (user: User | null): boolean => {
  return hasRole(user, 'teacher')
}

export const canAccess = (user: User | null, requiredRole: 'admin' | 'teacher' | 'both'): boolean => {
  if (!user) return false
  
  if (requiredRole === 'both') return isAdmin(user) || isTeacher(user)
  if (requiredRole === 'admin') return isAdmin(user)
  if (requiredRole === 'teacher') return isTeacher(user)
  
  return false
}

export const getUserClass = (user: User | null): string | null => {
  return user?.assignedClass || null
}

export const canAccessClass = (user: User | null, _classId: string): boolean => {
  if (!user) return false
  // All roles can access all classes for viewing student information
  if (isAdmin(user) || isTeacher(user)) {
    return true
  }
  return false
}

// For attendance and grades, teachers can only access their assigned class
export const canManageClass = (user: User | null, classId: string): boolean => {
  if (!user) return false
  // Admins can manage all classes
  if (isAdmin(user)) return true
  // Teachers can only manage their assigned class
  if (isTeacher(user)) {
    return user.assignedClass === classId
  }
  return false
} 