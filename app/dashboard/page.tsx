'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleGuard } from "@/components/ui/role-guard"
import { 
  Users, 
  BookOpen, 
  Award, 
  Star, 
  TrendingUp, 
  Activity, 
  Trash2 as TrashIcon,
  Plus,
  BarChart3,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  GraduationCap,
  Sun,
  Moon,
  RefreshCw,
  Download,
  Search,
  Settings,
  AlertTriangle,
  Shield,
  Database,
  FileText,
  Calendar,
  Target,
  Zap,
  Eye,
  EyeOff,
  Palette,
  Sparkles,
  Layers,
  Globe,
  Wifi,
  WifiOff
} from "lucide-react"
import { KhmerCalendar } from "@/components/calendar/khmer_calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
import { Loader2, AlertCircle } from "lucide-react"
import { useTheme } from "next-themes"
import { ThemeToggle } from "@/components/ui/theme-toggle"

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

  interface Attendance {
    attendanceId: number
    status: string
    attendanceDate: string
  }

  // State for real data
  const [students, setStudents] = useState<Student[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [learningQualityData, setLearningQualityData] = useState<any[]>([])
  
  // Enhanced dashboard state
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI state
  const [showSidebar, setShowSidebar] = useState(false)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [compactMode, setCompactMode] = useState(false)
  
  // Use existing theme system
  const { theme, resolvedTheme } = useTheme()
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
        fetch('/api/attendance'),
        fetch('/api/grades'),
        fetch('/api/activity-logs?limit=10'),
        fetch('/api/learning-quality')
      ])

      // Process additional data
      if (additionalData[0].status === 'fulfilled' && additionalData[0].value.ok) {
        const attendancesData = await additionalData[0].value.json()
        setAttendances(Array.isArray(attendancesData) ? attendancesData : [])
      }

      if (additionalData[1].status === 'fulfilled' && additionalData[1].value.ok) {
        const gradesData = await additionalData[1].value.json()
        setGrades(Array.isArray(gradesData) ? gradesData : [])
      }

      if (additionalData[2].status === 'fulfilled' && additionalData[2].value.ok) {
        const activitiesData = await additionalData[2].value.json()
        setRecentActivities(Array.isArray(activitiesData) ? activitiesData : [])
      }

      if (additionalData[3].status === 'fulfilled' && additionalData[3].value.ok) {
        const learningQualityData = await additionalData[3].value.json()
        setLearningQualityData(learningQualityData.monthlyData || [])
      }

      setLastRefresh(new Date())
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
    const savedCompactMode = localStorage.getItem('dashboard-compact-mode')
    if (savedAnimations) setAnimationsEnabled(savedAnimations === 'true')
    if (savedCompactMode) setCompactMode(savedCompactMode === 'true')
  }, [])

  const toggleAnimations = () => {
    const newAnimations = !animationsEnabled
    setAnimationsEnabled(newAnimations)
    localStorage.setItem('dashboard-animations', newAnimations.toString())
  }

  const toggleCompactMode = () => {
    const newCompactMode = !compactMode
    setCompactMode(newCompactMode)
    localStorage.setItem('dashboard-compact-mode', newCompactMode.toString())
  }

  // Auto-refresh effect
  useEffect(() => {
    fetchDashboardData()

    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 300000) // 5 minutes instead of 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Calculate dashboard stats
  const dashboardStats = {
    totalStudents: students.length,
    totalUsers: users.length,
    totalCourses: courses.length,
    totalAttendances: attendances.length,
    totalGrades: grades.length,
    averageGrade: grades.length > 0 ? grades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / grades.length : 0,
    activeStudents: students.filter(s => s.status === 'ACTIVE').length
  }

  // System health calculation
  const systemHealth = {
    database: 'healthy',
    api: 'healthy',
    performance: 'good',
    uptime: '99.9%'
  }


  // Get activity icon
  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login': return <UserCheck className="h-4 w-4" />
      case 'logout': return <UserPlus className="h-4 w-4" />
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

        {/* Charts Section */}

          {/* Learning Quality Chart */}
          <div className="relative mb-8">
            <div 
              className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 rounded-3xl -z-10" 
            />
            
            <Card className="backdrop-blur-sm border-0 shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 hover:bg-white/90 dark:hover:bg-slate-700/80">
              <CardHeader className="p-6 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white rounded-t-xl">
                <CardTitle className="text-white flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-xl text-white">គុណភាពការសិក្សា</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {learningQualityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={learningQualityData}>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="#e5e7eb" 
                        className="dark:stroke-gray-700"
                      />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#6b7280' }}
                        className="dark:fill-gray-400"
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280' }}
                        className="dark:fill-gray-400"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--card-foreground))'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="quality" 
                        fill="#3b82f6" 
                        className="dark:fill-blue-400"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-base">មិនមានទិន្នន័យ</p>
                  </div>
                )}
                </CardContent>
              </Card>
          </div>


        {/* Top Students */}
        <div className="relative">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 via-orange-50/20 to-red-50/30 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20 rounded-3xl -z-10" 
          />
          
          <Card className={`backdrop-blur-sm border-0 shadow-xl transition-all duration-300 ${
            isDarkMode 
              ? 'bg-slate-800/80 hover:bg-slate-700/80' 
              : 'bg-white/80 hover:bg-white/90'
          }`}>
            <CardHeader className="p-6 bg-gradient-to-r from-yellow-500 via-orange-600 to-red-600 text-white rounded-t-xl">
              <CardTitle className="text-white flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span className="text-xl">សិស្សពូកែ</span>
          </CardTitle>
        </CardHeader>
            <CardContent className="p-6">
          {students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {students.slice(0, 4).map((student) => (
                    <div 
                      key={student.studentId} 
                      className="border-2 rounded-lg p-4 transition-all duration-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {student.firstName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {student.lastName} {student.firstName}
                          </p>
                          <p className="text-base text-gray-500 dark:text-gray-400">
                            {student.class}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                        <p className="text-base text-gray-600 dark:text-gray-400">
                          សិស្សសកម្ម
                        </p>
                    <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ថ្នាក់ {student.class}
                          </span>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                        {student.status === 'ACTIVE' ? 'សកម្ម' : 'អសកម្ម'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-base">មិនមានសិស្ស</p>
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </div>
  )
}
