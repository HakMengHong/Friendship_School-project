'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleGuard } from "@/components/ui/role-guard"
import { 
  Users, 
  BookOpen, 
  Award, 
  MessageSquare, 
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
  GraduationCap
} from "lucide-react"
import { KhmerCalendar } from "@/components/calendar/khmer_calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Loader2, AlertCircle } from "lucide-react"

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
  
  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for announcements
  const [announcements, setAnnouncements] = useState([
    { id: "1", title: "ការប្រជុំគ្រូ", content: "មានការប្រជុំគ្រូនៅថ្ងៃសៅរ៍នេះ នៅម៉ោង ៨:០០ ព្រឹក", date: "2024-01-15", author: "អ្នកគ្រប់គ្រង", priority: "high" },
    { id: "2", title: "ការប្រឡងឆមាស", content: "ការប្រឡងឆមាសនឹងចាប់ផ្តើមនៅខែក្រោយ សូមគ្រូរៀបចំសិស្ស", date: "2024-01-10", author: "អ្នកគ្រប់គ្រង", priority: "medium" },
    { id: "3", title: "ការប្រកួតអក្សរសាស្ត្រ", content: "នឹងមានការប្រកួតអក្សរសាស្ត្រនៅថ្ងៃពុធ សូមគ្រូជ្រើសរើសសិស្ស", date: "2024-01-08", author: "អ្នកគ្រប់គ្រង", priority: "low" },
  ])

  // State for outstanding students
  const [outstandingStudents] = useState([
    { id: 1, name: "សុខ សំអាង", grade: "ថ្នាក់ទី១២ក", achievement: "ពិន្ទុខ្ពស់បំផុតក្នុងថ្នាក់", score: "A+", subject: "គណិតវិទ្យា" },
    { id: 2, name: "ម៉ៅ សុធារី", grade: "ថ្នាក់ទី១១ខ", achievement: "ឈ្នះការប្រកួតអក្សរសាស្ត្រ", score: "A+", subject: "ភាសាខ្មែរ" },
    { id: 3, name: "វ៉ាន់ សុផល", grade: "ថ្នាក់ទី១០គ", achievement: "សកម្មភាពស្ម័គ្រចិត្តល្អ", score: "A", subject: "វិទ្យាសាស្ត្រ" },
    { id: 4, name: "គឹម សុខា", grade: "ថ្នាក់ទី១២ខ", achievement: "ពិន្ទុល្អក្នុងគ្រប់មុខវិជ្ជា", score: "A", subject: "គ្រប់មុខវិជ្ជា" },
  ])

  // Learning quality data by month
  const learningQualityData = [
    { month: 'មករា', quality: 75, averageScore: 68, attendance: 92 },
    { month: 'កុម្ភៈ', quality: 82, averageScore: 72, attendance: 89 },
    { month: 'មីនា', quality: 78, averageScore: 70, attendance: 91 },
    { month: 'មេសា', quality: 85, averageScore: 75, attendance: 94 },
    { month: 'ឧសភា', quality: 90, averageScore: 80, attendance: 96 },
    { month: 'មិថុនា', quality: 88, averageScore: 78, attendance: 93 },
  ]

  // Attendance data for pie chart
  const attendanceData = [
    { name: 'មាន', value: 1150, color: '#10b981' },
    { name: 'អវត្តមាន', value: 45, color: '#ef4444' },
    { name: 'យឺតយ៉ាវ', value: 23, color: '#f59e0b' },
    { name: 'ច្បាប់', value: 12, color: '#3b82f6' },
  ]

  // Recent activities
  const recentActivities = [
    { id: 1, action: "បានបន្ថែមសិស្សថ្មី", time: "២ នាទីមុន", type: "add", user: "គ្រូ សុខា" },
    { id: 2, action: "បានកែប្រែពិន្ទុ", time: "៥ នាទីមុន", type: "edit", user: "គ្រូ ម៉ៅ" },
    { id: 3, action: "បានបង្កើតថ្នាក់ថ្មី", time: "១០ នាទីមុន", type: "create", user: "អ្នកគ្រប់គ្រង" },
    { id: 4, action: "បានបញ្ចូលអវត្តមាន", time: "១៥ នាទីមុន", type: "attendance", user: "គ្រូ វង្ស" },
    { id: 5, action: "បានបង្កើតដំណឹង", time: "២០ នាទីមុន", type: "announcement", user: "អ្នកគ្រប់គ្រង" },
  ]

  // Announcement form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    author: '',
    date: '',
    priority: 'medium'
  });
  
  const handleAddAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    
    const announcementToAdd = {
      ...newAnnouncement,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    };
    
    setAnnouncements([announcementToAdd, ...announcements]);
    
    // Reset form
    setNewAnnouncement({
      title: '',
      content: '',
      author: '',
      date: '',
      priority: 'medium'
    });
    setShowAddForm(false);
  };
  
  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter(announcement => announcement.id !== id));
  };

  // Fetch data from database
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [studentsRes, usersRes, coursesRes, attendancesRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/users'),
        fetch('/api/courses'),
        fetch('/api/attendance?date=' + new Date().toISOString().split('T')[0])
      ])

      // Check responses and parse data
      if (!studentsRes.ok) throw new Error(`Failed to fetch students: ${studentsRes.status}`)
      if (!usersRes.ok) throw new Error(`Failed to fetch users: ${usersRes.status}`)
      if (!coursesRes.ok) throw new Error(`Failed to fetch courses: ${coursesRes.status}`)
      if (!attendancesRes.ok) throw new Error(`Failed to fetch attendances: ${attendancesRes.status}`)

      const [studentsData, usersData, coursesData, attendancesData] = await Promise.all([
        studentsRes.json(),
        usersRes.json(),
        coursesRes.json(),
        attendancesRes.json()
      ])

      setStudents(studentsData)
      setUsers(usersData.users || [])
      setCourses(coursesData)
      setAttendances(attendancesData)

      console.log('✅ Dashboard data loaded successfully')
      console.log('📊 Students:', studentsData?.length || 0)
      console.log('👥 Users:', usersData?.users?.length || 0)
      console.log('📚 Courses:', coursesData?.length || 0)
      console.log('📅 Attendances:', attendancesData?.length || 0)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Safety check for users array
  const safeUsers = users || []

  // Calculate real-time statistics
  const dashboardStats = {
    totalStudents: students.length,
    totalTeachers: safeUsers.filter(user => user.role === 'TEACHER').length,
    totalCourses: courses.length,
    totalAnnouncements: announcements.length,
    activeStudents: students.filter(student => student.status === 'ACTIVE').length,
    todayAttendance: attendances.length,
    presentToday: attendances.filter(a => a.status === 'present').length,
    absentToday: attendances.filter(a => a.status === 'absent').length,
    lateToday: attendances.filter(a => a.status === 'late').length,
    excusedToday: attendances.filter(a => a.status === 'excused').length
  }

  // Generate real attendance data for pie chart
  const realAttendanceData = [
    { name: 'វត្តមាន', value: dashboardStats.presentToday, color: '#10b981' },
    { name: 'អវត្តមាន', value: dashboardStats.absentToday, color: '#ef4444' },
    { name: 'យឺត', value: dashboardStats.lateToday, color: '#f59e0b' },
    { name: 'ច្បាប់', value: dashboardStats.excusedToday, color: '#3b82f6' },
  ]

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">សំខាន់</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">ធម្មតា</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">តិច</Badge>
      default:
        return <Badge>ធម្មតា</Badge>
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'add':
        return <Plus className="h-4 w-4 text-green-600" />
      case 'edit':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'create':
        return <Star className="h-4 w-4 text-purple-600" />
      case 'attendance':
        return <UserCheck className="h-4 w-4 text-orange-600" />
      case 'announcement':
        return <MessageSquare className="h-4 w-4 text-indigo-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700 font-medium">កំហុស:</span>
            <span className="text-red-600">{error}</span>
            <button
              onClick={fetchDashboardData}
              className="ml-auto px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">កំពុងទាញយកទិន្នន័យផ្ទាំងគ្រប់គ្រង...</p>
        </div>
      )}

      {/* Dashboard Content - Only show when not loading */}
      {!loading && (
        <>
          {/* No Data State */}
          {students.length === 0 && safeUsers.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">មិនមានទិន្នន័យ</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                សូមពិនិត្យការតភ្ជាប់ទៅមូលដ្ឋានទិន្នន័យ ឬព្យាយាមម្តងទៀត
              </p>
              <Button onClick={fetchDashboardData} variant="outline">
                ព្យាយាមម្តងទៀត
              </Button>
            </div>
          )}

          {/* Dashboard Content */}
          {students.length > 0 || safeUsers.length > 0 ? (
            <>


          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">សិស្សទាំងអស់</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dashboardStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">សិស្សកំពុងសិក្សា</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">{dashboardStats.activeStudents} សកម្ម</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">គ្រូទាំងអស់</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardStats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">គ្រូបង្រៀនសកម្ម</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">{dashboardStats.totalCourses} ថ្នាក់</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">សិស្សពូកែ</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{dashboardStats.activeStudents}</div>
            <p className="text-xs text-muted-foreground">សិស្សសកម្ម</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">{dashboardStats.totalStudents} សរុប</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ដំណឹង</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{dashboardStats.totalAnnouncements}</div>
            <p className="text-xs text-muted-foreground">ដំណឹងសកម្ម</p>
            <div className="flex items-center mt-2">
              <Clock className="h-3 w-3 text-blue-500 mr-1" />
              <span className="text-xs text-blue-500">ថ្ងៃនេះ: {dashboardStats.todayAttendance}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Learning Quality Chart */}
        <div className="lg:col-span-2">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="text-lg">គុណភាពការសិក្សាតាមខែ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={learningQualityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'quality') return [`${value}%`, 'គុណភាព']
                        if (name === 'averageScore') return [value, 'ពិន្ទុមធ្យម']
                        if (name === 'attendance') return [`${value}%`, 'វត្តមាន']
                        return [value, name]
                      }}
                      labelFormatter={(label) => `ខែ${label}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Legend 
                      formatter={(value) => {
                        if (value === 'quality') return 'គុណភាព (%)'
                        if (value === 'averageScore') return 'ពិន្ទុមធ្យម'
                        if (value === 'attendance') return 'វត្តមាន (%)'
                        return value
                      }}
                    />
                    <Bar dataKey="quality" fill="#3b82f6" name="គុណភាព" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="averageScore" fill="#10b981" name="ពិន្ទុមធ្យម" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="attendance" fill="#f59e0b" name="វត្តមាន" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Pie Chart */}
        <div className="lg:col-span-1">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                <span className="text-lg">វត្តមានថ្ងៃនេះ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={realAttendanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {realAttendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Khmer Calendar and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Khmer Calendar */}
        <div className="lg:col-span-1">
          <KhmerCalendar compact={true} />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-orange-600" />
                <span className="text-lg">សកម្មភាពថ្មីៗ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
            </div>

      {/* Quick Actions Navigation */}
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <span>សកម្មភាពរហ័ស</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <a href="/dashboard/academic-management" className="block">
              <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-6 w-6 text-blue-500" />
                    <div>
                      <h3 className="font-semibold">ការគ្រប់គ្រងវិញ្ញាបនបត្រ</h3>
                      <p className="text-sm text-gray-600">គ្រប់គ្រងថ្នាក់ និងមុខវិជ្ជា</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
            
                          <a href="/dashboard/add-student-class" className="block">
              <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <UserPlus className="h-6 w-6 text-green-500" />
                    <div>
                      <h3 className="font-semibold">បន្ថែមសិស្សទៅក្នុងថ្នាក់</h3>
                      <p className="text-sm text-gray-600">ជ្រើសរើសសិស្ស និងថ្នាក់</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
            
                          <a href="/dashboard/users" className="block">
              <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-purple-500" />
                    <div>
                      <h3 className="font-semibold">គ្រប់គ្រងអ្នកប្រើប្រាស់</h3>
                      <p className="text-sm text-gray-600">គ្រូ និងបុគ្គលិក</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
            
                          <a href="/student-info" className="block">
              <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="h-6 w-6 text-orange-500" />
                    <div>
                      <h3 className="font-semibold">ព័ត៌មានសិស្ស</h3>
                      <p className="text-sm text-gray-600">មើល និងកែប្រែព័ត៌មាន</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Announcements */}
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span className="text-lg">ដំណឹងសំខាន់ៗ</span>
          </CardTitle>
          <Button 
            size="sm" 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="flex items-center gap-2"
            variant="gradient"
          >
            {showAddForm ? (
              <>
                <XCircle className="h-4 w-4" />
                បោះបង់
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                បន្ថែមដំណឹង
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Add Announcement Form */}
          {showAddForm && (
            <div className="mb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ចំណងជើង*</label>
                    <Input
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                      placeholder="បញ្ចូលចំណងជើងដំណឹង"
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">អ្នកនិពន្ធ</label>
                    <Input
                      value={newAnnouncement.author}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, author: e.target.value})}
                      placeholder="អ្នកផ្សព្វផ្សាយ"
                      className="h-12"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ខ្លឹមសារ*</label>
                  <Textarea
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                    placeholder="បញ្ចូលខ្លឹមសារដំណឹង"
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setNewAnnouncement({
                        title: '',
                        content: '',
                        author: '',
                        date: '',
                        priority: 'medium'
                      });
                    }}
                    className="border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    បោះបង់
                  </Button>
                  <Button 
                    onClick={handleAddAnnouncement}
                    variant="gradientGreen"
                  >
                    បន្ថែមដំណឹង
                  </Button>
                </div>
              </div>
            </div>
          )}
    
          {/* Announcements List */}
          <div className="space-y-4">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div key={announcement.id} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {announcement.title}
                        </h3>
                        {getPriorityBadge(announcement.priority)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>📅 {announcement.date}</span>
                        {announcement.author && <span>👤 {announcement.author}</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      aria-label="លុបដំណឹង"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>មិនមានដំណឹងសំខាន់ៗ</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Students */}
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-lg">សិស្សពូកែ</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {students.slice(0, 4).map((student) => (
                <div key={student.studentId} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {student.firstName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{student.class}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">សិស្សសកម្ម</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">ថ្នាក់ {student.class}</span>
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
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>មិនមានសិស្ស</p>
            </div>
          )}
        </CardContent>
      </Card>
            </>
          ) : null}
        </>
      )}
    </div>
  )
}