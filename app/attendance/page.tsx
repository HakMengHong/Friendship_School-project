'use client'

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleGuard } from "@/components/ui/role-guard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Calendar,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Users,
  Loader2,
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Eye,
  MoreHorizontal
} from "lucide-react"
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface SchoolYear {
  schoolYearId: number
  schoolYearCode: string
}

interface Course {
  courseId: number
  courseName: string
  grade: string
  section: string
  schoolYear: SchoolYear
}

interface Student {
  studentId: number
  firstName: string
  lastName: string
  class: string
}

interface Attendance {
  attendanceId: number
  studentId: number
  courseId: number
  attendanceDate: string
  session: 'AM' | 'PM' | 'FULL'
  status: string
  reason: string | null
  recordedBy: string | null
  createdAt: string
  updatedAt: string
  student: Student
  course: Course
}

export default function AbsencePage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AbsenceContent />
    </RoleGuard>
  )
}

function AbsenceContent() {
  // State variables for filtering
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')

  // Data states
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAttendances, setLoadingAttendances] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch initial data
  useEffect(() => {
    fetchInitialData()
  }, [])

  // Fetch attendances when filters change
  useEffect(() => {
    if (selectedDate) {
      fetchAttendances()
    }
  }, [selectedDate, selectedCourse, selectedStatus])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [schoolYearsRes, coursesRes] = await Promise.all([
        fetch('/api/school-years'),
        fetch('/api/courses')
      ])

      if (!schoolYearsRes.ok || !coursesRes.ok) {
        const errorMessage = `Failed to fetch initial data: ${schoolYearsRes.status} ${schoolYearsRes.statusText}`
        throw new Error(errorMessage)
      }

      const [schoolYearsData, coursesData] = await Promise.all([
        schoolYearsRes.json(),
        coursesRes.json()
      ])

      setSchoolYears(schoolYearsData)
      setCourses(coursesData)
      
      // Set first school year as default if available
      if (schoolYearsData.length > 0) {
        setSelectedSchoolYear(schoolYearsData[0].schoolYearId.toString())
      }
      
      console.log(`✅ Successfully loaded ${schoolYearsData.length} school years and ${coursesData.length} courses`)
      setError(null) // Clear any previous errors
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch initial data')
      // Set empty arrays to prevent undefined errors
      setSchoolYears([])
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendances = async () => {
    if (!selectedDate) return
    
    try {
      setLoadingAttendances(true)
      const params = new URLSearchParams({
        date: selectedDate
      })
      
      if (selectedCourse) {
        params.append('courseId', selectedCourse)
      }

      if (selectedStatus) {
        params.append('status', selectedStatus)
      }

              const response = await fetch(`/api/attendance?${params}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setAttendances(data)
      
      // Show success message if data is fetched
      if (data.length > 0) {
        console.log(`✅ Successfully fetched ${data.length} attendance records`)
      } else {
        console.log('ℹ️ No attendance records found for the selected criteria')
      }
      setError(null) // Clear any previous errors
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching attendances:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch attendances')
      // Set empty array to show "no data" state
      setAttendances([])
    } finally {
      setLoadingAttendances(false)
    }
  }

  // Filter courses based on selected school year
  const filteredCourses = useMemo(() => 
    selectedSchoolYear 
      ? courses.filter(course => course.schoolYear.schoolYearId.toString() === selectedSchoolYear)
      : courses
  , [courses, selectedSchoolYear])

  // Filter attendances based on criteria
  const filteredAttendances = useMemo(() => {
    return attendances.filter(attendance => {
      const matchesStatus = !selectedStatus || attendance.status === selectedStatus
      const matchesSearch = !searchTerm || 
        `${attendance.student.firstName} ${attendance.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesStatus && matchesSearch
    })
  }, [attendances, selectedStatus, searchTerm])

  // Calculate statistics from real data
  const statistics = useMemo(() => {
    const totalAbsent = attendances.filter(a => a.status === 'absent').length
    const totalLate = attendances.filter(a => a.status === 'late').length
    const totalExcused = attendances.filter(a => a.status === 'excused').length
    
    return {
      totalAbsent,
      totalLate,
      totalExcused
    }
  }, [attendances])

  // Chart data - using real statistics
  const chartData = {
    labels: ['អវត្តមាន(ឥតច្បាប់)', 'យឺត', 'អវត្តមាន(មានច្បាប់)'],
    datasets: [
      {
        label: 'ចំនួនសិស្ស',
        data: [statistics.totalAbsent, statistics.totalLate, statistics.totalExcused],
        backgroundColor: [
          'rgba(244, 63, 94, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(16, 185, 129, 0.7)'
        ],
        borderColor: [
          'rgba(244, 63, 94, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)'
        ],
        borderWidth: 2,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem: any) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.parsed.y} នាក់`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(tickValue: any) {
            return `${tickValue} នាក់`
          }
        }
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">វត្តមាន</Badge>
      case 'absent':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">អវត្តមាន(ឥតច្បាប់)</Badge>
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">យឺត</Badge>
      case 'excused':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">អវត្តមាន(មានច្បាប់)</Badge>
      default:
        return <Badge>មិនដឹង</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'excused':
        return <UserCheck className="h-4 w-4 text-blue-600" />
      default:
        return <UserCheck className="h-4 w-4 text-gray-600" />
    }
  }

  const clearFilters = () => {
    setSelectedDate(new Date().toISOString().split('T')[0])
    setSelectedCourse('')
    setSelectedStatus('')
    setSearchTerm('')
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto space-y-4">
        {/* Modern Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-indigo-500/20 rounded-3xl -z-10" />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6">
            <div>
          </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300"
              >
                <Filter className="h-4 w-4" />
                តម្រង
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAttendances}
                disabled={loadingAttendances}
                className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300"
              >
                <RefreshCw className={`h-4 w-4 ${loadingAttendances ? 'animate-spin' : ''}`} />
                ធ្វើបច្ចុប្បន្នភាព
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 font-medium dark:text-red-400">កំហុស:</p>
                <p className="text-red-600 dark:text-red-300">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 hover:bg-red-100"
              >
                ✕
              </Button>
            </div>
          </div>
        )}

        {/* Modern Filter Panel */}
        {showFilters && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                តម្រងទិន្នន័យ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ឆ្នាំសិក្សា</label>
                  <Select value={selectedSchoolYear} onValueChange={setSelectedSchoolYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើសឆ្នាំសិក្សា" />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolYears.map((year) => (
                        <SelectItem key={year.schoolYearId} value={year.schoolYearId.toString()}>
                          {year.schoolYearCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">ថ្នាក់</label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCourses.map((course) => (
                        <SelectItem key={course.courseId} value={course.courseId.toString()}>
                          {course.courseName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">កាលបរិច្ឆេទ</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">ស្ថានភាព</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើសស្ថានភាព" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="absent">អវត្តមាន(ឥតច្បាប់)</SelectItem>
                      <SelectItem value="late">យឺត</SelectItem>
                      <SelectItem value="excused">អវត្តមាន(មានច្បាប់)</SelectItem>
                      <SelectItem value="present">វត្តមាន</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">ស្វែងរក</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ស្វែងរកសិស្ស..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={clearFilters} size="sm">
                  កំណត់ឡើងវិញ
                </Button>
                <Button onClick={() => setShowFilters(false)} size="sm">
                  ប្រើប្រាស់
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modern Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-red-500 via-red-600 to-pink-500 rounded-xl shadow-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                    {statistics.totalAbsent.toLocaleString('km-KH')}
                  </p>
                  <p className="text-xl text-red-600 dark:text-red-400 font-medium">
                    អវត្តមាន(ឥតច្បាប់)
                  </p>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-pink-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              {statistics.totalAbsent > 0 && (
                <div className="mt-4 flex items-center text-xs text-red-600 dark:text-red-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  ត្រូវការការអភិវឌ្ឍន៍
                </div>
              )}
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500 via-orange-600 to-amber-500 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                    {statistics.totalLate.toLocaleString('km-KH')}
                  </p>
                  <p className="text-xl text-yellow-600 dark:text-yellow-400 font-medium">
                    យឺត
                  </p>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-yellow-500 via-orange-600 to-amber-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              {statistics.totalLate > 0 && (
                <div className="mt-4 flex items-center text-xs text-yellow-600 dark:text-yellow-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  ត្រូវការការអភិវឌ្ឍន៍
                </div>
              )}
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-500 rounded-xl shadow-lg">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {statistics.totalExcused.toLocaleString('km-KH')}
                  </p>
                  <p className="text-xl text-green-600 dark:text-green-400 font-medium">
                    អវត្តមាន(មានច្បាប់)
                  </p>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="mt-4 flex items-center text-xs text-green-600 dark:text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                គ្រប់គ្រងបានល្អ
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {attendances.length.toLocaleString('km-KH')}
                  </p>
                  <p className="text-xl text-blue-600 dark:text-blue-400 font-medium">
                    សរុបកត់ត្រា
                  </p>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="mt-4 flex items-center text-xs text-blue-600 dark:text-blue-400">
                <BarChart3 className="h-3 w-3 mr-1" />
                ទិន្នន័យពេញលេញ
              </div>
            </div>
          </div>
        </div>

        {/* Modern Analytics Dashboard */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-rose-50/30 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-rose-950/20 rounded-3xl -z-10" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-2">
              <Card className={`backdrop-blur-sm border-0 shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 hover:bg-white/90 dark:hover:bg-slate-700/80`}>
                <CardHeader className="p-6 bg-gradient-to-r from-purple-500 via-pink-600 to-rose-600 text-white rounded-t-xl">
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xl text-white">ស្ថិតិវត្តមានសិស្ស</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-white/20 text-white">
                        ប្រចាំថ្ងៃ
                      </Badge>
                      <div className="text-xs text-white/80">
                        ចុងក្រោយ: {lastUpdated.toLocaleTimeString('km-KH')}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80">
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground text-center">
                    ការវិភាគស្ថិតិវត្តមានសិស្សប្រចាំថ្ងៃ {selectedDate}
                  </div>
                </CardContent>
              </Card>
            </div>

          {/* Quick Insights */}
          <div className="space-y-6">
            <Card className={`backdrop-blur-sm border-0 shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 hover:bg-white/90 dark:hover:bg-slate-700/80`}>
              <CardHeader className="p-6 bg-gradient-to-r from-blue-500 via-cyan-600 to-teal-600 text-white rounded-t-xl">
                <CardTitle className="text-white flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl text-white">ការវិភាគរហ័ស</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 rounded-lg group-hover:scale-110 transition-transform">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      </div>
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">អវត្តមានឥតច្បាប់</span>
                    </div>
                    <span className="text-xl font-bold text-red-600 dark:text-red-400">{statistics.totalAbsent}</span>
                  </div>
                  
                  <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:scale-110 transition-transform">
                        <Clock className="h-4 w-4 text-yellow-500" />
                      </div>
                      <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">យឺត</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{statistics.totalLate}</span>
                  </div>
                  
                  <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg group-hover:scale-110 transition-transform">
                        <UserCheck className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">អវត្តមានច្បាប់</span>
                    </div>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">{statistics.totalExcused}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-muted-foreground">
                    សរុបកត់ត្រា: <span className="font-semibold text-foreground">{attendances.length}</span> នាក់
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    កាលបរិច្ឆេទ: {new Date(selectedDate).toLocaleDateString('km-KH')}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
        </div>

        {/* Modern Footer */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 via-blue-50/50 to-indigo-50/50 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50 rounded-2xl -z-10" />
          <div className="text-center py-8 px-6">
            <div className="text-sm text-muted-foreground mb-4">
              ប្រព័ន្ធគ្រប់គ្រងវត្តមានសិស្ស • ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ: {lastUpdated.toLocaleString('km-KH')}
            </div>
            <div className="flex justify-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchAttendances} 
                disabled={loadingAttendances}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingAttendances ? 'animate-spin' : ''}`} />
                ធ្វើបច្ចុប្បន្នភាព
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300"
              >
                <Filter className="h-4 w-4 mr-2" />
                តម្រងទិន្នន័យ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
