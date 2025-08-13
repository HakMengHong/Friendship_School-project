'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  AlertTriangle
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
      const response = await fetch('/api/admin/school-years')
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
      const response = await fetch('/api/admin/courses')
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
      const response = await fetch('/api/admin/enrollments')
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
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        // Handle the nested structure where users are in data.users
        const users = data.users || data
        const teacherUsers = users.filter((user: any) => user.role === 'teacher')
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
      const response = await fetch(`/api/admin/enrollments?enrollmentId=${enrollment.enrollmentId}`, {
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
    return course.courseName || `ថ្នាក់ទី ${course.grade}${course.section}`
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
      <div className="container mx-auto p-6">
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            មើលថ្នាក់រៀន
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            មើលព័ត៌មានថ្នាក់រៀន និងសិស្សដែលបានចុះឈ្មោះ
          </p>
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>{showFilters ? 'លាក់ការច្រោះ' : 'បង្ហាញការច្រោះ'}</span>
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Loading State */}
      {dataLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-blue-800 font-medium">
            កំពុងទាញយកទិន្នន័យ...
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Filters and Course Selection */}
        <div className="lg:col-span-1 space-y-6">
          {/* Filters */}
          {showFilters && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>ការច្រោះ</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="schoolYear">ឆ្នាំសិក្សា</Label>
                  <Select value={selectedSchoolYear} onValueChange={handleSchoolYearChange}>
                    <SelectTrigger>
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
                  <Label htmlFor="course">ថ្នាក់រៀន</Label>
                  <Select value={selectedCourse} onValueChange={handleCourseChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើសថ្នាក់រៀន" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ទាំងអស់</SelectItem>
                      {filteredCourses.map((course) => (
                        <SelectItem key={course.courseId} value={course.courseId.toString()}>
                          {course.courseName || `ថ្នាក់ទី ${course.grade}${course.section}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="search">ស្វែងរកសិស្ស</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="ឈ្មោះសិស្ស..."
                      value={searchTerm}
                      onChange={(e) => handleStudentSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Auto-show indicator */}
                {shouldShowStudents && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-green-800">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        សិស្សនឹងបង្ហាញដោយស្វ័យប្រវត្តិ
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
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
                      className="text-sm"
                    >
                      លុបការច្រោះទាំងអស់
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Course Information */}
          {selectedCourse && selectedCourse !== 'all' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>ព័ត៌មានថ្នាក់រៀន</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">ឈ្មោះថ្នាក់:</span>
                    <div className="text-gray-600 dark:text-gray-400">
                      {getSelectedCourseDetails()?.courseName || 'មិនដឹង'}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">ថ្នាក់:</span>
                    <div className="text-gray-600 dark:text-gray-400">
                      ថ្នាក់ទី {getSelectedCourseDetails()?.grade}{getSelectedCourseDetails()?.section}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">ឆ្នាំសិក្សា:</span>
                    <div className="text-gray-600 dark:text-gray-400">
                      {getSelectedCourseDetails()?.schoolYear.schoolYearCode}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">អ្នកគ្រូ:</span>
                    <div className="text-gray-600 dark:text-gray-400 space-y-1">
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
          )}

          {/* Summary Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>ស្ថិតិ</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">ថ្នាក់រៀនសរុប:</span>
                <span className="font-medium">{filteredCourses.length}</span>
              </div>
              {shouldShowStudents ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm">សិស្សដែលបានចុះឈ្មោះ:</span>
                    <span className="font-medium">{filteredEnrollments.length}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm">សិស្សក្នុងថ្នាក់នេះ:</span>
                      <span className="font-medium text-blue-600">
                        {filteredEnrollments.filter(e => e.courseId === parseInt(selectedCourse)).length}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">
                    ជ្រើសរើសឆ្នាំសិក្សា និងថ្នាក់រៀនដើម្បីមើលស្ថិតិសិស្ស
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Student List */}
        <div className="lg:col-span-3 space-y-6">
          {/* Student List Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>បញ្ជីសិស្ស</span>
                  {shouldShowStudents && (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      បង្ហាញដោយស្វ័យប្រវត្តិ
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {shouldShowStudents && (
                    <Badge variant="secondary">
                      សរុប: {filteredStudentsBySearch.length}
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Only show students when both filters are selected */}
              {!shouldShowStudents ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">សូមជ្រើសរើសថ្នាក់រៀន និងឆ្នាំសិក្សា</p>
                  <p className="text-sm">
                    សិស្សនឹងបង្ហាញដោយស្វ័យប្រវត្តិ នៅពេលអ្នកជ្រើសរើសឆ្នាំសិក្សា និងថ្នាក់រៀន
                  </p>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>ជំហាន:</strong>
                    </p>
                    <ol className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 text-left max-w-xs mx-auto">
                      <li>1. ជ្រើសរើសឆ្នាំសិក្សា</li>
                      <li>2. ជ្រើសរើសថ្នាក់រៀន</li>
                      <li>3. សិស្សនឹងបង្ហាញដោយស្វ័យប្រវត្តិ</li>
                    </ol>
                  </div>
                </div>
              ) : filteredStudentsBySearch.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">មិនមានសិស្ស</p>
                  <p className="text-sm">
                    {searchTerm 
                      ? 'មិនរកឃើញសិស្សដែលត្រូវនឹងការស្វែងរក'
                      : 'មិនមានសិស្សដែលបានចុះឈ្មោះក្នុងថ្នាក់នេះ'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredStudentsBySearch.map((enrollment) => {
                    const student = enrollment.student
                    return (
                      <div
                        key={enrollment.enrollmentId}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            {student.photo ? (
                              <img 
                                src={student.photo} 
                                alt={`${student.firstName} ${student.lastName}`}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-medium text-blue-600 dark:text-blue-300">
                                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-lg text-gray-900 dark:text-white">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                              <div>ថ្នាក់ទី {student.class} • {student.gender === 'male' ? 'ប្រុស' : student.gender === 'female' ? 'ស្រី' : student.gender}</div>
                              <div>ឆ្នាំសិក្សា: {student.schoolYear} • ថ្ងៃចុះឈ្មោះ: {new Date(enrollment.enrollmentDate).toLocaleDateString('km-KH')}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            <UserCheck className="h-3 w-3 mr-1" />
                            បានចុះឈ្មោះ
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveStudent(enrollment)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
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

      {/* Remove Student Confirmation Dialog */}
      {showRemoveConfirm && removingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  បញ្ជាក់ការដកសិស្ស
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  តើអ្នកប្រាកដជាចង់ដកសិស្សនេះចេញពីថ្នាក់រៀនមែនទេ?
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <div className="font-medium text-gray-900 dark:text-white">
                {removingStudent.student.firstName} {removingStudent.student.lastName}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
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
                className="flex-1"
                disabled={loading}
              >
                បោះបង់
              </Button>
              <Button
                variant="destructive"
                onClick={() => removeStudentFromCourse(removingStudent)}
                className="flex-1"
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
