'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Filter,
  Calendar,
  GraduationCap,
  Search,
  TrendingUp,
  Clock,
  UserCheck
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

interface AttendanceFilterPanelProps {
  selectedDate: string
  selectedSchoolYear: string
  selectedCourse: string
  selectedStatus: string
  searchTerm: string
  schoolYears: SchoolYear[]
  filteredCourses: Course[]
  loading: boolean
  onDateChange: (date: string) => void
  onSchoolYearChange: (schoolYearId: string) => void
  onCourseChange: (courseId: string) => void
  onStatusChange: (status: string) => void
  onSearchChange: (search: string) => void
  getGradeLabel: (grade: string | number) => string
}

export function AttendanceFilterPanel({
  selectedDate,
  selectedSchoolYear,
  selectedCourse,
  selectedStatus,
  searchTerm,
  schoolYears,
  filteredCourses,
  loading,
  onDateChange,
  onSchoolYearChange,
  onCourseChange,
  onStatusChange,
  onSearchChange,
  getGradeLabel
}: AttendanceFilterPanelProps) {
  return (
    <Card className="border-2 border-blue-200 hover:shadow-lg transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Filter className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">ការច្រោះវត្តមាន</CardTitle>
              <p className="text-blue-100 text-sm">Attendance Filter Panel</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {loading ? 'កំពុងផ្ទុក...' : 'រួចរាល់'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="ស្វែងរកសិស្ស ឬថ្នាក់..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12 text-lg border-blue-200 focus:border-blue-500 focus:ring-blue-200"
          />
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Filter */}
          <div>
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Calendar className="h-4 w-4" />
              ថ្ងៃខែ (Date)
            </Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="mt-1 h-12 text-lg border-blue-200 focus:border-blue-500 focus:ring-blue-200"
            />
          </div>

          {/* School Year Filter */}
          <div>
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Calendar className="h-4 w-4" />
              ឆ្នាំសិក្សា (School Year)
            </Label>
            <Select value={selectedSchoolYear} onValueChange={onSchoolYearChange}>
              <SelectTrigger className="mt-1 h-12 text-lg border-blue-200 focus:border-blue-500 focus:ring-blue-200">
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

          {/* Course Filter */}
          <div>
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <GraduationCap className="h-4 w-4" />
              ថ្នាក់ (Course)
            </Label>
            <Select 
              value={selectedCourse} 
              onValueChange={onCourseChange}
              disabled={!selectedSchoolYear}
            >
              <SelectTrigger className="mt-1 h-12 text-lg border-blue-200 focus:border-blue-500 focus:ring-blue-200">
                <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
              </SelectTrigger>
              <SelectContent>
                {filteredCourses.map((course) => (
                  <SelectItem key={course.courseId} value={course.courseId.toString()}>
                    {getGradeLabel(course.grade)} - {course.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <UserCheck className="h-4 w-4" />
              ស្ថានភាព (Status)
            </Label>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="mt-1 h-12 text-lg border-blue-200 focus:border-blue-500 focus:ring-blue-200">
                <SelectValue placeholder="ជ្រើសរើសស្ថានភាព" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ទាំងអស់ (All)</SelectItem>
                <SelectItem value="PRESENT">មានវត្តមាន (Present)</SelectItem>
                <SelectItem value="ABSENT">អវត្តមាន (Absent)</SelectItem>
                <SelectItem value="LATE">មកយឺត (Late)</SelectItem>
                <SelectItem value="EXCUSED">មានអធិការដើម្បី (Excused)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              សង្ខេបការច្រោះ (Filter Summary)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
            {selectedDate && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3 text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">ថ្ងៃខែ:</span>
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {new Date(selectedDate).toLocaleDateString('km-KH')}
                </span>
              </div>
            )}
            {selectedSchoolYear && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3 text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">ឆ្នាំសិក្សា:</span>
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {schoolYears.find(y => y.schoolYearId.toString() === selectedSchoolYear)?.schoolYearCode}
                </span>
              </div>
            )}
            {selectedCourse && (
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-3 w-3 text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">ថ្នាក់:</span>
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {filteredCourses.find(c => c.courseId.toString() === selectedCourse) && 
                   `${getGradeLabel(filteredCourses.find(c => c.courseId.toString() === selectedCourse)!.grade)} - ${filteredCourses.find(c => c.courseId.toString() === selectedCourse)!.section}`
                  }
                </span>
              </div>
            )}
            {selectedStatus && (
              <div className="flex items-center space-x-2">
                <UserCheck className="h-3 w-3 text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">ស្ថានភាព:</span>
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {selectedStatus === 'PRESENT' && 'មានវត្តមាន'}
                  {selectedStatus === 'ABSENT' && 'អវត្តមាន'}
                  {selectedStatus === 'LATE' && 'មកយឺត'}
                  {selectedStatus === 'EXCUSED' && 'មានអធិការដើម្បី'}
                </span>
              </div>
            )}
          </div>
          {!selectedDate && !selectedSchoolYear && !selectedCourse && !selectedStatus && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              សូមជ្រើសរើសជម្រើសច្រោះដើម្បីមើលវត្តមាន
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              សកម្មភាពរហ័ស (Quick Actions)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-green-300 text-green-700 dark:text-green-300">
              ថ្ងៃនេះ: {new Date().toLocaleDateString('km-KH')}
            </Badge>
            <Badge variant="outline" className="border-blue-300 text-blue-700 dark:text-blue-300">
              ថ្ងៃអាទិត្យ: {new Date().toLocaleDateString('km-KH', { weekday: 'long' })}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
