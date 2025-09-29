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
  firstname: string
  lastname: string
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
        
        console.log('Teachers loaded:', {
          totalUsers: users.length,
          teachers: teacherUsers.length,
          teacherData: teacherUsers.map((t: any) => ({ 
            userId: t.userId, 
            firstname: t.firstname, 
            lastname: t.lastname,
            role: t.role 
          }))
        })
        
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
    
    // Convert to number if it's a string
    const numericTeacherId = typeof teacherId === 'string' ? parseInt(teacherId) : teacherId
    const teacher = teachers.find(t => t.userId === numericTeacherId)
    
    // Debug logging for all teacher lookups
    console.log(`Teacher ${teacherId} (${typeof teacherId}) lookup:`, {
      teacherId,
      numericTeacherId,
      teachersCount: teachers.length,
      allTeacherIds: teachers.map(t => ({ userId: t.userId, type: typeof t.userId })),
      foundTeacher: teacher,
      teacherName: teacher ? `${teacher.firstname} ${teacher.lastname}` : 'NOT FOUND'
    })
    
    return teacher ? `${teacher.firstname} ${teacher.lastname}` : 'មិនដឹង'
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
    const course = courses.find(c => c.courseId === parseInt(selectedCourse))
    
    // Debug logging
    if (course) {
      console.log('Selected course debug:', {
        courseId: course.courseId,
        courseName: course.courseName,
        teacherId1: course.teacherId1,
        teacherId1Type: typeof course.teacherId1,
        teacherId2: course.teacherId2,
        teacherId2Type: typeof course.teacherId2,
        teacherId3: course.teacherId3,
        teacherId3Type: typeof course.teacherId3,
        teachersLoaded: teachers.length,
        availableTeacherIds: teachers.map(t => ({ userId: t.userId, type: typeof t.userId }))
      })
    }
    
    return course
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
    <div className="min-h-screen animate-fade-in">
      <div className="animate-fade-in">
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_7fr] gap-8">
            {/* Left Column - Filters and Course Selection (30%) */}
            <div className="space-y-6">
              {/* Modern Filters */}
              {showFilters && (
                <div className="relative group">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-blue-50/30 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-blue-950/20 rounded-3xl -z-10" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]" />
                  
                  <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 group-hover:scale-[1.02]">
                    {/* Modern Header */}
                    <CardHeader className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white p-4">
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
                      
                      <div className="relative z-10 flex items-center space-x-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                          <Filter className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">ការជ្រើសរើស</h2>
                          <div className="flex items-center space-x-4 mt-3">
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                              ឆ្នាំសិក្សា • ថ្នាក់
                            </Badge>
                          </div>
                          <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-6">
                      {/* Modern Search and Filter Section */}
                      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/30 dark:border-blue-700/30 rounded-xl">
                        <div className="space-y-6">
                          <div>
                            <Label htmlFor="schoolYear" className="block text-base font-semibold mb-3 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              ឆ្នាំសិក្សា
                            </Label>
                            <Select value={selectedSchoolYear} onValueChange={handleSchoolYearChange}>
                              <SelectTrigger className="h-12 text-base border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-200 bg-white dark:bg-gray-800 rounded-xl">
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
                            <Label htmlFor="course" className="block text-base font-semibold mb-3 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              ថ្នាក់រៀន
                            </Label>
                            <Select value={selectedCourse} onValueChange={handleCourseChange}>
                              <SelectTrigger className="h-12 text-base border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-200 bg-white dark:bg-gray-800 rounded-xl">
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
                            <Label htmlFor="search" className="block text-base font-semibold mb-3 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                              <Search className="h-4 w-4" />
                              ស្វែងរកសិស្ស
                            </Label>
                            <div className="relative">
                              <Input
                                id="search"
                                placeholder="ឈ្មោះសិស្ស..."
                                value={searchTerm}
                                onChange={(e) => handleStudentSearch(e.target.value)}
                                className="h-12 text-base border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-200 bg-white dark:bg-gray-800 rounded-xl pl-4 pr-12"
                              />
                              {searchTerm && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStudentSearch('')}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                  ✕
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Auto-show indicator */}
                        {shouldShowStudents && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-xl shadow-sm">
                            <div className="flex items-center space-x-3 text-green-800 dark:text-green-200">
                              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Users className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="text-base font-semibold">
                                  សិស្សនឹងបង្ហាញដោយស្វ័យប្រវត្តិ
                                </div>
                                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                  បានជ្រើសរើសឆ្នាំសិក្សា និងថ្នាក់រៀនរួចហើយ
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Clear Filters Button */}
                        {(selectedSchoolYear || (selectedCourse && selectedCourse !== 'all') || searchTerm) && (
                          <div className="flex justify-end mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearAllFilters}
                              className="text-base px-4 py-2 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
                            >
                              លុបការជ្រើសរើសទាំងអស់
                            </Button>
                        </div>
                      )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}


              {/* Enhanced Summary Statistics */}
              <div className="relative group">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-emerald-50/20 to-green-50/30 dark:from-green-950/20 dark:via-emerald-950/15 dark:to-green-950/20 rounded-3xl -z-10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.05),transparent_50%)]" />
                
                <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 group-hover:scale-[1.02]">
                  {/* Enhanced Header */}
                  <CardHeader className="relative overflow-hidden bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white p-4">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
                    
                    <div className="relative z-10 flex items-center space-x-4">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">ស្ថិតិ</h2>
                        <div className="flex items-center space-x-4 mt-3">
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                            ព័ត៌មានទូទៅ
                          </Badge>
                        </div>
                        <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-xl">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                              <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-base font-medium text-green-800 dark:text-green-200">ថ្នាក់រៀនសរុប</span>
                          </div>
                          <span className="text-2xl font-bold text-green-600 dark:text-green-400">{filteredCourses.length}</span>
                        </div>
                      </div>
                      
                      {shouldShowStudents ? (
                        <>
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-base font-medium text-blue-800 dark:text-blue-200">សិស្សដែលបានចុះឈ្មោះ</span>
                              </div>
                              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredEnrollments.length}</span>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-xl">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                                  <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="text-base font-medium text-purple-800 dark:text-purple-200">សិស្សក្នុងថ្នាក់នេះ</span>
                              </div>
                              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {filteredEnrollments.filter(e => e.courseId === parseInt(selectedCourse)).length}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                            <GraduationCap className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                          </div>
                          <p className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">ជ្រើសរើសឆ្នាំសិក្សា និងថ្នាក់រៀន</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ស្ថិតិសិស្សនឹងបង្ហាញនៅទីនេះ
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column - Student List (70%) */}
            <div className="space-y-8">
              {/* Modern Student List Header */}
              <div className="relative group">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-blue-50/20 to-indigo-50/30 dark:from-indigo-950/20 dark:via-blue-950/15 dark:to-indigo-950/20 rounded-3xl -z-10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.05),transparent_50%)]" />
                
                <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 group-hover:scale-[1.02]">
                  {/* Modern Header */}
                  <CardHeader className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-600 text-white p-4">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
                    
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">បញ្ជីសិស្ស</h2>
                          <div className="flex items-center space-x-4 mt-3">
                            {shouldShowStudents && (
                              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                                បង្ហាញដោយស្វ័យប្រវត្តិ
                              </Badge>
                            )}
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                              សរុប: {filteredStudentsBySearch.length}
                            </Badge>
                          </div>
                          <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
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
                      <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 dark:scrollbar-thumb-indigo-600 scrollbar-track-transparent hover:scrollbar-thumb-indigo-400 dark:hover:scrollbar-thumb-indigo-500 px-2 py-2">
                        {filteredStudentsBySearch.map((enrollment, index) => {
                          const student = enrollment.student
                          return (
                            <div
                              key={enrollment.enrollmentId}
                              className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-2 border-indigo-200 dark:border-indigo-800 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                            >
                              {/* Background Pattern */}
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/10 dark:to-blue-900/10" />
                              
                              <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  {/* Student Number Badge */}
                                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    {index + 1}
                                  </div>
                                  
                                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-200 dark:from-indigo-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm">
                                    {student.photo ? (
                                      <img 
                                        src={student.photo} 
                                        alt={`${student.firstName} ${student.lastName}`}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700"
                                      />
                                    ) : (
                                      <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">
                                        {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors duration-300">
                                      {student.firstName} {student.lastName}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium space-y-1">
                                      <div>ថ្នាក់ទី {student.class} • {student.gender === 'male' ? 'ប្រុស' : student.gender === 'female' ? 'ស្រី' : student.gender}</div>
                                      <div>ឆ្នាំសិក្សា: {student.schoolYear} • ថ្ងៃចុះឈ្មោះ: {new Date(enrollment.enrollmentDate).toLocaleDateString('km-KH')}</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/50 shadow-sm px-3 py-1">
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    បានចុះឈ្មោះ
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveStudent(enrollment)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300 shadow-sm rounded-xl group-hover:scale-105"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    ដកចេញ
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Modern Course Information - Moved below Student List */}
              {selectedCourse && selectedCourse !== 'all' && (
                <div className="relative group">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-purple-50/30 dark:from-purple-950/20 dark:via-pink-950/15 dark:to-purple-950/20 rounded-3xl -z-10" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.05),transparent_50%)]" />
                  
                  <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 group-hover:scale-[1.02]">
                    {/* Modern Header */}
                    <CardHeader className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 text-white p-4">
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
                      
                      <div className="relative z-10 flex items-center space-x-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">ព័ត៌មានថ្នាក់រៀន</h2>
                          <div className="flex items-center space-x-4 mt-3">
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                              ថ្នាក់ទី {getSelectedCourseDetails()?.grade}{getSelectedCourseDetails()?.section}
                            </Badge>
                          </div>
                          <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-xl">
                          <div className="text-base font-semibold text-purple-800 dark:text-purple-200 mb-2">
                            ថ្នាក់ទី {getSelectedCourseDetails()?.grade}{getSelectedCourseDetails()?.section}
                          </div>
                          <div className="text-purple-700 dark:text-purple-300">
                            ឆ្នាំសិក្សា {getSelectedCourseDetails()?.schoolYear.schoolYearCode}
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-xl">
                          <div className="text-base font-semibold text-purple-800 dark:text-purple-200 mb-3">
                            គ្រូគ្រប់គ្រង់ថ្នាក់
                          </div>
                          <div className="space-y-2">
                            {(() => {
                              const courseDetails = getSelectedCourseDetails()
                              const teacherList = []
                              
                              // Only proceed if teachers are loaded
                              if (teachers.length === 0) {
                                return (
                                  <div className="text-purple-600 dark:text-purple-400 italic">
                                    កំពុងផ្ទុកទិន្នន័យ...
                                  </div>
                                )
                              }
                              
                              if (courseDetails?.teacherId1) {
                                teacherList.push({
                                  id: courseDetails.teacherId1,
                                  name: getTeacherName(courseDetails.teacherId1),
                                  role: 'គ្រូចម្បង'
                                })
                              }
                              if (courseDetails?.teacherId2) {
                                teacherList.push({
                                  id: courseDetails.teacherId2,
                                  name: getTeacherName(courseDetails.teacherId2),
                                  role: 'គ្រូជំនួយ'
                                })
                              }
                              if (courseDetails?.teacherId3) {
                                teacherList.push({
                                  id: courseDetails.teacherId3,
                                  name: getTeacherName(courseDetails.teacherId3),
                                  role: 'គ្រូជំនួយ'
                                })
                              }
                              
                              if (teacherList.length === 0) {
                                return (
                                  <div className="text-purple-600 dark:text-purple-400 italic">
                                    មិនទាន់ចាត់តាំង
                                  </div>
                                )
                              }
                              
                              return teacherList.map((teacher, index) => (
                                <div key={teacher.id} className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
                                  <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-purple-500' : 'bg-purple-400'}`}></div>
                                  <span className="font-medium">{teacher.name}</span>
                                  {index === 0 && (
                                    <Badge variant="outline" className="ml-2 text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                                      {teacher.role}
                                    </Badge>
                                  )}
                                </div>
                              ))
                            })()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Remove Student Confirmation Dialog */}
      {showRemoveConfirm && removingStudent && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white via-red-50/30 to-orange-50/20 dark:from-gray-900 dark:via-red-950/20 dark:to-orange-950/20 backdrop-blur-xl border-0 shadow-2xl rounded-2xl p-8 max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  បញ្ជាក់ការដកសិស្ស
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                  តើអ្នកប្រាកដជាចង់ដកសិស្សនេះចេញពីថ្នាក់រៀនមែនទេ?
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <div className="font-bold text-lg text-gray-900 dark:text-white">
                {removingStudent.student.firstName} {removingStudent.student.lastName}
              </div>
              <div className="text-base text-gray-600 dark:text-gray-400 mt-1">
                ថ្នាក់ទី {removingStudent.student.class} • {removingStudent.student.schoolYear}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRemoveConfirm(false)
                  setRemovingStudent(null)
                }}
                className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                disabled={loading}
              >
                បោះបង់
              </Button>
              <Button
                variant="destructive"
                onClick={() => removeStudentFromCourse(removingStudent)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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

