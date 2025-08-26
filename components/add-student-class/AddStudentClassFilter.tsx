'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search,
  Users,
  BookOpen,
  GraduationCap,
  Plus,
  RefreshCw,
  X,
  Filter,
  Loader2
} from "lucide-react"

interface SchoolYear {
  schoolYearId: number
  schoolYearCode: string
}

interface Course {
  courseId: number
  grade: string
  section: string
  courseName: string
  schoolYear: {
    schoolYearCode: string
  }
}

interface AddStudentClassFilterProps {
  schoolYears: SchoolYear[]
  courses: Course[]
  uniqueClasses: string[]
  selectedSchoolYear: string
  selectedCourse: string
  selectedClass: string
  searchTerm: string
  statistics: {
    totalStudents: number
    availableStudents: number
    selectedCount: number
    enrolledCount: number
    availableForEnrollment: number
  }
  loading?: boolean
  dataLoading?: boolean
  onSchoolYearChange: (value: string) => void
  onCourseChange: (value: string) => void
  onClassChange: (value: string) => void
  onSearchChange: (value: string) => void
  onClearFilters: () => void
  onRefresh: () => void
}

export function AddStudentClassFilter({
  schoolYears,
  courses,
  uniqueClasses,
  selectedSchoolYear,
  selectedCourse,
  selectedClass,
  searchTerm,
  statistics,
  loading = false,
  dataLoading = false,
  onSchoolYearChange,
  onCourseChange,
  onClassChange,
  onSearchChange,
  onClearFilters,
  onRefresh
}: AddStudentClassFilterProps) {
  const enrollmentRate = statistics.availableStudents > 0 
    ? Math.round((statistics.enrolledCount / statistics.availableStudents) * 100) 
    : 0

  return (
    <Card className="border-2 border-indigo-200 hover:shadow-lg transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                បន្ថែមសិស្សទៅក្នុងថ្នាក់
              </CardTitle>
              <p className="text-white/80 text-sm">
                Add Students to Class Management
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {statistics.selectedCount} ជ្រើសរើស
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {enrollmentRate}% ចុះឈ្មោះ
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
                className="pl-10 h-12 text-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-200"
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => onSearchChange("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* School Year Filter */}
            <Select value={selectedSchoolYear} onValueChange={onSchoolYearChange}>
              <SelectTrigger className="h-12 border-2 border-indigo-200 focus:border-indigo-500">
                <SelectValue placeholder="ឆ្នាំសិក្សា" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ទាំងអស់</SelectItem>
                {schoolYears.map((year) => (
                  <SelectItem key={year.schoolYearId} value={year.schoolYearCode}>
                    {year.schoolYearCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Class Filter */}
            <Select value={selectedClass} onValueChange={onClassChange}>
              <SelectTrigger className="h-12 border-2 border-indigo-200 focus:border-indigo-500">
                <SelectValue placeholder="ថ្នាក់" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ទាំងអស់</SelectItem>
                {uniqueClasses.map((className) => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Course Selection */}
            <Select value={selectedCourse} onValueChange={onCourseChange}>
              <SelectTrigger className="h-12 border-2 border-indigo-200 focus:border-indigo-500">
                <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
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

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={onRefresh}
                disabled={loading || dataLoading}
                variant="outline"
                className="h-12 border-2 border-indigo-200 hover:border-indigo-500"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading || dataLoading ? 'animate-spin' : ''}`} />
                ផ្ទុកឡើងវិញ
              </Button>
            </div>
          </div>

          {/* Loading Indicators */}
          {(dataLoading || loading) && (
            <div className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Loader2 className="h-5 w-5 mr-2 animate-spin text-yellow-600" />
              <span className="text-yellow-800">
                {dataLoading ? 'កំពុងផ្ទុកទិន្នន័យ...' : 'កំពុងដំណើរការ...'}
              </span>
            </div>
          )}

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Total Students */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="p-2 bg-blue-100 rounded-lg w-fit mx-auto mb-2">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900">{statistics.totalStudents}</p>
              <p className="text-sm text-blue-600">សិស្សសរុប</p>
            </div>
            
            {/* Available Students */}
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="p-2 bg-green-100 rounded-lg w-fit mx-auto mb-2">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">{statistics.availableStudents}</p>
              <p className="text-sm text-green-600">អាចជ្រើសរើស</p>
            </div>
            
            {/* Selected Students */}
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="p-2 bg-purple-100 rounded-lg w-fit mx-auto mb-2">
                <Plus className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-900">{statistics.selectedCount}</p>
              <p className="text-sm text-purple-600">ជ្រើសរើស</p>
            </div>
            
            {/* Enrolled Students */}
            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
              <div className="p-2 bg-orange-100 rounded-lg w-fit mx-auto mb-2">
                <GraduationCap className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-900">{statistics.enrolledCount}</p>
              <p className="text-sm text-orange-600">ចុះឈ្មោះ</p>
            </div>
            
            {/* Available for Enrollment */}
            <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="p-2 bg-indigo-100 rounded-lg w-fit mx-auto mb-2">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-indigo-900">{statistics.availableForEnrollment}</p>
              <p className="text-sm text-indigo-600">អាចចុះឈ្មោះ</p>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Enrollment Status */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                ស្ថានភាពចុះឈ្មោះ
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">អាចចុះឈ្មោះ</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    {statistics.availableForEnrollment}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ចុះឈ្មោះរួចហើយ</span>
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                    {statistics.enrolledCount}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Selection Status */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-700 mb-3">
                ស្ថានភាពជ្រើសរើស
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600">ជ្រើសរើស</span>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                    {statistics.selectedCount}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600">អាចជ្រើសរើស</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    {statistics.availableStudents}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Enrollment Rate */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <h4 className="text-sm font-semibold text-green-700 mb-3">
                អត្រាចុះឈ្មោះ
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600">អត្រាចុះឈ្មោះ</span>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-900">{enrollmentRate}%</p>
                    <p className="text-xs text-green-600">
                      {statistics.enrolledCount} / {statistics.availableStudents}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${enrollmentRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                សកម្មភាពរហ័ស (Quick Actions)
              </h4>
              <p className="text-xs text-gray-500">
                គ្រប់គ្រងការជ្រើសរើស និងចុះឈ្មោះសិស្ស
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={onClearFilters}
                variant="outline"
                size="sm"
                className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
              >
                <Filter className="h-3 w-3 mr-1" />
                សម្អាត
              </Button>
              <Badge variant="outline" className="text-indigo-600 border-indigo-300">
                <GraduationCap className="h-3 w-3 mr-1" />
                ប្រព័ន្ធដំណើរការ
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
