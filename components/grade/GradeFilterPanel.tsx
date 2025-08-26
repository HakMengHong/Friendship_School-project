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
  BookOpen,
  Search,
  RefreshCw,
  TrendingUp,
  Hash
} from "lucide-react"

interface SchoolYear {
  schoolYearId: number
  schoolYearCode: string
}

interface Semester {
  semesterId: number
  semester: string
  semesterCode: string
}

interface Course {
  courseId: number
  courseName: string
  grade: string
  section: string
  schoolYear: SchoolYear
}

interface Subject {
  subjectId: number
  subjectName: string
}

interface GradeFilterPanelProps {
  selectedSchoolYear: string
  selectedSemester: string
  selectedCourse: string
  selectedSubject: string
  selectedMonth: string
  selectedGradeYear: string
  searchTerm: string
  schoolYears: SchoolYear[]
  semesters: Semester[]
  courses: Course[]
  subjects: Subject[]
  months: Array<{ value: string; label: string }>
  gradeYears: Array<{ value: string; label: string }>
  loading: boolean
  onSchoolYearChange: (schoolYearId: string) => void
  onSemesterChange: (semesterId: string) => void
  onCourseChange: (courseId: string) => void
  onSubjectChange: (subjectId: string) => void
  onMonthChange: (month: string) => void
  onGradeYearChange: (year: string) => void
  onSearchChange: (search: string) => void
  getGradeLabel: (grade: string | number) => string
}

export function GradeFilterPanel({
  selectedSchoolYear,
  selectedSemester,
  selectedCourse,
  selectedSubject,
  selectedMonth,
  selectedGradeYear,
  searchTerm,
  schoolYears,
  semesters,
  courses,
  subjects,
  months,
  gradeYears,
  loading,
  onSchoolYearChange,
  onSemesterChange,
  onCourseChange,
  onSubjectChange,
  onMonthChange,
  onGradeYearChange,
  onSearchChange,
  getGradeLabel
}: GradeFilterPanelProps) {
  return (
    <Card className="border-2 border-blue-200 hover:shadow-lg transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Filter className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">ការច្រោះពិន្ទុ</CardTitle>
              <p className="text-blue-100 text-sm">Grade Filter Panel</p>
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
            placeholder="ស្វែងរកសិស្ស..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12 text-lg border-blue-200 focus:border-blue-500 focus:ring-blue-200"
          />
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Semester Filter */}
          <div>
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Calendar className="h-4 w-4" />
              សម្ព័ន្ធ (Semester)
            </Label>
            <Select value={selectedSemester} onValueChange={onSemesterChange}>
              <SelectTrigger className="mt-1 h-12 text-lg border-blue-200 focus:border-blue-500 focus:ring-blue-200">
                <SelectValue placeholder="ជ្រើសរើសសម្ព័ន្ធ" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester.semesterId} value={semester.semesterId.toString()}>
                    {semester.semester}
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
                {courses.map((course) => (
                  <SelectItem key={course.courseId} value={course.courseId.toString()}>
                    {getGradeLabel(course.grade)} - {course.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Filter */}
          <div>
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <BookOpen className="h-4 w-4" />
              មុខវិជ្ជា (Subject)
            </Label>
            <Select value={selectedSubject} onValueChange={onSubjectChange}>
              <SelectTrigger className="mt-1 h-12 text-lg border-blue-200 focus:border-blue-500 focus:ring-blue-200">
                <SelectValue placeholder="ជ្រើសរើសមុខវិជ្ជា" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.subjectId} value={subject.subjectId.toString()}>
                    {subject.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month Filter */}
          <div>
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Calendar className="h-4 w-4" />
              ខែ (Month)
            </Label>
            <Select value={selectedMonth} onValueChange={onMonthChange}>
              <SelectTrigger className="mt-1 h-12 text-lg border-blue-200 focus:border-blue-500 focus:ring-blue-200">
                <SelectValue placeholder="ជ្រើសរើសខែ" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grade Year Filter */}
          <div>
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Hash className="h-4 w-4" />
              ឆ្នាំពិន្ទុ (Grade Year)
            </Label>
            <Select value={selectedGradeYear} onValueChange={onGradeYearChange}>
              <SelectTrigger className="mt-1 h-12 text-lg border-blue-200 focus:border-blue-500 focus:ring-blue-200">
                <SelectValue placeholder="ជ្រើសរើសឆ្នាំ" />
              </SelectTrigger>
              <SelectContent>
                {gradeYears.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
            {selectedSchoolYear && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3 text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">ឆ្នាំសិក្សា:</span>
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {schoolYears.find(y => y.schoolYearId.toString() === selectedSchoolYear)?.schoolYearCode}
                </span>
              </div>
            )}
            {selectedSemester && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3 text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">សម្ព័ន្ធ:</span>
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {semesters.find(s => s.semesterId.toString() === selectedSemester)?.semester}
                </span>
              </div>
            )}
            {selectedCourse && (
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-3 w-3 text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">ថ្នាក់:</span>
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {courses.find(c => c.courseId.toString() === selectedCourse) && 
                   `${getGradeLabel(courses.find(c => c.courseId.toString() === selectedCourse)!.grade)} - ${courses.find(c => c.courseId.toString() === selectedCourse)!.section}`
                  }
                </span>
              </div>
            )}
            {selectedSubject && (
              <div className="flex items-center space-x-2">
                <BookOpen className="h-3 w-3 text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">មុខវិជ្ជា:</span>
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {subjects.find(s => s.subjectId.toString() === selectedSubject)?.subjectName}
                </span>
              </div>
            )}
            {selectedMonth && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3 text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">ខែ:</span>
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {months.find(m => m.value === selectedMonth)?.label}
                </span>
              </div>
            )}
            {selectedGradeYear && (
              <div className="flex items-center space-x-2">
                <Hash className="h-3 w-3 text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">ឆ្នាំពិន្ទុ:</span>
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {selectedGradeYear}
                </span>
              </div>
            )}
          </div>
          {!selectedSchoolYear && !selectedSemester && !selectedCourse && !selectedSubject && !selectedMonth && !selectedGradeYear && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              សូមជ្រើសរើសជម្រើសច្រោះដើម្បីមើលពិន្ទុ
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
