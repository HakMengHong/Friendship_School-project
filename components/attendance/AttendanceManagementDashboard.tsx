'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"

import { AttendanceFilterPanel } from './AttendanceFilterPanel'
import { AttendanceTable } from './AttendanceTable'
import { AttendanceStatistics } from './AttendanceStatistics'

interface AttendanceManagementDashboardProps {
  // Filter states
  selectedDate: string
  selectedSchoolYear: string
  selectedCourse: string
  selectedStatus: string
  searchTerm: string
  
  // Data states
  schoolYears: any[]
  courses: any[]
  attendances: any[]
  
  // Loading states
  loading: boolean
  loadingAttendances: boolean
  
  // Computed values
  filteredCourses: any[]
  filteredAttendances: any[]
  attendanceStats: any
  
  // Functions
  onDateChange: (date: string) => void
  onSchoolYearChange: (schoolYearId: string) => void
  onCourseChange: (courseId: string) => void
  onStatusChange: (status: string) => void
  onSearchChange: (search: string) => void
  getGradeLabel: (grade: string | number) => string
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => string
}

export function AttendanceManagementDashboard({
  // Filter states
  selectedDate,
  selectedSchoolYear,
  selectedCourse,
  selectedStatus,
  searchTerm,
  
  // Data states
  schoolYears,
  courses,
  attendances,
  
  // Loading states
  loading,
  loadingAttendances,
  
  // Computed values
  filteredCourses,
  filteredAttendances,
  attendanceStats,
  
  // Functions
  onDateChange,
  onSchoolYearChange,
  onCourseChange,
  onStatusChange,
  onSearchChange,
  getGradeLabel,
  getStatusColor,
  getStatusIcon
}: AttendanceManagementDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-indigo-200 hover:shadow-lg transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">ការគ្រប់គ្រងវត្តមាន</CardTitle>
                <p className="text-indigo-100 text-sm">Attendance Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                {attendances.length} កំណត់ត្រា
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filter Panel */}
      <AttendanceFilterPanel
        selectedDate={selectedDate}
        selectedSchoolYear={selectedSchoolYear}
        selectedCourse={selectedCourse}
        selectedStatus={selectedStatus}
        searchTerm={searchTerm}
        schoolYears={schoolYears}
        filteredCourses={filteredCourses}
        loading={loading}
        onDateChange={onDateChange}
        onSchoolYearChange={onSchoolYearChange}
        onCourseChange={onCourseChange}
        onStatusChange={onStatusChange}
        onSearchChange={onSearchChange}
        getGradeLabel={getGradeLabel}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Table */}
        <div>
          <AttendanceTable
            attendances={filteredAttendances}
            loadingAttendances={loadingAttendances}
            getGradeLabel={getGradeLabel}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        </div>

        {/* Attendance Statistics */}
        <div>
          <AttendanceStatistics
            attendanceStats={attendanceStats}
          />
        </div>
      </div>

      {/* Summary Dashboard */}
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
                <AlertCircle className="h-5 w-5 text-white" />
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

        {/* Attendance Rate */}
        <Card className="border-2 border-purple-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">អត្រាវត្តមាន</p>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  {attendanceStats.presentRate}%
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  សិស្ស {attendanceStats.present}/{attendanceStats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Information */}
      <Card className="border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-gray-500 rounded-lg">
              <Info className="h-4 w-4 text-white" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                ព័ត៌មានស្ថានភាព (Status Information)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-400">មានវត្តមាន:</span>
                  <span className="font-medium text-green-700 dark:text-green-300">
                    {attendanceStats.present} នាក់ ({attendanceStats.presentRate}%)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-gray-600 dark:text-gray-400">អវត្តមាន:</span>
                  <span className="font-medium text-red-700 dark:text-red-300">
                    {attendanceStats.absent} នាក់ ({attendanceStats.absentRate}%)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-gray-600 dark:text-gray-400">មកយឺត:</span>
                  <span className="font-medium text-yellow-700 dark:text-yellow-300">
                    {attendanceStats.late} នាក់ ({attendanceStats.lateRate}%)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">មានអធិការដើម្បី:</span>
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    {attendanceStats.excused} នាក់ ({attendanceStats.excusedRate}%)
                  </span>
                </div>
              </div>
              {attendanceStats.total === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  សូមជ្រើសរើសជម្រើសច្រោះដើម្បីមើលវត្តមាន
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
