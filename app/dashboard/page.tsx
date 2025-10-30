'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleGuard } from "@/components/ui/role-guard"
import { 
  Users, 
  BookOpen, 
  Award, 
  Activity, 
  UserCheck,
  Clock,
  RefreshCw,
  Filter,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { useTheme } from "next-themes"

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardContent />
    </RoleGuard>
  )
}

function DashboardContent() {
  // Database interfaces
  interface Student {
    studentId: number
    firstName: string
    lastName: string
    class: string
    status: string
    createdAt?: string
  }

  interface User {
    userId: number
    firstname: string
    lastname: string
    role: string
    status: string
  }

  interface Course {
    courseId: number
    courseName: string
    grade: string
    section: string
  }

  // State for real data
  const [students, setStudents] = useState<Student[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [todayAttendance, setTodayAttendance] = useState<any[]>([])
  
  // Dashboard state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  
  // Activity filter state
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  
  // Use existing theme system
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'

  // Fetch real data from APIs with progressive loading
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch critical data first (students, users, courses)
      const criticalData = await Promise.allSettled([
        fetch('/api/students/enrolled'),
        fetch('/api/users'),
        fetch('/api/courses')
      ])

      // Process critical data immediately
      if (criticalData[0].status === 'fulfilled' && criticalData[0].value.ok) {
        const studentsData = await criticalData[0].value.json()
        setStudents(Array.isArray(studentsData) ? studentsData : [])
      }

      if (criticalData[1].status === 'fulfilled' && criticalData[1].value.ok) {
        const usersData = await criticalData[1].value.json()
        setUsers(Array.isArray(usersData.users) ? usersData.users : [])
      }

      if (criticalData[2].status === 'fulfilled' && criticalData[2].value.ok) {
        const coursesData = await criticalData[2].value.json()
        setCourses(Array.isArray(coursesData) ? coursesData : [])
      }

      // Hide loading after critical data is loaded
      setLoading(false)

      // Fetch additional data in background
      const today = new Date().toISOString().split('T')[0]
      const additionalData = await Promise.allSettled([
        fetch('/api/grades'),
        fetch('/api/activity-logs?limit=10'),
        fetch(`/api/attendance?date=${today}`)
      ])

      // Process additional data
      if (additionalData[0].status === 'fulfilled' && additionalData[0].value.ok) {
        const gradesData = await additionalData[0].value.json()
        setGrades(Array.isArray(gradesData) ? gradesData : [])
      }

      if (additionalData[1].status === 'fulfilled' && additionalData[1].value.ok) {
        const activitiesData = await additionalData[1].value.json()
        setRecentActivities(Array.isArray(activitiesData) ? activitiesData : [])
      }

      if (additionalData[2].status === 'fulfilled' && additionalData[2].value.ok) {
        const attendanceData = await additionalData[2].value.json()
        setTodayAttendance(Array.isArray(attendanceData) ? attendanceData : [])
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      if (err instanceof Error && err.message === 'Request timeout') {
        setError('ការផ្ទុកយូរពេក - សូមព្យាយាមម្តងទៀត')
      } else {
        setError('មិនអាចផ្ទុកទិន្នន័យបាន - សូមព្យាយាមម្តងទៀត')
      }
    } finally {
      setLoading(false)
    }
  }

  // Load UI preferences from localStorage
  useEffect(() => {
    const savedAnimations = localStorage.getItem('dashboard-animations')
    if (savedAnimations) setAnimationsEnabled(savedAnimations === 'true')
  }, [])

  // Load dashboard data on component mount
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Get unique users from activities for filter dropdown
  const activityUsers = Array.from(
    new Set(recentActivities.map((activity: any) => activity.userId).filter(Boolean))
  ).map((userId: any) => {
    const user = users.find((u: User) => u.userId === userId)
    return user ? {
      id: userId,
      name: `${user.lastname} ${user.firstname}`,
      avatar: user.firstname.charAt(0) + user.lastname.charAt(0),
      role: user.role
    } : null
  }).filter(Boolean)

  // Filter users based on search term (search by name or role)
  const filteredUserList = activityUsers.filter((user: any) => {
    const roleLabel = user.role === 'admin' ? 'នាយក' : 'គ្រូ'
    const displayName = `${user.name} (${roleLabel})`
    return displayName.toLowerCase().includes(userSearchTerm.toLowerCase())
  })

  // Get selected user display name
  const selectedUserName = selectedUser === 'all' 
    ? 'ទាំងអស់' 
    : (() => {
        const user = activityUsers.find((u: any) => u.id.toString() === selectedUser)
        if (!user) return ''
        const roleLabel = user.role === 'admin' ? 'នាយក' : 'គ្រូ'
        return `${user.name} (${roleLabel})`
      })()

  // Filter activities by selected user
  const filteredActivities = selectedUser === 'all' 
    ? recentActivities 
    : recentActivities.filter((activity: any) => {
        const activityUserId = activity.userId?.toString()
        return activityUserId === selectedUser
      })

  // Calculate attendance statistics
  const attendanceStats = {
    present: todayAttendance.filter(a => a.status === 'present').length,
    absentWithoutPermission: todayAttendance.filter(a => a.status === 'absent').length,
    late: todayAttendance.filter(a => a.status === 'late').length,
    absentWithPermission: todayAttendance.filter(a => a.status === 'excused').length,
    total: todayAttendance.length
  }

  // Calculate grade statistics (using same logic as grade page)
  const calculateGradeStats = () => {
    if (grades.length === 0) {
      return { averageGrade: 0, excellentGrades: 0 }
    }

    // Group grades by student
    const studentGrades = grades.reduce((acc, grade) => {
      const key = `${grade.studentId}-${grade.courseId}`
      if (!acc[key]) {
        acc[key] = {
          gradeLevel: grade.course?.grade || '1',
          grades: []
        }
      }
      acc[key].grades.push(grade.grade)
      return acc
    }, {} as Record<string, { gradeLevel: string; grades: number[] }>)

    // Calculate averages
    const studentAverages = Object.values(studentGrades).map((student: any) => {
      const sumGrade = student.grades.reduce((sum: number, g: number) => sum + g, 0)
      const countGrade = student.grades.length
      const level = parseInt(student.gradeLevel)
      
      if (level >= 1 && level <= 6) {
        return countGrade > 0 ? sumGrade / countGrade : 0
      } else if (level >= 7 && level <= 8) {
        return sumGrade / 14
      } else if (level === 9) {
        return sumGrade / 8.4
      } else {
        return countGrade > 0 ? sumGrade / countGrade : 0
      }
    })

    const overallAverage = studentAverages.length > 0 
      ? studentAverages.reduce((sum, avg) => sum + avg, 0) / studentAverages.length 
      : 0

    const excellentGrades = studentAverages.filter(avg => avg >= 90).length

    return {
      averageGrade: Math.round(overallAverage * 10) / 10,
      excellentGrades
    }
  }

  const gradeStats = calculateGradeStats()

  // Calculate dashboard stats
  const dashboardStats = {
    totalStudents: students.length,
    totalUsers: users.length,
    totalCourses: courses.length,
    totalGrades: grades.length
  }

  // Get activity icon
  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login': return <UserCheck className="h-4 w-4" />
      case 'grade': return <Award className="h-4 w-4" />
      case 'attendance': return <Clock className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-500/30 dark:from-blue-500/20 dark:to-purple-600/20 rounded-full blur-3xl opacity-60 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-500/30 dark:from-purple-500/20 dark:to-pink-600/20 rounded-full blur-3xl opacity-60 animate-pulse delay-1000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">មានបញ្ហាក្នុងការផ្ទុក</h2>
          <p className="text-base text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Button onClick={fetchDashboardData} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
                ព្យាយាមម្តងទៀត
              </Button>
            </div>
            </div>
    )
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="animate-fade-in">
        {/* Quick Actions Section */}
        <div className="mb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => window.location.href = '/register-student'}
            >
              <div className="flex flex-col items-center gap-2">
                <Users className="h-6 w-6" />
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">បន្ថែមសិស្ស</span>
                  <svg className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Button>
            
            <Button 
              className="h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => window.location.href = '/attendance/daily'}
            >
              <div className="flex flex-col items-center gap-2">
                <UserCheck className="h-6 w-6" />
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">កត់ត្រាវត្តមាន</span>
                  <svg className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Button>
            
            <Button 
              className="h-20 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => window.location.href = '/grade/addgrade'}
            >
              <div className="flex flex-col items-center gap-2">
                <Award className="h-6 w-6" />
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">បញ្ចូលពិន្ទុ</span>
                  <svg className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Button>
            
            <Button 
              className="h-20 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => window.location.href = '/dashboard/academic-management'}
            >
              <div className="flex flex-col items-center gap-2">
                <BookOpen className="h-6 w-6" />
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">គ្រប់គ្រងថ្នាក់រៀន</span>
                  <svg className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Enhanced Quick Stats Summary */}
        <div className=" py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'សិស្សសរុប',
                value: dashboardStats.totalStudents,
                icon: Users,
                gradient: 'from-blue-500 via-blue-600 to-cyan-500',
                bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
                iconBg: 'bg-blue-100 dark:bg-blue-900/40',
                iconColor: 'text-blue-600 dark:text-blue-400',
              },
              {
                title: 'ថ្នាក់សិក្សា',
                value: dashboardStats.totalCourses,
                icon: BookOpen,
                gradient: 'from-green-500 via-emerald-600 to-teal-500',
                bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
                iconBg: 'bg-green-100 dark:bg-green-900/40',
                iconColor: 'text-green-600 dark:text-green-400',
              },
              {
                title: 'ពិន្ទុ',
                value: dashboardStats.totalGrades,
                icon: Award,
                gradient: 'from-yellow-500 via-orange-600 to-red-500',
                bgGradient: 'from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30',
                iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
                iconColor: 'text-yellow-600 dark:text-yellow-400',
              },
              {
                title: 'អ្នកប្រើប្រាស់',
                value: dashboardStats.totalUsers,
                icon: UserCheck,
                gradient: 'from-purple-500 via-pink-600 to-rose-500',
                bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
                iconBg: 'bg-purple-100 dark:bg-purple-900/40',
                iconColor: 'text-purple-600 dark:text-purple-400',
              }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2"
              >
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient}/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} 
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
            </div>
                    <div className="text-right">
                      <p className={`text-4xl font-bold ${stat.iconColor}`}>
                        {stat.value.toLocaleString('km-KH')}
                      </p>
                      <p className={`text-xl ${stat.iconColor} font-medium`}>
                        {stat.title}
                      </p>
            </div>
            </div>
                  <div className={`h-1 bg-gradient-to-r ${stat.gradient} rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
      </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Attendance Summary & Quick Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Attendance Overview */}
          <Card className="backdrop-blur-sm border-0 shadow-xl bg-white/80 dark:bg-slate-800/80">
            <CardHeader className="p-6 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white rounded-t-xl">
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5" />
                  <span className="text-xl text-white">វត្តមានថ្ងៃនេះ</span>
                </div>
                <Badge className="bg-white/20 text-white">
                  {new Date().toLocaleDateString('km-KH')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* 1. យឺត (Late) */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-4 bg-yellow-500/10 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">យឺត</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{attendanceStats.late}</p>
                    {attendanceStats.total > 0 && (
                      <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70">
                        {Math.round((attendanceStats.late / attendanceStats.total) * 100)}%
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. អវត្តមាន(មានច្បាប់) */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-4 bg-blue-500/10 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">អវត្តមាន(មានច្បាប់)</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{attendanceStats.absentWithPermission}</p>
                    {attendanceStats.total > 0 && (
                      <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
                        {Math.round((attendanceStats.absentWithPermission / attendanceStats.total) * 100)}%
                      </p>
                    )}
                  </div>
                </div>
                
                {/* 3. អវត្តមាន(ឥតច្បាប់) */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-4 bg-red-500/10 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">អវត្តមាន(ឥតច្បាប់)</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{attendanceStats.absentWithoutPermission}</p>
                    {attendanceStats.total > 0 && (
                      <p className="text-xs text-red-600/70 dark:text-red-400/70">
                        {Math.round((attendanceStats.absentWithoutPermission / attendanceStats.total) * 100)}%
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button 
                    size="sm"
                    onClick={() => window.location.href = '/attendance'}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 group"
                  >
                    <span>មើលទាំងអស់</span>
                    <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card className="backdrop-blur-sm border-0 shadow-xl bg-white/80 dark:bg-slate-800/80">
            <CardHeader className="p-6 bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 text-white rounded-t-xl">
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span className="text-xl text-white">ស្ថិតិពិន្ទុ</span>
                </div>
                <Badge className="bg-white/20 text-white">
                  សំខាន់
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">មធ្យមភាគពិន្ទុ</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{gradeStats.averageGrade}</p>
                  </div>
                  <Award className="h-8 w-8 text-blue-500" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">សិស្សល្អប្រសើរ (A)</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{gradeStats.excellentGrades} នាក់</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">ពិន្ទុសរុប</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{dashboardStats.totalGrades}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-purple-500" />
                </div>
                
                <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button 
                    size="sm"
                    onClick={() => window.location.href = '/grade'}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 group"
                  >
                    <span>មើលទាំងអស់</span>
                    <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Recent Activity with Filtering */}
        <div className="relative">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-rose-50/30 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-rose-950/20 rounded-3xl -z-10" 
          />
          
          <Card className={`backdrop-blur-sm border-0 shadow-xl transition-all duration-300 ${
            isDarkMode 
              ? 'bg-slate-800/80 hover:bg-slate-700/80' 
              : 'bg-white/80 hover:bg-white/90'
          }`}>
            <CardHeader className="p-6 bg-gradient-to-r from-purple-500 via-pink-600 to-rose-600 text-white rounded-t-xl">
              <CardTitle className="text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                  <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xl text-white block">សកម្មភាពទាំងអស់</span>
                      <span className="text-sm text-white/80 font-normal">
                        {filteredActivities.length} សកម្មភាព
                        {selectedUser !== 'all' && ' (បានច្រោះ)'}
                      </span>
                    </div>
      </div>
                <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setShowFilters(!showFilters)}
                      size="sm"
                      variant="ghost"
                      className={`text-white hover:bg-white/20 ${showFilters ? 'bg-white/20' : ''}`}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  <Button
                    onClick={() => fetchDashboardData()}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
        </div>
                </div>

                {/* Filter Controls */}
                {showFilters && (
                  <div className="mt-4 p-4 bg-white/10 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/90">ច្រោះតាមអ្នកប្រើប្រាស់:</span>
                      {selectedUser !== 'all' && (
                        <Button
                          onClick={() => {
                            setSelectedUser('all')
                            setUserSearchTerm('')
                          }}
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20 h-7 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          សម្អាត
                        </Button>
                      )}
                    </div>

                    {/* Searchable Input with Dropdown */}
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="ជ្រើសរើស ឬ ស្វែងរកឈ្មោះអ្នកប្រើប្រាស់"
                        value={userSearchTerm || selectedUserName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setUserSearchTerm(e.target.value)
                          setShowUserDropdown(true)
                          if (!e.target.value) {
                            setSelectedUser('all')
                          }
                        }}
                        onFocus={() => setShowUserDropdown(true)}
                        className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 hover:bg-white/20 focus:bg-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-all duration-200"
                      >
                        <svg className={`h-4 w-4 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown List */}
                      {showUserDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-64 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2">
                          {/* All Option */}
                          <div
                            onClick={() => {
                              setSelectedUser('all')
                              setUserSearchTerm('')
                              setShowUserDropdown(false)
                            }}
                            className="flex items-center px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors border-b border-slate-200 dark:border-slate-700"
                          >
                            <div className="w-7 h-7 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold mr-2">
                              ALL
                            </div>
                            <span className="text-sm text-slate-900 dark:text-white font-medium">ទាំងអស់</span>
                          </div>

                          {/* User List */}
                          {filteredUserList.length > 0 ? (
                            filteredUserList.map((user: any) => {
                              const roleLabel = user.role === 'admin' ? 'នាយក' : 'គ្រូ'
                              const displayName = `${user.name} (${roleLabel})`
                              return (
                                <div
                                  key={user.id}
                                  onClick={() => {
                                    setSelectedUser(user.id.toString())
                                    setUserSearchTerm(displayName)
                                    setShowUserDropdown(false)
                                  }}
                                  className="flex items-center px-3 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                                >
                                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold mr-2 shadow-sm">
                                    {user.avatar}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm text-slate-900 dark:text-white font-medium">{displayName}</div>
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <div className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                              <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                              <p className="text-sm">រកមិនឃើញអ្នកប្រើប្រាស់</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity: any, index: number) => {
                    // Find user info for avatar
                    const user = users.find((u: User) => u.userId === activity.userId)
                    const userAvatar = user ? (user.firstname.charAt(0) + user.lastname.charAt(0)) : '??'
                    const userName = user ? `${user.lastname} ${user.firstname}` : activity.user

                    return (
                      <div 
                        key={activity.activityId || index} 
                        className="group flex items-start space-x-4 p-4 rounded-xl transition-all duration-300 bg-gradient-to-r from-slate-50/80 to-slate-100/50 dark:from-slate-700/50 dark:to-slate-600/30 hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 hover:shadow-lg border border-slate-200/50 dark:border-slate-600/50 hover:border-purple-300 dark:hover:border-purple-600"
                      >
                        {/* User Avatar */}
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-600 to-rose-600 rounded-full flex items-center justify-center text-white text-base font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                              {userAvatar}
                            </div>
                            {/* Activity icon badge */}
                            <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full shadow-md transition-all duration-200 ${
                              activity.action.includes('ចូលប្រើ') ? 'bg-green-500' :
                              activity.action.includes('ចេញ') ? 'bg-red-500' :
                              activity.action.includes('បន្ថែម') ? 'bg-blue-500' :
                              activity.action.includes('កែប្រែ') ? 'bg-yellow-500' :
                              activity.action.includes('លុប') ? 'bg-orange-500' :
                              activity.action.includes('វត្តមាន') ? 'bg-indigo-500' :
                              activity.action.includes('ពិន្ទុ') ? 'bg-purple-500' :
                              activity.action.includes('បង្កើត') ? 'bg-teal-500' :
                              'bg-gray-500'
                      }`}>
                        {getActivityIcon(activity.action)}
                    </div>
                          </div>
                        </div>

                        {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-1">
                              {/* User Name */}
                              <div className="flex items-center space-x-2">
                                <p className="text-base font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                  {userName}
                                </p>
                                {user && (
                                  <Badge variant="outline" className="text-xs border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-300">
                                    {user.role === 'admin' ? 'នាយក' : 'គ្រូ'}
                                  </Badge>
                                )}
                              </div>

                              {/* Action */}
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {activity.action}
                      </p>

                              {/* Details */}
                            {activity.details && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg">
                                {activity.details}
                              </p>
                            )}

                              {/* Time */}
                              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="h-3 w-3" />
                                <span>{activity.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="h-10 w-10 text-purple-400 dark:text-purple-600" />
                    </div>
                    <p className="text-lg font-semibold mb-1">មិនមានសកម្មភាព</p>
                    <p className="text-sm">
                      {selectedUser !== 'all' 
                        ? 'អ្នកប្រើប្រាស់នេះមិនមានសកម្មភាពទេ' 
                        : 'សកម្មភាពថ្មីៗនឹងបង្ហាញនៅទីនេះ'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(203, 213, 225, 0.2);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #a855f7, #ec4899);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #9333ea, #db2777);
          }
        `}</style>
      </div>
    </div>
  )
}
