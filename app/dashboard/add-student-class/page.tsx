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
  UserPlus, 
  Users, 
  BookOpen, 
  GraduationCap,
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertCircle
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
  status?: string
  schoolYear?: string
  religion?: string
  health?: string
  emergencyContact?: string
  createdAt?: string
  updatedAt?: string
  photo?: string
  registrationDate?: string
  scholarships?: unknown[]
  attendances?: unknown[]
  family?: unknown[]
  guardians?: unknown[]
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

interface SchoolYear {
  schoolYearId: number
  schoolYearCode: string
}

export default function AddStudentClassPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AddStudentClassContent />
    </RoleGuard>
  )
}

function AddStudentClassContent() {
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [enrollments, setEnrollments] = useState<{
    enrollmentId: number
    courseId: number
    studentId: number
    drop: boolean
    dropSemester?: string
    dropDate?: string
  }[]>([])
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false)

  // Fetch all data function
  const fetchAllData = async () => {
    setDataLoading(true)
    setError(null)
    try {
      await Promise.all([
        fetchSchoolYears(),
        fetchCourses(),
        fetchStudents()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  // Form state for new student
  const [showAddStudentForm, setShowAddStudentForm] = useState(false)
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dob: '',
    class: '',
    phone: '',
    schoolYear: '',
    needsClothes: false,
    needsMaterials: false,
    needsTransport: false,
    previousSchool: '',
    registerToStudy: true,
    studentBirthDistrict: '',
    studentDistrict: '',
    studentHouseNumber: '',
    studentProvince: '',
    studentVillage: '',
    transferReason: '',
    vaccinated: false,
    religion: '',
    health: '',
    emergencyContact: ''
  })

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData()
    fetchEnrollments()
  }, [])

  const fetchSchoolYears = async () => {
    try {
              const response = await fetch('/api/school-years')
      if (response.ok) {
        const data = await response.json()
        setSchoolYears(data)
        if (data.length > 0) {
          setSelectedSchoolYear(data[0].schoolYearCode)
        }
      } else {
        setError('មានបញ្ហាក្នុងការទាញយកឆ្នាំសិក្សា')
      }
    } catch (error) {
      console.error('Error fetching school years:', error)
      setError('មានបញ្ហាក្នុងការទាញយកឆ្នាំសិក្សា')
    }
  }

  const fetchCourses = async () => {
    try {
              const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      } else {
        setError('មានបញ្ហាក្នុងការទាញយកថ្នាក់')
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      setError('មានបញ្ហាក្នុងការទាញយកថ្នាក់')
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data || []) // API returns array directly, not wrapped in students object
      } else {
        setError('មានបញ្ហាក្នុងការទាញយកសិស្ស')
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      setError('មានបញ្ហាក្នុងការទាញយកសិស្ស')
    }
  }

  const fetchEnrollments = async () => {
    try {
      setEnrollmentsLoading(true)
              const response = await fetch('/api/enrollments')
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data || [])
      } else {
        console.error('Error fetching enrollments')
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    } finally {
      setEnrollmentsLoading(false)
    }
  }

  // Check if student is already enrolled in selected course
  const isStudentEnrolled = (studentId: number) => {
    if (!selectedCourse) return false
    return enrollments.some(enrollment => 
      enrollment.studentId === studentId && 
      enrollment.courseId === parseInt(selectedCourse) &&
      !enrollment.drop
    )
  }

  // Filter students based on search term, school year, and class
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSchoolYear = !selectedSchoolYear || student.schoolYear === selectedSchoolYear
    const matchesClass = !selectedClass || selectedClass === 'all' || student.class === selectedClass
    return matchesSearch && matchesSchoolYear && matchesClass
  })

  // Get unique classes from students
  const uniqueClasses = [...new Set(students.map(student => student.class))].sort()

  // Filter courses based on selected school year
  const filteredCourses = courses.filter(course => 
    !selectedSchoolYear || course.schoolYear.schoolYearCode === selectedSchoolYear
  )

  const handleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const clearAllFilters = () => {
    setSelectedSchoolYear('')
    setSelectedClass('all')
    setSearchTerm('')
    setSelectedStudents([])
  }

  const handleAddStudentsToClass = async () => {
    if (selectedStudents.length === 0 || !selectedCourse) {
      toast.error('សូមជ្រើសរើសសិស្ស និងថ្នាក់')
      return
    }

    // Confirm action
    const confirmed = window.confirm(
      `តើអ្នកប្រាកដជាចង់បន្ថែមសិស្ស ${selectedStudents.length} នាក់ទៅក្នុងថ្នាក់ ${getSelectedCourseName()} ឬទេ?`
    )
    
    if (!confirmed) return

    setLoading(true)
    try {
      // Make API call to create enrollments
              const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: selectedCourse,
          studentIds: selectedStudents
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setShowSuccess(true)
        setSelectedStudents([])
        setSelectedCourse('')
        toast.success(`បានបន្ថែមសិស្ស ${selectedStudents.length} នាក់ទៅក្នុងថ្នាក់ដោយជោគជ័យ`)
        
        // Refresh enrollments list
        fetchEnrollments()
        
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        const errorData = await response.json()
        if (errorData.existingStudentIds) {
          toast.error(`សិស្សមួយចំនួនបានចុះឈ្មោះក្នុងថ្នាក់នេះរួចហើយ`)
        } else {
          toast.error(errorData.error || 'មានបញ្ហាក្នុងការបន្ថែមសិស្សទៅក្នុងថ្នាក់')
        }
      }
    } catch (error) {
      console.error('Error adding students to class:', error)
      toast.error('មានបញ្ហាក្នុងការបន្ថែមសិស្សទៅក្នុងថ្នាក់')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNewStudent = async () => {
    // Validate required fields
    if (!newStudent.firstName || !newStudent.firstName.trim()) {
      toast.error('សូមបញ្ចូលឈ្មោះខ្លី')
      return
    }
    
    if (!newStudent.lastName || !newStudent.lastName.trim()) {
      toast.error('សូមបញ្ចូលឈ្មោះពេញ')
      return
    }
    
    if (!newStudent.gender) {
      toast.error('សូមជ្រើសរើសភេទ')
      return
    }
    
    if (!newStudent.dob) {
      toast.error('សូមបញ្ចូលថ្ងៃខែឆ្នាំកំណើត')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent),
      })

      if (response.ok) {
        toast.success('បានបន្ថែមសិស្សថ្មីដោយជោគជ័យ')
        setNewStudent({
          firstName: '',
          lastName: '',
          gender: '',
          dob: '',
          class: '',
          phone: '',
          schoolYear: '',
          needsClothes: false,
          needsMaterials: false,
          needsTransport: false,
          previousSchool: '',
          registerToStudy: true,
          studentBirthDistrict: '',
          studentDistrict: '',
          studentHouseNumber: '',
          studentProvince: '',
          studentVillage: '',
          transferReason: '',
          vaccinated: false,
          religion: '',
          health: '',
          emergencyContact: ''
        })
        setShowAddStudentForm(false)
        fetchStudents() // Refresh the students list
      } else {
        toast.error('មានបញ្ហាក្នុងការបន្ថែមសិស្ស')
      }
    } catch (error) {
      toast.error('មានបញ្ហាក្នុងការបន្ថែមសិស្ស')
    } finally {
      setLoading(false)
    }
  }

  const getSelectedCourseName = () => {
    const course = courses.find(c => c.courseId.toString() === selectedCourse)
    return course ? `${course.courseName}${course.section}` : ''
  }

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8 p-6">
          {/* Modern Header Section */}
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-green-50/30 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-green-950/20 rounded-3xl -z-10" />
            
            <div className="text-center space-y-6 p-8">

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{students.length}</p>
                        <p className="text-lg text-blue-500 dark:text-blue-300 font-medium">សិស្សសរុប</p>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                
                <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{courses.length}</p>
                        <p className="text-lg text-purple-500 dark:text-purple-300 font-medium">ថ្នាក់សរុប</p>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                
                <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{schoolYears.length}</p>
                        <p className="text-lg text-green-500 dark:text-green-300 font-medium">ឆ្នាំសិក្សា</p>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800 font-medium">
            {error}
          </span>
          <div className="ml-auto flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setError(null)
                setDataLoading(true)
                fetchAllData()
              }}
            >
              ព្យាយាមម្តងទៀត
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setError(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">
            បានបន្ថែមសិស្សទៅក្នុងថ្នាក់ដោយជោគជ័យ!
          </span>
        </div>
      )}

      {/* Loading State */}
      {dataLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-blue-800 font-medium">
            កំពុងទាញយកទិន្នន័យ...
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Student Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enhanced Filters */}
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-indigo-50/20 to-blue-50/20 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-blue-950/10 rounded-3xl -z-10" />
            
            <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500">
              {/* Enhanced Header */}
              <CardHeader className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white p-8">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
                
                <div className="relative z-10 flex items-center space-x-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">ជ្រើសរើសសិស្ស</h2>
                    <div className="flex items-center space-x-3 mt-2">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        ឆ្នាំសិក្សា • ថ្នាក់ • ស្វែងរក
                      </Badge>
                      <div className="h-1 w-8 bg-white/30 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="schoolYear">ឆ្នាំសិក្សា</Label>
                  <Select value={selectedSchoolYear} onValueChange={setSelectedSchoolYear}>
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
                  <Label htmlFor="class">ថ្នាក់</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ទាំងអស់</SelectItem>
                      {uniqueClasses.map((classValue) => (
                        <SelectItem key={classValue} value={classValue}>
                          ថ្នាក់ទី {classValue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="search">ស្វែងរកសិស្ស</Label>
                  <div className="relative">
                    <Input
                      id="search"
                      placeholder="ឈ្មោះសិស្ស..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {/* Clear Filters Button */}
              {(selectedSchoolYear || (selectedClass && selectedClass !== 'all') || searchTerm) && (
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
        </div>

          {/* Enhanced Students List */}
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-pink-50/20 to-purple-50/20 dark:from-purple-950/10 dark:via-pink-950/10 dark:to-purple-950/10 rounded-3xl -z-10" />
            
            <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500">
              {/* Enhanced Header */}
              <CardHeader className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 text-white p-8">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
                
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">បញ្ជីសិស្ស</h2>
                      <div className="flex items-center space-x-3 mt-2">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                          {filteredStudents.length} សិស្ស
                        </Badge>
                        <div className="h-1 w-8 bg-white/30 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (selectedStudents.length === filteredStudents.length) {
                          setSelectedStudents([])
                        } else {
                          setSelectedStudents(filteredStudents.map(s => s.studentId))
                        }
                      }}
                      className="group px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center gap-2">
                        {selectedStudents.length === filteredStudents.length ? 'ដោះជ្រើសរើសទាំងអស់' : 'ជ្រើសរើសទាំងអស់'}
                      </div>
                    </Button>
                    
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      ជ្រើសរើស: {selectedStudents.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            <CardContent>
              {dataLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-32"></div>
                          <div className="h-3 bg-gray-300 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="w-16 h-6 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto">
                  {filteredStudents.map((student) => (
                  <div
                    key={student.studentId}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      isStudentEnrolled(student.studentId) 
                        ? 'border-gray-300 bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60' 
                        : selectedStudents.includes(student.studentId)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30'
                          : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                    }`}
                    onClick={() => !isStudentEnrolled(student.studentId) && handleStudentSelection(student.studentId)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedStudents.includes(student.studentId)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedStudents.includes(student.studentId) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ថ្នាក់ទី {student.class} • {student.gender === 'male' ? 'ប្រុស' : student.gender === 'female' ? 'ស្រី' : student.gender} • {student.schoolYear}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isStudentEnrolled(student.studentId) && (
                        <Badge variant="outline" className="text-xs">
                          បានចុះឈ្មោះរួចហើយ
                        </Badge>
                      )}
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                        {student.status === 'active' ? 'សកម្ម' : 'អសកម្ម'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {filteredStudents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>គ្មានសិស្សត្រូវបង្ហាញ</p>
                  </div>
                )}
              </div>
                )}
            </CardContent>
          </Card>
        </div>
        </div>

        {/* Right Column - Class Selection and Actions */}
        <div className="space-y-6">
          {/* Class Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>ជ្រើសរើសថ្នាក់ដើម្បីបញ្ចូលសិស្ស</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="course">ថ្នាក់</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCourses.map((course) => (
                      <SelectItem key={course.courseId} value={course.courseId.toString()}>
                        {course.courseName}{course.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedCourse && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    ថ្នាក់ដែលបានជ្រើសរើស:
                  </div>
                  <div className="text-blue-600 dark:text-blue-300">
                    {getSelectedCourseName()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>សិស្សដែលបានជ្រើសរើស ({selectedStudents.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>មិនទាន់មានសិស្សដែលបានជ្រើសរើស</p>
                  <p className="text-sm">សូមជ្រើសរើសសិស្សពីបញ្ជីខាងលើ</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {selectedStudents.map((studentId) => {
                    const student = students.find(s => s.studentId === studentId)
                    if (!student) return null
                    
                    return (
                      <div
                        key={student.studentId}
                        className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ថ្នាក់ទី {student.class} • {student.gender === 'male' ? 'ប្រុស' : student.gender === 'female' ? 'ស្រី' : student.gender} • {student.schoolYear}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStudentSelection(student.studentId)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <span className="text-sm">✕</span>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              
              {selectedStudents.length > 0 && (
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      សរុបសិស្សដែលបានជ្រើសរើស:
                    </span>
                    <span className="font-medium text-blue-600">
                      {selectedStudents.length} នាក់
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>សកម្មភាព</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  សិស្សដែលបានជ្រើសរើស: <span className="font-medium">{selectedStudents.length}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ថ្នាក់: <span className="font-medium">{selectedCourse ? getSelectedCourseName() : 'មិនទាន់ជ្រើសរើស'}</span>
                </div>
              </div>
              
              <Button
                onClick={handleAddStudentsToClass}
                disabled={selectedStudents.length === 0 || !selectedCourse || loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>កំពុងបន្ថែម...</span>
                  </div>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    បន្ថែមសិស្សទៅក្នុងថ្នាក់
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">សង្ខេប</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>សិស្សសរុប:</span>
                <span className="font-medium">{students.length}</span>
              </div>
              <div className="flex justify-between">
                <span>ថ្នាក់សរុប:</span>
                <span className="font-medium">{courses.length}</span>
              </div>
              <div className="flex justify-between">
                <span>ឆ្នាំសិក្សា:</span>
                <span className="font-medium">{schoolYears.length}</span>
              </div>
              {selectedCourse && (
                <div className="pt-3 border-t">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    សិស្សក្នុងថ្នាក់ {getSelectedCourseName()}:
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {enrollments.filter(e => 
                      e.courseId === parseInt(selectedCourse) && !e.drop
                    ).length}
                  </div>
                  <div className="text-xs text-gray-500">
                    សិស្សដែលបានចុះឈ្មោះ
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add New Student Modal */}
      {showAddStudentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">បន្ថែមសិស្សថ្មី</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddStudentForm(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">ឈ្មោះខ្លី *</Label>
                  <Input
                    id="firstName"
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="ឈ្មោះខ្លី"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">ឈ្មោះពេញ *</Label>
                  <Input
                    id="lastName"
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="ឈ្មោះពេញ"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">ភេទ *</Label>
                  <Select value={newStudent.gender} onValueChange={(value) => setNewStudent(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="ជ្រើសរើសភេទ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ប្រុស</SelectItem>
                      <SelectItem value="female">ស្រី</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dob">ថ្ងៃខែឆ្នាំកំណើត *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={newStudent.dob}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, dob: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="class">ថ្នាក់</Label>
                  <Input
                    id="class"
                    value={newStudent.class}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, class: e.target.value }))}
                    placeholder="ថ្នាក់ទី"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">លេខទូរស័ព្ទ</Label>
                  <Input
                    id="phone"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="លេខទូរស័ព្ទ"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolYear">ឆ្នាំសិក្សា</Label>
                  <Select value={newStudent.schoolYear} onValueChange={(value) => setNewStudent(prev => ({ ...prev, schoolYear: value }))}>
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
                  <Label htmlFor="religion">សាសនា</Label>
                  <Input
                    id="religion"
                    value={newStudent.religion}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, religion: e.target.value }))}
                    placeholder="សាសនា"
                  />
                </div>
                <div>
                  <Label htmlFor="health">សុខភាព</Label>
                  <Input
                    id="health"
                    value={newStudent.health}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, health: e.target.value }))}
                    placeholder="សុខភាព"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContact">លេខទូរស័ព្ទអាសន្ន</Label>
                  <Input
                    id="emergencyContact"
                    value={newStudent.emergencyContact}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    placeholder="លេខទូរស័ព្ទអាសន្ន"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddStudentForm(false)}
                >
                  បោះបង់
                </Button>
                <Button
                  onClick={handleAddNewStudent}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'កំពុងបន្ថែម...' : 'បន្ថែមសិស្ស'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
