'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp,
  Activity,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react"

interface DashboardStatisticsProps {
  dashboardStats: {
    totalStudents: number
    totalUsers: number
    totalCourses: number
    totalAttendances: number
    presentAttendances: number
    absentAttendances: number
    lateAttendances: number
    excusedAttendances: number
    attendanceRate: number
  }
  loading: boolean
}

export function DashboardStatistics({
  dashboardStats,
  loading
}: DashboardStatisticsProps) {
  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 80) return 'text-blue-600'
    if (rate >= 70) return 'text-yellow-600'
    if (rate >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getAttendanceIcon = (rate: number) => {
    if (rate >= 90) return <Star className="h-4 w-4" />
    if (rate >= 80) return <TrendingUp className="h-4 w-4" />
    if (rate >= 70) return <Activity className="h-4 w-4" />
    if (rate >= 60) return <Clock className="h-4 w-4" />
    return <AlertCircle className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="border-2 border-gray-200 animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-6 bg-gray-300 rounded w-12"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <Card className="border-2 border-blue-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">សិស្សសរុប</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {dashboardStats.totalStudents}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  សិស្សចុះឈ្មោះ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Users */}
        <Card className="border-2 border-green-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">អ្នកប្រើប្រាស់</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">
                  {dashboardStats.totalUsers}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  គ្រូ និងអ្នកគ្រប់គ្រង
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Courses */}
        <Card className="border-2 border-purple-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">ថ្នាក់សិក្សា</p>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  {dashboardStats.totalCourses}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  ថ្នាក់ដែលបើក
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Rate */}
        <Card className="border-2 border-orange-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">អត្រាវត្តមាន</p>
                <p className={`text-xl font-bold ${getAttendanceColor(dashboardStats.attendanceRate)}`}>
                  {dashboardStats.attendanceRate}%
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  ថ្ងៃនេះ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Present Students */}
        <Card className="border-2 border-green-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">មានវត្តមាន</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">
                  {dashboardStats.presentAttendances}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  សិស្ស
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Absent Students */}
        <Card className="border-2 border-red-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg">
                <XCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">អវត្តមាន</p>
                <p className="text-xl font-bold text-red-700 dark:text-red-300">
                  {dashboardStats.absentAttendances}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  សិស្ស
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Late Students */}
        <Card className="border-2 border-yellow-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">មកយឺត</p>
                <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                  {dashboardStats.lateAttendances}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  សិស្ស
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Excused Students */}
        <Card className="border-2 border-blue-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">មានអធិការ</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {dashboardStats.excusedAttendances}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  សិស្ស
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
                  សង្ខេបដំណើរការ (Performance Summary)
                </h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                  ថ្ងៃ {new Date().toLocaleDateString('km-KH')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getAttendanceIcon(dashboardStats.attendanceRate)}
              <Badge 
                variant="outline" 
                className={`border-2 ${getAttendanceColor(dashboardStats.attendanceRate)}`}
              >
                អត្រាវត្តមាន: {dashboardStats.attendanceRate}%
              </Badge>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">សិស្សសរុប</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                {dashboardStats.totalStudents}
              </p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">ថ្នាក់សិក្សា</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                {dashboardStats.totalCourses}
              </p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">អ្នកប្រើប្រាស់</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                {dashboardStats.totalUsers}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
