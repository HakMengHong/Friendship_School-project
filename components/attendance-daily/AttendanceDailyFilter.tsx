'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search,
  Calendar,
  BookOpen,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Loader2
} from "lucide-react"

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

interface AttendanceDailyFilterProps {
  schoolYears: SchoolYear[]
  courses: Course[]
  formData: {
    schoolYear: string
    course: string
    date: string
  }
  searchTerm: string
  statistics: {
    amPresent: number
    amAbsent: number
    amLate: number
    amExcused: number
    pmPresent: number
    pmAbsent: number
    pmLate: number
    pmExcused: number
    fullPresent: number
    fullAbsent: number
    fullLate: number
    fullExcused: number
    totalPresent: number
    totalAbsent: number
    totalLate: number
    totalExcused: number
  }
  loading?: boolean
  loadingStudents?: boolean
  loadingAttendances?: boolean
  onSchoolYearChange: (value: string) => void
  onCourseChange: (value: string) => void
  onDateChange: (value: string) => void
  onSearchChange: (value: string) => void
  onRefresh: () => void
}

export function AttendanceDailyFilter({
  schoolYears,
  courses,
  formData,
  searchTerm,
  statistics,
  loading = false,
  loadingStudents = false,
  loadingAttendances = false,
  onSchoolYearChange,
  onCourseChange,
  onDateChange,
  onSearchChange,
  onRefresh
}: AttendanceDailyFilterProps) {
  const totalStudents = statistics.totalPresent + statistics.totalAbsent + statistics.totalLate + statistics.totalExcused
  const attendanceRate = totalStudents > 0 ? Math.round((statistics.totalPresent / totalStudents) * 100) : 0

  return (
    <Card className="border-2 border-green-200 hover:shadow-lg transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                វត្តមានប្រចាំថ្ងៃ
              </CardTitle>
              <p className="text-white/80 text-sm">
                Daily Attendance Management
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {totalStudents} សិស្ស
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {attendanceRate}% វត្តមាន
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ស្វែងរកសិស្ស..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-12 text-lg border-2 border-green-200 focus:border-green-500 focus:ring-green-200"
              />
            </div>

            {/* School Year Filter */}
            <Select value={formData.schoolYear} onValueChange={onSchoolYearChange}>
              <SelectTrigger className="h-12 border-2 border-green-200 focus:border-green-500">
                <SelectValue placeholder="ឆ្នាំសិក្សា" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ទាំងអស់</SelectItem>
                {schoolYears.map((year) => (
                  <SelectItem key={year.schoolYearId} value={year.schoolYearId.toString()}>
                    {year.schoolYearCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Course Filter */}
            <Select value={formData.course} onValueChange={onCourseChange}>
              <SelectTrigger className="h-12 border-2 border-green-200 focus:border-green-500">
                <SelectValue placeholder="ថ្នាក់" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ជ្រើសរើសថ្នាក់</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.courseId} value={course.courseId.toString()}>
                    {course.courseName} - {course.grade}{course.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={(e) => onDateChange(e.target.value)}
                className="pl-10 h-12 text-lg border-2 border-green-200 focus:border-green-500 focus:ring-green-200"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={onRefresh}
                disabled={loading}
                variant="outline"
                className="h-12 border-2 border-green-200 hover:border-green-500"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                ផ្ទុកឡើងវិញ
              </Button>
            </div>
          </div>

          {/* Loading Indicators */}
          {(loadingStudents || loadingAttendances) && (
            <div className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Loader2 className="h-5 w-5 mr-2 animate-spin text-yellow-600" />
              <span className="text-yellow-800">
                {loadingStudents ? 'កំពុងផ្ទុកសិស្ស...' : 'កំពុងផ្ទុកវត្តមាន...'}
              </span>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
            {/* AM Session */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-600 mb-1">ពេលព្រឹក</div>
              <CheckCircle className="h-6 w-6 mx-auto mb-1 text-green-600" />
              <p className="text-lg font-bold text-green-900">{statistics.amPresent}</p>
              <p className="text-xs text-green-600">វត្តមាន</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
              <div className="text-xs text-red-600 mb-1">ពេលព្រឹក</div>
              <XCircle className="h-6 w-6 mx-auto mb-1 text-red-600" />
              <p className="text-lg font-bold text-red-900">{statistics.amAbsent}</p>
              <p className="text-xs text-red-600">អវត្តមាន</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
              <div className="text-xs text-yellow-600 mb-1">ពេលព្រឹក</div>
              <Clock className="h-6 w-6 mx-auto mb-1 text-yellow-600" />
              <p className="text-lg font-bold text-yellow-900">{statistics.amLate}</p>
              <p className="text-xs text-yellow-600">យឺត</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-600 mb-1">ពេលព្រឹក</div>
              <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-blue-600" />
              <p className="text-lg font-bold text-blue-900">{statistics.amExcused}</p>
              <p className="text-xs text-blue-600">មានច្បាប់</p>
            </div>

            {/* PM Session */}
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="text-xs text-green-600 mb-1">ពេលរសៀល</div>
              <CheckCircle className="h-6 w-6 mx-auto mb-1 text-green-600" />
              <p className="text-lg font-bold text-green-900">{statistics.pmPresent}</p>
              <p className="text-xs text-green-600">វត្តមាន</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-200">
              <div className="text-xs text-red-600 mb-1">ពេលរសៀល</div>
              <XCircle className="h-6 w-6 mx-auto mb-1 text-red-600" />
              <p className="text-lg font-bold text-red-900">{statistics.pmAbsent}</p>
              <p className="text-xs text-red-600">អវត្តមាន</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
              <div className="text-xs text-orange-600 mb-1">ពេលរសៀល</div>
              <Clock className="h-6 w-6 mx-auto mb-1 text-orange-600" />
              <p className="text-lg font-bold text-orange-900">{statistics.pmLate}</p>
              <p className="text-xs text-orange-600">យឺត</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="text-xs text-indigo-600 mb-1">ពេលរសៀល</div>
              <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-indigo-600" />
              <p className="text-lg font-bold text-indigo-900">{statistics.pmExcused}</p>
              <p className="text-xs text-indigo-600">មានច្បាប់</p>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-900">{statistics.totalPresent}</p>
              <p className="text-sm text-green-600">វត្តមានសរុប</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-200">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold text-red-900">{statistics.totalAbsent}</p>
              <p className="text-sm text-red-600">អវត្តមានសរុប</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
              <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold text-yellow-900">{statistics.totalLate}</p>
              <p className="text-sm text-yellow-600">យឺតសរុប</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-900">{statistics.totalExcused}</p>
              <p className="text-sm text-blue-600">មានច្បាប់សរុប</p>
            </div>
          </div>

          {/* Attendance Rate */}
          <div className="flex items-center justify-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <div className="text-center">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                អត្រាវត្តមាន (Attendance Rate)
              </h4>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-green-600">{attendanceRate}%</div>
                <div className="text-sm text-gray-500">
                  {statistics.totalPresent} / {totalStudents} សិស្ស
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
