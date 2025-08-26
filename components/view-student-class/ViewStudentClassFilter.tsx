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
  Filter,
  RefreshCw,
  X,
  Eye,
  Loader2,
  ChevronDown,
  ChevronUp
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
    schoolYearId: number
    schoolYearCode: string
  }
  teacherId1?: number
  teacherId2?: number
  teacherId3?: number
}

interface ViewStudentClassFilterProps {
  schoolYears: SchoolYear[]
  courses: Course[]
  selectedSchoolYear: string
  selectedCourse: string
  searchTerm: string
  showFilters: boolean
  statistics: {
    totalStudents: number
    totalCourses: number
    totalSchoolYears: number
    totalEnrollments: number
    activeEnrollments: number
    displayedStudents: number
  }
  courseDistribution: { [key: string]: number }
  schoolYearDistribution: { [key: string]: number }
  loading?: boolean
  dataLoading?: boolean
  onSchoolYearChange: (value: string) => void
  onCourseChange: (value: string) => void
  onSearchChange: (value: string) => void
  onToggleFilters: () => void
  onClearFilters: () => void
  onRefresh: () => void
}

export function ViewStudentClassFilter({
  schoolYears,
  courses,
  selectedSchoolYear,
  selectedCourse,
  searchTerm,
  showFilters,
  statistics,
  courseDistribution,
  schoolYearDistribution,
  loading = false,
  dataLoading = false,
  onSchoolYearChange,
  onCourseChange,
  onSearchChange,
  onToggleFilters,
  onClearFilters,
  onRefresh
}: ViewStudentClassFilterProps) {
  const enrollmentRate = statistics.totalStudents > 0 
    ? Math.round((statistics.totalEnrollments / statistics.totalStudents) * 100) 
    : 0

  const topCourses = Object.entries(courseDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  const topSchoolYears = Object.entries(schoolYearDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  return (
    <Card className="border-2 border-blue-200 hover:shadow-lg transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                មើលសិស្សក្នុងថ្នាក់
              </CardTitle>
              <p className="text-white/80 text-sm">
                View Students in Class Management
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {statistics.displayedStudents} បង្ហាញ
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {enrollmentRate}% ចុះឈ្មោះ
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Button
              onClick={onToggleFilters}
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              តម្រង់រើស
              {showFilters ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
            <div className="flex items-center space-x-2">
              <Button
                onClick={onRefresh}
                disabled={loading || dataLoading}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading || dataLoading ? 'animate-spin' : ''}`} />
                ផ្ទុកឡើងវិញ
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="ស្វែងរកសិស្ស..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 h-12 text-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-200"
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
                  <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="ឆ្នាំសិក្សា" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ទាំងអស់</SelectItem>
                    {schoolYears.map((year) => (
                      <SelectItem key={year.schoolYearId} value={year.schoolYearCode}>
                        {year.schoolYearCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Course Selection */}
                <Select value={selectedCourse} onValueChange={onCourseChange}>
                  <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="ថ្នាក់" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ទាំងអស់</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.courseId} value={course.courseId.toString()}>
                        {course.courseName} - {course.grade}{course.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                <Button
                  onClick={onClearFilters}
                  variant="outline"
                  className="h-12 border-2 border-blue-200 hover:border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  សម្អាត
                </Button>
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
            </div>
          )}

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {/* Total Students */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="p-2 bg-blue-100 rounded-lg w-fit mx-auto mb-2">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900">{statistics.totalStudents}</p>
              <p className="text-sm text-blue-600">សិស្សសរុប</p>
            </div>
            
            {/* Total Courses */}
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="p-2 bg-purple-100 rounded-lg w-fit mx-auto mb-2">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-900">{statistics.totalCourses}</p>
              <p className="text-sm text-purple-600">ថ្នាក់សរុប</p>
            </div>
            
            {/* School Years */}
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="p-2 bg-green-100 rounded-lg w-fit mx-auto mb-2">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">{statistics.totalSchoolYears}</p>
              <p className="text-sm text-green-600">ឆ្នាំសិក្សា</p>
            </div>
            
            {/* Total Enrollments */}
            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
              <div className="p-2 bg-orange-100 rounded-lg w-fit mx-auto mb-2">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-900">{statistics.totalEnrollments}</p>
              <p className="text-sm text-orange-600">ចុះឈ្មោះសរុប</p>
            </div>
            
            {/* Active Enrollments */}
            <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="p-2 bg-indigo-100 rounded-lg w-fit mx-auto mb-2">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-indigo-900">{statistics.activeEnrollments}</p>
              <p className="text-sm text-indigo-600">ចុះឈ្មោះសកម្ម</p>
            </div>
            
            {/* Displayed Students */}
            <div className="text-center p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
              <div className="p-2 bg-teal-100 rounded-lg w-fit mx-auto mb-2">
                <Eye className="h-6 w-6 text-teal-600" />
              </div>
              <p className="text-2xl font-bold text-teal-900">{statistics.displayedStudents}</p>
              <p className="text-sm text-teal-600">បង្ហាញ</p>
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
                  <span className="text-sm text-gray-600">ចុះឈ្មោះសរុប</span>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    {statistics.totalEnrollments}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ចុះឈ្មោះសកម្ម</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    {statistics.activeEnrollments}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">អត្រាចុះឈ្មោះ</span>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{enrollmentRate}%</p>
                    <p className="text-xs text-gray-600">
                      {statistics.totalEnrollments} / {statistics.totalStudents}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${enrollmentRate}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Top Courses */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-700 mb-3">
                ថ្នាក់ដែលមានសិស្សច្រើនជាងគេ
              </h4>
              <div className="space-y-2">
                {topCourses.map(([courseName, count], index) => (
                  <div key={courseName} className="flex items-center justify-between">
                    <span className="text-sm text-blue-600 truncate">{courseName}</span>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {count}
                    </Badge>
                  </div>
                ))}
                {topCourses.length === 0 && (
                  <p className="text-sm text-blue-500">មិនមានទិន្នន័យ</p>
                )}
              </div>
            </div>

            {/* Top School Years */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <h4 className="text-sm font-semibold text-green-700 mb-3">
                ឆ្នាំសិក្សាដែលមានសិស្សច្រើន
              </h4>
              <div className="space-y-2">
                {topSchoolYears.map(([schoolYear, count], index) => (
                  <div key={schoolYear} className="flex items-center justify-between">
                    <span className="text-sm text-green-600">{schoolYear}</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {count}
                    </Badge>
                  </div>
                ))}
                {topSchoolYears.length === 0 && (
                  <p className="text-sm text-green-500">មិនមានទិន្នន័យ</p>
                )}
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
                គ្រប់គ្រងការមើល និងដកសិស្សចេញពីថ្នាក់
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                <Eye className="h-3 w-3 mr-1" />
                ប្រព័ន្ធដំណើរការ
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-300">
                <Users className="h-3 w-3 mr-1" />
                {statistics.displayedStudents} សិស្ស
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
