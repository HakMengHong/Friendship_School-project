'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Trash2, 
  Search,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  GraduationCap,
  Grid3X3,
  List,
  MoreHorizontal,
  Clock,
  Edit,
  Save,
  Users,
  BookOpen,
  Calendar,
  Hash
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Course {
  courseId: number
  schoolYearId: number
  teacherId1?: number
  teacherId2?: number
  teacherId3?: number
  grade: string
  section: string
  courseName: string
  createdAt: string
  updatedAt?: string
}

interface SchoolYear {
  schoolYearId: number
  schoolYearCode: string
  createdAt: string
}

interface Teacher {
  userid: number
  username: string
  firstname: string
  lastname: string
  role: string
  position?: string
}

interface CourseManagerProps {
  courses: Course[]
  schoolYears: SchoolYear[]
  teachers: Teacher[]
  showCourseForm: boolean
  newCourse: {
    schoolYearId: string
    grade: string
    section: string
    courseName: string
    teacherId1: string
    teacherId2: string
    teacherId3: string
  }
  submitting: boolean
  errors: Record<string, string>
  onSetShowCourseForm: (show: boolean) => void
  onSetNewCourse: (course: any) => void
  onSetErrors: (errors: Record<string, string>) => void
  onAddCourse: () => void
  onDeleteCourse?: (courseId: number) => void
}

export function CourseManager({
  courses,
  schoolYears,
  teachers,
  showCourseForm,
  newCourse,
  submitting,
  errors,
  onSetShowCourseForm,
  onSetNewCourse,
  onSetErrors,
  onAddCourse,
  onDeleteCourse
}: CourseManagerProps) {
  const getTeacherName = (teacherId: number | undefined) => {
    if (!teacherId) return 'មិនមាន'
    const teacher = teachers.find(t => t.userid === teacherId)
    return teacher ? `${teacher.firstname} ${teacher.lastname}` : 'មិនដឹង'
  }

  const getSchoolYearName = (schoolYearId: number) => {
    const year = schoolYears.find(y => y.schoolYearId === schoolYearId)
    return year ? year.schoolYearCode : 'មិនដឹង'
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">ថ្នាក់រៀន</h2>
              <div className="flex items-center space-x-3 mt-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {courses.length} ថ្នាក់រៀន
                </Badge>
                <div className="h-1 w-8 bg-white/30 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => onSetShowCourseForm(!showCourseForm)}
            className="group px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            variant="ghost"
          >
            <div className="flex items-center gap-2">
              {showCourseForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              <span>{showCourseForm ? 'បោះបង់' : 'បន្ថែមថ្នាក់រៀន'}</span>
            </div>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {showCourseForm && (
          <div className="mb-6 border-2 border-dashed border-purple-300 rounded-xl p-6 bg-gradient-to-br from-purple-50 to-pink-100/50 dark:from-purple-950/30 dark:to-pink-900/30 shadow-inner">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                បន្ថែមថ្នាក់រៀនថ្មី
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* School Year Selection */}
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  ឆ្នាំសិក្សា
                </label>
                <Select
                  value={newCourse.schoolYearId}
                  onValueChange={(value) => {
                    onSetNewCourse({...newCourse, schoolYearId: value})
                    if (errors.schoolYearId) onSetErrors({ ...errors, schoolYearId: '' })
                  }}
                >
                  <SelectTrigger className={`h-12 text-lg ${errors.schoolYearId ? 'border-red-500 ring-red-200' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-200'}`}>
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
                {errors.schoolYearId && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/50 p-2 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    {errors.schoolYearId}
                  </p>
                )}
              </div>

              {/* Grade Selection */}
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  ថ្នាក់
                </label>
                <Select
                  value={newCourse.grade}
                  onValueChange={(value) => {
                    onSetNewCourse({...newCourse, grade: value})
                    if (errors.grade) onSetErrors({ ...errors, grade: '' })
                  }}
                >
                  <SelectTrigger className={`h-12 text-lg ${errors.grade ? 'border-red-500 ring-red-200' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-200'}`}>
                    <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 12}, (_, i) => i + 1).map((grade) => (
                      <SelectItem key={grade} value={grade.toString()}>
                        ថ្នាក់ទី {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.grade && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/50 p-2 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    {errors.grade}
                  </p>
                )}
              </div>

              {/* Section */}
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  ផ្នែក
                </label>
                <Input
                  value={newCourse.section}
                  onChange={(e) => {
                    onSetNewCourse({...newCourse, section: e.target.value})
                    if (errors.section) onSetErrors({ ...errors, section: '' })
                  }}
                  placeholder="ឧ. A, B, C"
                  className={`h-12 text-lg ${errors.section ? 'border-red-500 ring-red-200' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-200'}`}
                />
                {errors.section && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/50 p-2 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    {errors.section}
                  </p>
                )}
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  ឈ្មោះថ្នាក់
                </label>
                <Input
                  value={newCourse.courseName}
                  onChange={(e) => {
                    onSetNewCourse({...newCourse, courseName: e.target.value})
                    if (errors.courseName) onSetErrors({ ...errors, courseName: '' })
                  }}
                  placeholder="ឧ. ថ្នាក់ទី១២A"
                  className={`h-12 text-lg ${errors.courseName ? 'border-red-500 ring-red-200' : 'border-purple-200 focus:border-purple-500 focus:ring-purple-200'}`}
                />
                {errors.courseName && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/50 p-2 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    {errors.courseName}
                  </p>
                )}
              </div>

              {/* Teacher 1 */}
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  គ្រូទី១
                </label>
                <Select
                  value={newCourse.teacherId1}
                  onValueChange={(value) => {
                    onSetNewCourse({...newCourse, teacherId1: value})
                  }}
                >
                  <SelectTrigger className="h-12 text-lg border-purple-200 focus:border-purple-500 focus:ring-purple-200">
                    <SelectValue placeholder="ជ្រើសរើសគ្រូទី១" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">មិនមាន</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.userid} value={teacher.userid.toString()}>
                        {teacher.firstname} {teacher.lastname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Teacher 2 */}
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  គ្រូទី២
                </label>
                <Select
                  value={newCourse.teacherId2}
                  onValueChange={(value) => {
                    onSetNewCourse({...newCourse, teacherId2: value})
                  }}
                >
                  <SelectTrigger className="h-12 text-lg border-purple-200 focus:border-purple-500 focus:ring-purple-200">
                    <SelectValue placeholder="ជ្រើសរើសគ្រូទី២" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">មិនមាន</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.userid} value={teacher.userid.toString()}>
                        {teacher.firstname} {teacher.lastname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Teacher 3 */}
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  គ្រូទី៣
                </label>
                <Select
                  value={newCourse.teacherId3}
                  onValueChange={(value) => {
                    onSetNewCourse({...newCourse, teacherId3: value})
                  }}
                >
                  <SelectTrigger className="h-12 text-lg border-purple-200 focus:border-purple-500 focus:ring-purple-200">
                    <SelectValue placeholder="ជ្រើសរើសគ្រូទី៣" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">មិនមាន</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.userid} value={teacher.userid.toString()}>
                        {teacher.firstname} {teacher.lastname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  onSetShowCourseForm(false)
                  onSetErrors({})
                  onSetNewCourse({
                    schoolYearId: '',
                    grade: '',
                    section: '',
                    courseName: '',
                    teacherId1: '',
                    teacherId2: '',
                    teacherId3: ''
                  })
                }}
                className="px-6 py-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4 mr-2" />
                បោះបង់
              </Button>
              <Button 
                onClick={onAddCourse} 
                disabled={submitting}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {submitting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                បន្ថែមថ្នាក់រៀន
              </Button>
            </div>
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <Plus className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                គ្មានថ្នាក់រៀនទេ
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                ចុចប៊ូតុង "បន្ថែមថ្នាក់រៀន" ដើម្បីចាប់ផ្តើមបង្កើតថ្នាក់រៀនថ្មី
              </p>
              
              <Button
                onClick={() => onSetShowCourseForm(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                បន្ថែមថ្នាក់រៀនថ្មី
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Courses Display Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    ថ្នាក់រៀន
                  </h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    សរុប {courses.length} ថ្នាក់រៀន
                  </p>
                </div>
              </div>
            </div>
            
            {/* Courses Display - Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {courses.map((course) => (
                <div key={course.courseId} className="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Top Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      ថ្នាក់រៀន
                    </Badge>
                  </div>

                  {/* Course Header */}
                  <div className="relative z-10 mb-4 pr-20">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                        {course.courseName}
                      </h3>
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="relative z-10 space-y-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-purple-700 dark:text-purple-300 text-sm font-medium">
                            ឆ្នាំសិក្សា
                          </span>
                          <span className="text-purple-800 dark:text-purple-200 text-sm font-semibold">
                            {getSchoolYearName(course.schoolYearId)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-700 dark:text-purple-300 text-sm font-medium">
                            ថ្នាក់
                          </span>
                          <span className="text-purple-800 dark:text-purple-200 text-sm font-semibold">
                            ថ្នាក់ទី {course.grade}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-700 dark:text-purple-300 text-sm font-medium">
                            ផ្នែក
                          </span>
                          <span className="text-purple-800 dark:text-purple-200 text-sm font-semibold">
                            {course.section}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-700 dark:text-purple-300 text-sm font-medium">
                            គ្រូទី១
                          </span>
                          <span className="text-purple-800 dark:text-purple-200 text-sm font-semibold">
                            {getTeacherName(course.teacherId1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Footer */}
                  <div className="relative z-10 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        បង្កើត: {new Date(course.createdAt).toLocaleDateString('km-KH')}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                    {onDeleteCourse && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteCourse(course.courseId)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/20 shadow-lg"
                        disabled={submitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
