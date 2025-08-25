import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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
      where: { username },
      include: {
        courses: true
      }
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
      assignedClass: dbUser.courses[0]?.courseId || undefined
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
      include: {
        courses: true
      },
      orderBy: [
        { role: 'asc' },
        { firstname: 'asc' }
      ]
    })

    return dbUsers.map(dbUser => ({
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
      assignedClass: dbUser.courses[0]?.courseId || undefined
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  
  const userData = localStorage.getItem("user")
  if (!userData) return null
  
  try {
    return JSON.parse(userData)
  } catch {
    return null
  }
}

// Set current user in localStorage
export const setCurrentUser = (user: User): void => {
  if (typeof window === "undefined") return
  
  localStorage.setItem("user", JSON.stringify(user))
  localStorage.setItem("username", user.username)
}

// Logout user
export const logout = (): void => {
  if (typeof window === "undefined") return
  
  localStorage.removeItem("user")
  localStorage.removeItem("username")
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