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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  UserPlus, 
  Users, 
  BookOpen, 
  GraduationCap,
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Search
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
  
  // Confirmation dialog state
  const [addStudentsConfirmOpen, setAddStudentsConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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

    // Show confirmation dialog
    setAddStudentsConfirmOpen(true)
  }

  const handleConfirmAddStudents = async () => {
    setSubmitting(true)
    setAddStudentsConfirmOpen(false)
    
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
      setSubmitting(false)
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
    <div className="min-h-screen animate-fade-in">
      <div className="animate-fade-in">
        {/* Enhanced Error Message */}
        {error && (
          <div className="relative mb-6">
          <div className="bg-gradient-to-r from-red-50 via-red-50/80 to-red-50 dark:from-red-950/20 dark:via-red-950/10 dark:to-red-950/20 backdrop-blur-xl border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-1">
                  មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ
                </h3>
                <p className="text-red-700 dark:text-red-300 font-medium">
                  {error}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setError(null)
                    setDataLoading(true)
                    fetchAllData()
                  }}
                  className="bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  ព្យាយាមម្តងទៀត
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setError(null)}
                  className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20"
                >
                  ✕
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Success Message */}
      {showSuccess && (
        <div className="relative mb-6">
          <div className="bg-gradient-to-r from-green-50 via-green-50/80 to-green-50 dark:from-green-950/20 dark:via-green-950/10 dark:to-green-950/20 backdrop-blur-xl border-2 border-green-200 dark:border-green-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-1">
                  បានបន្ថែមសិស្សដោយជោគជ័យ!
                </h3>
                <p className="text-green-700 dark:text-green-300 font-medium">
                  សិស្សទាំងអស់ត្រូវបានបន្ថែមទៅក្នុងថ្នាក់ដោយជោគជ័យ
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">
        {/* Left Column - Student Selection (60%) */}
        <div className="space-y-8">
          {/* Modern Filters Section */}
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
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">ជ្រើសរើសសិស្ស</h2>
                    <div className="flex items-center space-x-4 mt-3">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                        ឆ្នាំសិក្សា • ថ្នាក់ • ស្វែងរក
                      </Badge>
                    </div>
                    <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4 space-y-6">
                {/* Modern Search and Filter Section */}
                <div className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/30 dark:border-blue-700/30 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                      <Label htmlFor="schoolYear" className="block text-base font-semibold mb-3 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        ឆ្នាំសិក្សា
                      </Label>
                      <Select value={selectedSchoolYear} onValueChange={setSelectedSchoolYear}>
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
                    <div className="md:col-span-1">
                      <Label htmlFor="class" className="block text-base font-semibold mb-3 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        ថ្នាក់
                      </Label>
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="h-12 text-base border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-200 bg-white dark:bg-gray-800 rounded-xl">
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
                    <div className="md:col-span-2">
                      <Label htmlFor="search" className="block text-base font-semibold mb-3 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        ស្វែងរកសិស្ស
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="search"
                          placeholder="ឈ្មោះសិស្ស..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="h-12 text-base border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-200 bg-white dark:bg-gray-800 rounded-xl pl-10 pr-12"
                        />
                        {searchTerm && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Clear Filters Button */}
                  {(selectedSchoolYear || (selectedClass && selectedClass !== 'all') || searchTerm) && (
                    <div className="flex justify-end mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-base px-4 py-2 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
                      >
                        លុបការច្រោះទាំងអស់
                      </Button>
                    </div>
                  )}
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Students List */}
        {/* Modern Student List Section */}
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
                
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">បញ្ជីសិស្ស</h2>
                      <div className="flex items-center space-x-4 mt-3">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                          {filteredStudents.length} សិស្ស
                        </Badge>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                          {selectedStudents.length} បានជ្រើសរើស
                        </Badge>
                      </div>
                      <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
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
                      className="group px-6 py-3 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center gap-2">
                        {selectedStudents.length === filteredStudents.length ? 'ដោះជ្រើសរើសទាំងអស់' : 'ជ្រើសរើសទាំងអស់'}
                      </div>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {dataLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl animate-pulse bg-white/50 dark:bg-gray-800/50">
                        <div className="flex items-center space-x-4">
                          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-40"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                          </div>
                        </div>
                        <div className="w-20 h-8 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-600 scrollbar-track-transparent hover:scrollbar-thumb-purple-400 dark:hover:scrollbar-thumb-purple-500 py-2 px-2">
                    {filteredStudents.map((student, index) => (
                      <div
                        key={student.studentId}
                        className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
                          isStudentEnrolled(student.studentId) 
                            ? 'border-2 border-gray-300 bg-gray-100/50 dark:bg-gray-800/50 cursor-not-allowed opacity-60' 
                            : selectedStudents.includes(student.studentId)
                              ? 'border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 cursor-pointer hover:shadow-lg hover:scale-[1.02]'
                              : 'border-2 border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 cursor-pointer hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg hover:scale-[1.02]'
                        }`}
                        onClick={() => !isStudentEnrolled(student.studentId) && handleStudentSelection(student.studentId)}
                      >
                        {/* Background Pattern */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                          selectedStudents.includes(student.studentId)
                            ? 'bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10'
                            : 'bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/10 dark:to-gray-700/10'
                        }`} />
                        
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Student Number Badge */}
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                              {index + 1}
                            </div>
                            
                            {/* Selection Checkbox */}
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              selectedStudents.includes(student.studentId)
                                ? 'border-purple-500 bg-purple-500 shadow-lg'
                                : 'border-gray-300 dark:border-gray-600 group-hover:border-purple-400'
                            }`}>
                              {selectedStudents.includes(student.studentId) && (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                                {student.lastName} {student.firstName}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                ថ្នាក់ទី {student.class} • {student.gender === 'male' ? 'ប្រុស' : student.gender === 'female' ? 'ស្រី' : student.gender} • {student.schoolYear}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isStudentEnrolled(student.studentId) && (
                              <Badge variant="outline" className="text-xs px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700">
                                បានចុះឈ្មោះរួចហើយ
                              </Badge>
                            )}
                            <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className={`text-xs px-3 py-1 ${
                              student.status === 'active' 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                            }`}>
                              {student.status === 'active' ? 'សកម្ម' : 'អសកម្ម'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredStudents.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="h-10 w-10 text-purple-500 dark:text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">គ្មានសិស្សត្រូវបង្ហាញ</h3>
                        <p className="text-gray-500 dark:text-gray-400">សូមព្យាយាមផ្លាស់ប្តូរការច្រោះរឺស្វែងរកពាក្យផ្សេង</p>
                      </div>
                    )}
              </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Modern Summary Section */}
        <div className="relative group">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-blue-50/20 to-purple-50/30 dark:from-indigo-950/20 dark:via-blue-950/15 dark:to-purple-950/20 rounded-3xl -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.05),transparent_50%)]" />
          
          <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 group-hover:scale-[1.02]">
            <CardHeader className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 text-white p-4">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
              
              <div className="relative z-10 flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">សង្ខេប</h2>
                  <div className="flex items-center space-x-4 mt-3">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                      ព័ត៌មានទូទៅ
                    </Badge>
                  </div>
                  <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Total Students */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                        {students.length}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        សិស្សសរុប
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Classes */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                        {courses.length}
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        ថ្នាក់សរុប
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total School Years */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                      <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                        {schoolYears.length}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                        ឆ្នាំសិក្សា
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Class-specific Statistics */}
              {selectedCourse && (
                <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-orange-800 dark:text-orange-200">
                        សិស្សក្នុងថ្នាក់ {getSelectedCourseName()}
                      </div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 text-center">
                    {enrollments.filter(e => 
                      e.courseId === parseInt(selectedCourse) && !e.drop
                    ).length}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400 font-medium text-center mt-2">
                    សិស្សដែលបានចុះឈ្មោះ
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        </div>

        {/* Right Column - Class Selection and Actions (40%) */}
        <div className="space-y-8">
          {/* Modern Class Selection */}
          <div className="relative group">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-emerald-50/20 to-green-50/30 dark:from-green-950/20 dark:via-emerald-950/15 dark:to-green-950/20 rounded-3xl -z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.05),transparent_50%)]" />
            
            <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 group-hover:scale-[1.02]">
              <CardHeader className="relative overflow-hidden bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white p-4">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700" />
                
                <div className="relative z-10 flex items-center space-x-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">ជ្រើសរើសថ្នាក់</h2>
                    <div className="flex items-center space-x-4 mt-3">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                        បញ្ចូលសិស្ស
                      </Badge>
                    </div>
                    <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 space-y-6">
                <div>
                  <Label htmlFor="course" className="block text-base font-semibold mb-3 text-green-700 dark:text-green-300 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    ថ្នាក់
                  </Label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="h-12 text-base border-2 border-green-200 focus:border-green-500 focus:ring-green-200 bg-white dark:bg-gray-800 rounded-xl">
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
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-xl shadow-sm">
                    <div className="text-base font-semibold text-green-800 dark:text-green-200 mb-2">
                      ថ្នាក់ដែលបានជ្រើសរើស: {getSelectedCourseName()}
                    </div>

                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Modern Selected Students */}
          <div className="relative group">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-amber-50/20 to-orange-50/30 dark:from-orange-950/20 dark:via-amber-950/15 dark:to-orange-950/20 rounded-3xl -z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.05),transparent_50%)]" />
            
            <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 group-hover:scale-[1.02]">
              <CardHeader className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white p-4">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700" />
                
                <div className="relative z-10 flex items-center space-x-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">សិស្សដែលបានជ្រើសរើស</h2>
                    <div className="flex items-center space-x-4 mt-3">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                        {selectedStudents.length} នាក់
                      </Badge>
                    </div>
                    <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                {selectedStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-10 w-10 text-orange-500 dark:text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">មិនទាន់មានសិស្សដែលបានជ្រើសរើស</h3>
                    <p className="text-gray-500 dark:text-gray-400">សូមជ្រើសរើសសិស្សពីបញ្ជីខាងលើ</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 dark:scrollbar-thumb-orange-600 scrollbar-track-transparent hover:scrollbar-thumb-orange-400 dark:hover:scrollbar-thumb-orange-500 py-2 px-2">
                    {selectedStudents.map((studentId, index) => {
                      const student = students.find(s => s.studentId === studentId)
                      if (!student) return null
                      
                      return (
                        <div
                          key={student.studentId}
                          className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {/* Student Number Badge */}
                              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                                {index + 1}
                              </div>
                              
                              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                <span className="text-sm font-bold text-orange-600 dark:text-orange-300">
                                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                                </span>
                              </div>
                              
                              <div className="flex-1">
                                <div className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors duration-300">
                                  {student.lastName} {student.firstName}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                  ថ្នាក់ទី {student.class} • {student.gender === 'male' ? 'ប្រុស' : student.gender === 'female' ? 'ស្រី' : student.gender} • {student.schoolYear}
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStudentSelection(student.studentId)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl p-2 group-hover:scale-110 transition-all duration-300"
                            >
                              <span className="text-lg">✕</span>
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
          
          {/* Modern Actions */}
          <div className="relative group">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-teal-50/20 to-emerald-50/30 dark:from-emerald-950/20 dark:via-teal-950/15 dark:to-emerald-950/20 rounded-3xl -z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_50%)]" />
            
            <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 group-hover:scale-[1.02]">
              <CardHeader className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white p-4">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700" />
                
                <div className="relative z-10 flex items-center space-x-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">សកម្មភាព</h2>
                    <div className="flex items-center space-x-4 mt-3">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                        បន្ថែមសិស្ស
                      </Badge>
                    </div>
                    <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                    <div className="text-base font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                      សិស្សដែលបានជ្រើសរើស: <span className="text-emerald-600 dark:text-emerald-400">{selectedStudents.length}</span>
                    </div>
                    <div className="text-base font-semibold text-emerald-800 dark:text-emerald-200">
                      <span className="text-emerald-600 dark:text-emerald-400">{selectedCourse ? getSelectedCourseName() : 'មិនទាន់ជ្រើសរើស'}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleAddStudentsToClass}
                    disabled={selectedStudents.length === 0 || !selectedCourse || submitting}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {submitting ? (
                      <div className="flex items-center space-x-3">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>កំពុងបន្ថែម...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Plus className="h-5 w-5" />
                        <span>បន្ថែមសិស្សទៅក្នុងថ្នាក់</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

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

      {/* Add Students Confirmation Dialog */}
      <AlertDialog open={addStudentsConfirmOpen} onOpenChange={setAddStudentsConfirmOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              បញ្ជាក់ការបន្ថែមសិស្ស
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              <span>តើអ្នកប្រាកដជាចង់បន្ថែមសិស្ស {selectedStudents.length} នាក់ទៅក្នុងថ្នាក់ {getSelectedCourseName()} ឬទេ?</span>
              <br /><br />
              <span className="font-semibold text-blue-600">សិស្សដែលជ្រើសរើស:</span>
              <br />
              <span className="text-base">
                {selectedStudents.map((studentId, index) => {
                  const student = students.find(s => s.studentId === studentId)
                  return student ? `${student.firstName} ${student.lastName}` : ''
                }).filter(name => name).join(', ')}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel 
              onClick={() => setAddStudentsConfirmOpen(false)}
              className="px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              បោះបង់
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAddStudents}
              disabled={submitting}
              className="px-4 py-2 text-base font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  កំពុងបន្ថែម...
                </div>
              ) : (
                'បន្ថែមសិស្សទៅក្នុងថ្នាក់'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  )
}
