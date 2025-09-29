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
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  
  // Dashboard state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  
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
      const additionalData = await Promise.allSettled([
        fetch('/api/grades'),
        fetch('/api/activity-logs?limit=10')
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-base text-gray-600 dark:text-gray-300">កំពុងផ្ទុក...</p>
        </div>
        </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
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
    <div>
      <div className={`${animationsEnabled ? 'animate-fade-in' : ''}`}>

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

        {/* Recent Activity */}
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
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span className="text-xl text-white">សកម្មភាពថ្មីៗ</span>
      </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-white/20 text-white">
                    {recentActivities.length}
                  </Badge>
                  <Button
                    onClick={() => fetchDashboardData()}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
        </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div 
                      key={index} 
                      className="group flex items-start space-x-4 p-4 rounded-lg transition-all duration-200 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-600 hover:shadow-md"
                    >
                      <div className={`flex-shrink-0 p-2 rounded-full transition-all duration-200 ${
                        animationsEnabled ? 'group-hover:scale-110' : ''
                      } ${
                        activity.type === 'add' ? 'bg-green-100 dark:bg-green-900/30' :
                        activity.type === 'edit' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        activity.type === 'attendance' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        activity.type === 'announcement' ? 'bg-purple-100 dark:bg-purple-900/30' :
                        'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {activity.user}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {activity.action}
                      </p>
                            {activity.details && (
                              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                                {activity.details}
                              </p>
                            )}
                            <div className="flex items-center space-x-3 mt-2">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {activity.time}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={`text-sm ${
                                  activity.type === 'add' ? 'border-green-300 text-green-700 dark:border-green-700 dark:text-green-300' :
                                  activity.type === 'edit' ? 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300' :
                                  activity.type === 'attendance' ? 'border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300' :
                                  activity.type === 'announcement' ? 'border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300' :
                                  'border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {activity.type === 'add' ? 'បន្ថែម' :
                                 activity.type === 'edit' ? 'កែប្រែ' :
                                 activity.type === 'attendance' ? 'វត្តមាន' :
                                 activity.type === 'announcement' ? 'ប្រកាស' :
                                 'ផ្សេងៗ'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-base">មិនមានសកម្មភាព</p>
                    <p className="text-sm mt-1">សកម្មភាពថ្មីៗនឹងបង្ហាញនៅទីនេះ</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
