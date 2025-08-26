'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  Star,
  Target,
  Activity
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

interface AttendanceStatisticsProps {
  attendanceStats: {
    total: number
    present: number
    absent: number
    late: number
    excused: number
    presentRate: number
    absentRate: number
    lateRate: number
    excusedRate: number
  }
}

export function AttendanceStatistics({
  attendanceStats
}: AttendanceStatisticsProps) {
  // Chart data
  const chartData = {
    labels: ['មានវត្តមាន', 'អវត្តមាន', 'មកយឺត', 'មានអធិការដើម្បី'],
    datasets: [
      {
        label: 'ចំនួនសិស្ស',
        data: [attendanceStats.present, attendanceStats.absent, attendanceStats.late, attendanceStats.excused],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Green for present
          'rgba(239, 68, 68, 0.8)',   // Red for absent
          'rgba(234, 179, 8, 0.8)',   // Yellow for late
          'rgba(59, 130, 246, 0.8)',  // Blue for excused
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'វត្តមានសិស្ស (Student Attendance)',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 80) return 'text-blue-600'
    if (rate >= 70) return 'text-yellow-600'
    if (rate >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getPerformanceIcon = (rate: number) => {
    if (rate >= 90) return <Star className="h-4 w-4" />
    if (rate >= 80) return <TrendingUp className="h-4 w-4" />
    if (rate >= 70) return <Activity className="h-4 w-4" />
    if (rate >= 60) return <Target className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
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
                  {attendanceStats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  {attendanceStats.present}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {attendanceStats.presentRate}%
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
                  {attendanceStats.absent}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {attendanceStats.absentRate}%
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
                  {attendanceStats.late}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  {attendanceStats.lateRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card className="border-2 border-purple-200 hover:shadow-lg transition-all duration-200">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">ក្រាហ្វិកវត្តមាន</CardTitle>
                <p className="text-purple-100 text-sm">Attendance Chart</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Performance Analysis */}
        <Card className="border-2 border-indigo-200 hover:shadow-lg transition-all duration-200">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">ការវិភាគដំណើរការ</CardTitle>
                <p className="text-indigo-100 text-sm">Performance Analysis</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Overall Performance */}
            <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center justify-center space-x-2 mb-2">
                {getPerformanceIcon(attendanceStats.presentRate)}
                <span className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
                  អត្រាវត្តមានសរុប
                </span>
              </div>
              <p className={`text-3xl font-bold ${getPerformanceColor(attendanceStats.presentRate)}`}>
                {attendanceStats.presentRate}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                សិស្ស {attendanceStats.present} ក្នុងចំណោម {attendanceStats.total} នាក់
              </p>
            </div>

            {/* Performance Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    មានវត្តមាន
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-700 dark:text-green-300">
                    {attendanceStats.presentRate}%
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {attendanceStats.present} នាក់
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    អវត្តមាន
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-700 dark:text-red-300">
                    {attendanceStats.absentRate}%
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {attendanceStats.absent} នាក់
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    មកយឺត
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
                    {attendanceStats.lateRate}%
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    {attendanceStats.late} នាក់
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    មានអធិការដើម្បី
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    {attendanceStats.excusedRate}%
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {attendanceStats.excused} នាក់
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-gray-500 rounded-lg">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                ការវិភាគដំណើរការ (Performance Insights)
              </h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {attendanceStats.presentRate >= 90 && (
                  <p className="flex items-center space-x-2">
                    <Star className="h-3 w-3 text-green-600" />
                    <span>អត្រាវត្តមានល្អណាស់! សិស្សភាគច្រើនមានវត្តមានជាប្រចាំ</span>
                  </p>
                )}
                {attendanceStats.presentRate >= 80 && attendanceStats.presentRate < 90 && (
                  <p className="flex items-center space-x-2">
                    <TrendingUp className="h-3 w-3 text-blue-600" />
                    <span>អត្រាវត្តមានល្អ! មានការកែលម្អជាបន្តបន្ទាប់</span>
                  </p>
                )}
                {attendanceStats.presentRate >= 70 && attendanceStats.presentRate < 80 && (
                  <p className="flex items-center space-x-2">
                    <Target className="h-3 w-3 text-yellow-600" />
                    <span>អត្រាវត្តមានមធ្យម ត្រូវការកែលម្អបន្ថែម</span>
                  </p>
                )}
                {attendanceStats.presentRate < 70 && (
                  <p className="flex items-center space-x-2">
                    <TrendingDown className="h-3 w-3 text-red-600" />
                    <span>អត្រាវត្តមានទាប ត្រូវការការពារជាបន្ទាន់</span>
                  </p>
                )}
                {attendanceStats.absent > attendanceStats.total * 0.1 && (
                  <p className="flex items-center space-x-2">
                    <XCircle className="h-3 w-3 text-red-600" />
                    <span>អត្រាអវត្តមានខ្ពស់ ត្រូវពិនិត្យមូលហេតុ</span>
                  </p>
                )}
                {attendanceStats.late > attendanceStats.total * 0.05 && (
                  <p className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-yellow-600" />
                    <span>អត្រាមកយឺតខ្ពស់ ត្រូវណែនាំអំពីពេលវេលា</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
