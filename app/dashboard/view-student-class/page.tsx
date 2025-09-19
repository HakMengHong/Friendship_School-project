'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleGuard } from "@/components/ui/role-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  BookOpen, 
  GraduationCap,
  Search,
  Filter,
  Eye,
  UserCheck,
  UserX,
  Calendar,
  School,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Trash2,
  AlertTriangle,
  UserPlus,
  ArrowLeft
} from "lucide-react"
import { toast } from "sonner"

interface Student {
  studentId: number
  firstName: string
  lastName: string
  gender: string
  dob: string
  class: string
  phone?: string
  status: string
  schoolYear: string
  photo?: string
  registrationDate?: string
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

interface SchoolYear {
  schoolYearId: number
  schoolYearCode: string
}

interface Enrollment {
  enrollmentId: number
  studentId: number
  courseId: number
  enrollmentDate: string
  drop: boolean
  dropDate?: string
  student: Student
  course: Course
}

interface Teacher {
  userId: number
  firstName: string
  lastName: string
}

export default function ViewStudentClassPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <ViewStudentClassContent />
    </RoleGuard>
  )
}

function ViewStudentClassContent() {
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  
  // Filter states
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('')
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(true)

  // Remove student states
  const [removingStudent, setRemovingStudent] = useState<Enrollment | null>(null)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  // Auto-show students when both filters are selected
  const [autoShowStudents, setAutoShowStudents] = useState(false)

  // Fetch all data function
  const fetchAllData = async () => {
    setDataLoading(true)
    setError(null)
    try {
      await Promise.all([
        fetchSchoolYears(),
        fetchCourses(),
        fetchStudents(),
        fetchEnrollments(),
        fetchTeachers()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('មានបញ្ហាក្នុងការទាញយកទិន្នន័យ')
    } finally {
      setDataLoading(false)
    }
  }

  // Fetch school years
  const fetchSchoolYears = async () => {
    try {
              const response = await fetch('/api/school-years')
      if (response.ok) {
        const data = await response.json()
        setSchoolYears(data)
        // Remove automatic selection - let user choose manually
        // if (data.length > 0 && !selectedSchoolYear) {
        //   setSelectedSchoolYear(data[0].schoolYearCode)
        // }
      }
    } catch (error) {
      console.error('Error fetching school years:', error)
    }
  }

  // Fetch courses
  const fetchCourses = async () => {
    try {
              const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  // Fetch students
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  // Fetch enrollments
  const fetchEnrollments = async () => {
    try {
              const response = await fetch('/api/enrollments')
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data)
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    }
  }

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
              const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        // Handle the nested structure where users are in data.users
        const users = data.users || data
        const teacherUsers = users.filter((user: { role: string }) => user.role === 'teacher')
        setTeachers(teacherUsers)
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  // Remove student from course
  const removeStudentFromCourse = async (enrollment: Enrollment) => {
    setLoading(true)
    try {
              const response = await fetch(`/api/enrollments?enrollmentId=${enrollment.enrollmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        
        // Remove from local state
        setEnrollments(prev => prev.filter(e => e.enrollmentId !== enrollment.enrollmentId))
        
        toast.success(`បានដក ${enrollment.student.firstName} ${enrollment.student.lastName} ចេញពីថ្នាក់រៀនដោយជោគជ័យ`)
        
        // Close confirmation dialog
        setShowRemoveConfirm(false)
        setRemovingStudent(null)
      } else {
        const errorData = await response.json()
        toast.error(`មានបញ្ហា: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error removing student:', error)
      toast.error('មានបញ្ហាក្នុងការដកសិស្សចេញពីថ្នាក់រៀន')
    } finally {
      setLoading(false)
    }
  }

  // Handle remove student confirmation
  const handleRemoveStudent = (enrollment: Enrollment) => {
    setRemovingStudent(enrollment)
    setShowRemoveConfirm(true)
  }

  // Get teacher name by ID
  const getTeacherName = (teacherId?: number) => {
    if (!teacherId) return 'មិនទាន់ចាត់តាំង'
    const teacher = teachers.find(t => t.userId === teacherId)
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'មិនដឹង'
  }

  // Filter courses based on selected school year
  const filteredCourses = courses.filter(course => 
    !selectedSchoolYear || course.schoolYear.schoolYearCode === selectedSchoolYear
  )

  // Filter enrollments based on selected course
  const filteredEnrollments = enrollments.filter(enrollment => {
    if (!selectedCourse || selectedCourse === 'all') return true
    return enrollment.courseId === parseInt(selectedCourse) && !enrollment.drop
  })

  // Get course name
  const getCourseName = (courseId: number) => {
    const course = courses.find(c => c.courseId === courseId)
    if (!course) return 'មិនដឹង'
    return `ថ្នាក់ទី ${course.grade}${course.section}`
  }

  // Get selected course details
  const getSelectedCourseDetails = () => {
    if (!selectedCourse || selectedCourse === 'all') return null
    return courses.find(c => c.courseId === parseInt(selectedCourse))
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedSchoolYear('')
    setSelectedCourse('all')
    setSearchTerm('')
    setAutoShowStudents(false)
  }

  // Handle student search
  const handleStudentSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm)
  }

  // Filter students by search term
  const filteredStudentsBySearch = filteredEnrollments.filter(enrollment => {
    if (!searchTerm) return true
    const student = enrollment.student
    return student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           student.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Check if we should auto-show students
  const shouldShowStudents = selectedSchoolYear && selectedCourse && selectedCourse !== 'all'

  // Handle school year change
  const handleSchoolYearChange = (value: string) => {
    setSelectedSchoolYear(value)
    setSelectedCourse('all') // Reset course selection when school year changes
    setAutoShowStudents(false)
  }

  // Handle course change
  const handleCourseChange = (value: string) => {
    setSelectedCourse(value)
    // Auto-show students when both school year and course are selected
    if (selectedSchoolYear && value !== 'all') {
      setAutoShowStudents(true)
    } else {
      setAutoShowStudents(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // Auto-show students when both filters are selected
  useEffect(() => {
    if (shouldShowStudents) {
      setAutoShowStudents(true)
    }
  }, [selectedSchoolYear, selectedCourse])

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">មានបញ្ហា:</span>
            <span>{error}</span>
          </div>
          <Button 
            onClick={fetchAllData} 
            variant="outline" 
            className="mt-2"
          >
            ព្យាយាមម្តងទៀត
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="animate-fade-in">
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Filters and Course Selection */}
            <div className="lg:col-span-1 space-y-6">
              {/* Enhanced Filters */}
              {showFilters && (
                <div className="relative">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-indigo-50/20 to-blue-50/20 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-blue-950/10 rounded-3xl -z-10" />
                  
                  <Card className="relative overflow-hidden border border-white/20 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
                    {/* Enhanced Header */}
                    <CardHeader className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white p-2">
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
                      
                      <div className="relative z-10 flex items-center space-x-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                          <Filter className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">ការជ្រើសរើស</h2>
                          <div className="h-1 w-8 bg-white/30 rounded-full mt-2"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-1 space-y-4">
                      <div>
                        <Label htmlFor="schoolYear" className="text-base font-medium text-gray-700 dark:text-gray-300">ឆ្នាំសិក្សា</Label>
                        <Select value={selectedSchoolYear} onValueChange={handleSchoolYearChange}>
                          <SelectTrigger className="h-11 mt-2 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200">
                            <SelectValue placeholder="ជ្រើសរើសឆ្នាំសិក្សា" />
                          </SelectTrigger>
                          <SelectContent>
                            {schoolYears.map((year) => (
                              <SelectItem key={year.schoolYearId} value={year.schoolYearCode}>
                                {year.schoolYearCode}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="course" className="text-base font-medium text-gray-700 dark:text-gray-300">ថ្នាក់រៀន</Label>
                        <Select value={selectedCourse} onValueChange={handleCourseChange}>
                          <SelectTrigger className="h-11 mt-2 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200">
                            <SelectValue placeholder="ជ្រើសរើសថ្នាក់រៀន" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">ទាំងអស់</SelectItem>
                            {filteredCourses.map((course) => (
                              <SelectItem key={course.courseId} value={course.courseId.toString()}>
                                ថ្នាក់ទី {course.grade}{course.section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="search" className="text-base font-medium text-gray-700 dark:text-gray-300">ស្វែងរកសិស្ស</Label>
                        <div className="relative mt-2">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <Input
                            id="search"
                            placeholder="ឈ្មោះសិស្ស..."
                            value={searchTerm}
                            onChange={(e) => handleStudentSearch(e.target.value)}
                            className="pl-10 h-11 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Auto-show indicator */}
                      {shouldShowStudents && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-green-800 dark:text-green-300">
                            <Users className="h-4 w-4" />
                            <span className="text-base font-medium">
                              សិស្សនឹងបង្ហាញដោយស្វ័យប្រវត្តិ
                            </span>
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            បានជ្រើសរើសឆ្នាំសិក្សា និងថ្នាក់រៀនរួចហើយ
                          </p>
                        </div>
                      )}

                      {/* Clear Filters Button */}
                      {(selectedSchoolYear || (selectedCourse && selectedCourse !== 'all') || searchTerm) && (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllFilters}
                            className="text-base"
                          >
                            លុបការជ្រើសរើសទាំងអស់
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Enhanced Course Information */}
              {selectedCourse && selectedCourse !== 'all' && (
                <div className="relative">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-pink-50/20 to-purple-50/20 dark:from-purple-950/10 dark:via-pink-950/10 dark:to-purple-950/10 rounded-3xl -z-10" />
                  
                  <Card className="relative overflow-hidden border border-white/20 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
                    {/* Enhanced Header */}
                    <CardHeader className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 text-white p-2">
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
                      <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
                      
                      <div className="relative z-10 flex items-center space-x-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">ព័ត៌មានថ្នាក់រៀន</h2>
                          <div className="h-1 w-8 bg-white/30 rounded-full mt-2"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-2 space-y-3">
                      <div className="space-y-2">
                        
                        <div className="text-base">
          
                          <div className="text-gray-600 dark:text-gray-400 mt-1">
                            ថ្នាក់ទី {getSelectedCourseDetails()?.grade}{getSelectedCourseDetails()?.section}
                          </div>
                        </div>
                        <div className="text-base">
                          <span className="font-medium text-gray-700 dark:text-gray-300">ឆ្នាំសិក្សា {getSelectedCourseDetails()?.schoolYear.schoolYearCode}</span>

                        </div>
                        <div className="text-base">
                          <span className="font-medium text-gray-700 dark:text-gray-300">គ្រូគ្រប់គ្រង់ថ្នាក់</span>
                          <div className="text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                            {getSelectedCourseDetails()?.teacherId1 && (
                              <div>• {getTeacherName(getSelectedCourseDetails()?.teacherId1)}</div>
                            )}
                            {getSelectedCourseDetails()?.teacherId2 && (
                              <div>• {getTeacherName(getSelectedCourseDetails()?.teacherId2)}</div>
                            )}
                            {getSelectedCourseDetails()?.teacherId3 && (
                              <div>• {getTeacherName(getSelectedCourseDetails()?.teacherId3)}</div>
                            )}
                            {!getSelectedCourseDetails()?.teacherId1 && 
                             !getSelectedCourseDetails()?.teacherId2 && 
                             !getSelectedCourseDetails()?.teacherId3 && (
                              <div>មិនទាន់ចាត់តាំង</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Enhanced Summary Statistics */}
              <div className="relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 via-emerald-50/20 to-green-50/20 dark:from-green-950/10 dark:via-emerald-950/10 dark:to-green-950/10 rounded-3xl -z-10" />
                
                <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500">
                  {/* Enhanced Header */}
                  <CardHeader className="relative overflow-hidden bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white p-2">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                    <div className="absolute bottom-0 left-0 w-10 h-10 bg-white/5 rounded-full translate-y-5 -translate-x-5" />
                    
                    <div className="relative z-10 flex items-center space-x-3">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">ស្ថិតិ</h2>
                        <div className="h-1 w-8 bg-white/30 rounded-full mt-2"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-2 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-base text-gray-700 dark:text-gray-300">ថ្នាក់រៀនសរុប:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{filteredCourses.length}</span>
                    </div>
                    {shouldShowStudents ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-base text-gray-700 dark:text-gray-300">សិស្សដែលបានចុះឈ្មោះ:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{filteredEnrollments.length}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between">
                            <span className="text-base text-gray-700 dark:text-gray-300">សិស្សក្នុងថ្នាក់នេះ:</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                              {filteredEnrollments.filter(e => e.courseId === parseInt(selectedCourse)).length}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <p className="text-base">
                          ជ្រើសរើសឆ្នាំសិក្សា និងថ្នាក់រៀនដើម្បីមើលស្ថិតិសិស្ស
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column - Student List */}
            <div className="lg:col-span-3 space-y-6">
              {/* Enhanced Student List Header */}
              <div className="relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-blue-50/20 to-indigo-50/20 dark:from-indigo-950/10 dark:via-blue-950/10 dark:to-indigo-950/10 rounded-3xl -z-10" />
                
                <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500">
                  {/* Enhanced Header */}
                  <CardHeader className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-600 text-white p-6">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-14 translate-x-14" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10" />
                    
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">បញ្ជីសិស្ស</h2>
                          <div className="flex items-center space-x-3 mt-2">
                            {shouldShowStudents && (
                              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                បង្ហាញដោយស្វ័យប្រវត្តិ
                              </Badge>
                            )}
                            <div className="h-1 w-8 bg-white/30 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      
                      {shouldShowStudents && (
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                            សរុប: {filteredStudentsBySearch.length}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Only show students when both filters are selected */}
                    {!shouldShowStudents ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center">
                          <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">សូមជ្រើសរើសថ្នាក់រៀន និងឆ្នាំសិក្សា</p>
                        <p className="text-base text-gray-600 dark:text-gray-400">
                          សិស្សនឹងបង្ហាញដោយស្វ័យប្រវត្តិ នៅពេលអ្នកជ្រើសរើសឆ្នាំសិក្សា និងថ្នាក់រៀន
                        </p>
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50 shadow-sm">
                          <p className="text-base text-blue-800 dark:text-blue-200 font-medium">
                            ជំហាន:
                          </p>
                          <ol className="text-base text-blue-700 dark:text-blue-300 mt-3 space-y-2 text-left max-w-xs mx-auto">
                            <li className="flex items-center space-x-2">
                              <span className="w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                              <span>ជ្រើសរើសឆ្នាំសិក្សា</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <span className="w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                              <span>ជ្រើសរើសថ្នាក់រៀន</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <span className="w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                              <span>សិស្សនឹងបង្ហាញដោយស្វ័យប្រវត្តិ</span>
                            </li>
                          </ol>
                        </div>
                      </div>
                    ) : filteredStudentsBySearch.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                          <Users className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">មិនមានសិស្ស</p>
                        <p className="text-base text-gray-600 dark:text-gray-400">
                          {searchTerm 
                            ? 'មិនរកឃើញសិស្សដែលត្រូវនឹងការស្វែងរក'
                            : 'មិនមានសិស្សដែលបានចុះឈ្មោះក្នុងថ្នាក់នេះ'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                        {filteredStudentsBySearch.map((enrollment) => {
                          const student = enrollment.student
                          return (
                            <div
                              key={enrollment.enrollmentId}
                              className="group flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                  {student.photo ? (
                                    <img 
                                      src={student.photo} 
                                      alt={`${student.firstName} ${student.lastName}`}
                                      className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700"
                                    />
                                  ) : (
                                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                                      {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-lg text-gray-900 dark:text-white">
                                    {student.firstName} {student.lastName}
                                  </div>
                                  <div className="text-base text-gray-500 dark:text-gray-400 space-y-1">
                                    <div>ថ្នាក់ទី {student.class} • {student.gender === 'male' ? 'ប្រុស' : student.gender === 'female' ? 'ស្រី' : student.gender}</div>
                                    <div>ឆ្នាំសិក្សា: {student.schoolYear} • ថ្ងៃចុះឈ្មោះ: {new Date(enrollment.enrollmentDate).toLocaleDateString('km-KH')}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/50 shadow-sm">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  បានចុះឈ្មោះ
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveStudent(enrollment)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300 shadow-sm"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  ដកចេញ
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Student Confirmation Dialog */}
      {showRemoveConfirm && removingStudent && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  បញ្ជាក់ការដកសិស្ស
                </h3>
                <p className="text-base text-gray-500 dark:text-gray-400">
                  តើអ្នកប្រាកដជាចង់ដកសិស្សនេះចេញពីថ្នាក់រៀនមែនទេ?
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4 border border-gray-200 dark:border-gray-600">
              <div className="font-medium text-gray-900 dark:text-white">
                {removingStudent.student.firstName} {removingStudent.student.lastName}
              </div>
              <div className="text-base text-gray-500 dark:text-gray-400">
                ថ្នាក់ទី {removingStudent.student.class} • {removingStudent.student.schoolYear}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRemoveConfirm(false)
                  setRemovingStudent(null)
                }}
                className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                disabled={loading}
              >
                បោះបង់
              </Button>
              <Button
                variant="destructive"
                onClick={() => removeStudentFromCourse(removingStudent)}
                className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 transition-all duration-200 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>កំពុងដក...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Trash2 className="h-4 w-4" />
                    <span>ដកចេញ</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
